import { notificationPreferencesRepository } from '../repositories/notificationPreferencesRepository.js';
import { notificationAnalyticsRepository } from '../repositories/notificationAnalyticsRepository.js';
import { pushSubscriptionsRepository } from '../repositories/pushSubscriptionsRepository.js';
import { notificationsRepository } from '../repositories/notificationsRepository.js';
import { HAS_SUPABASE, supabaseRequest } from '../storage/supabaseClient.js';
import { createDigestPayload } from './notificationBatcher.js';
import webpush from 'web-push';

/**
 * Orchestrates notification delivery based on user preferences and behavior.
 */
class NotificationsService {
  constructor() {
    if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
      webpush.setVapidDetails(
        'mailto:admin@nexasphere.com',
        process.env.VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
      );
    }
  }

  async addNotification(userId, data) {
    const { type = 'info', priority = 'normal', title, message, link = null } = data;

    // 1. Smart Fatigue Adjustment
    const activity = await notificationAnalyticsRepository.getUserActivityMetrics(userId);
    const prefs = await notificationPreferencesRepository.get(userId);
    const config = prefs?.types?.[type] || { push: true, frequency: 'immediate' };

    if (!config.push) return; // Opted out

    let effectiveFrequency = config.frequency;

    // Feature: If user hasn't opened app in 5 days, increase frequency (bypass digest)
    if (activity.daysSinceLastActive >= 5 && effectiveFrequency !== 'disabled') {
      effectiveFrequency = 'immediate';
    }
    // Feature: If user opens app 10+ times per day, reduce frequency for low-priority items
    if (activity.dailyActiveCount >= 10 && type === 'recommendations') {
      effectiveFrequency = 'daily_digest';
    }

    // 2. Check DND status (critical notifications bypass DND)
    const isDND = await notificationPreferencesRepository.isDNDActive(userId);
    if (isDND && priority !== 'high') {
      await this.queueForLater(userId, data, 'dnd');
      return;
    }

    // Create the notification record in DB
    const id =
      data.id ||
      (typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : Math.random().toString(36).substring(2));
    const note = await notificationsRepository.create({
      id,
      userId,
      type,
      title,
      message,
      link,
      isRead: data.isRead || false,
    });

    if (effectiveFrequency === 'immediate') {
      // 3. Check Quiet Hours
      const inQuietHours = await notificationPreferencesRepository.isInsideQuietHours(userId);
      if (inQuietHours && priority !== 'high') {
        await this.queueForLater(userId, { ...data, id }, 'quiet_hours');
        return note;
      }
      await this.sendNow(userId, { ...data, id });
    } else if (effectiveFrequency !== 'disabled') {
      await this.addToDigest(userId, effectiveFrequency, { ...data, id });
    }

    return note;
  }

  async sendNow(userId, data) {
    const subs = await pushSubscriptionsRepository.listByUser(userId);
    const payload = JSON.stringify({
      notification: {
        title: data.title,
        body: data.message,
        icon: '/pwa-192x192.png',
        data: { link: data.link || '/', type: data.type, id: data.id },
        actions: data.actions || [{ action: 'dismiss', title: 'Dismiss' }],
      },
    });

    await Promise.allSettled(
      subs.map(async (sub) => {
        try {
          await webpush.sendNotification(sub, payload);
          await notificationAnalyticsRepository.logEvent(userId, data.id, 'delivered');
        } catch (err) {
          if (err.statusCode === 410) await pushSubscriptionsRepository.remove(sub.endpoint);
        }
      })
    );
  }

  async addToDigest(userId, frequency, data) {
    if (!HAS_SUPABASE) return;
    await supabaseRequest('pending_digests', {
      method: 'POST',
      body: [{ user_id: userId, frequency, notification_data: data }],
    });
  }

  async queueForLater(userId, data, reason) {
    if (!HAS_SUPABASE) return;
    await supabaseRequest('queued_notifications', {
      method: 'POST',
      body: [{ user_id: userId, reason, notification_data: data }],
    });
  }

  /**
   * Smart Batching: Group multiple items into a single summary notification
   */
  async processDigests(frequency) {
    const digests = await supabaseRequest(`pending_digests?frequency=eq.${frequency}`);
    if (!digests || digests.length === 0) return;

    const userGroups = digests.reduce((acc, d) => {
      acc[d.user_id] = acc[d.user_id] || [];
      acc[d.user_id].push(d.notification_data);
      return acc;
    }, {});

    for (const [userId, items] of Object.entries(userGroups)) {
      if (items.length === 1) {
        await this.sendNow(userId, items[0]);
      } else {
        const digest = createDigestPayload(userId, items, frequency);
        await this.sendNow(userId, {
          id: `digest-${Date.now()}`,
          title: digest.title,
          message: digest.body,
          type: 'digest',
          link: '/notifications',
        });
      }
    }
    // Cleanup processed digests
    await supabaseRequest(`pending_digests?frequency=eq.${frequency}`, { method: 'DELETE' });
  }

  async flushQueuedNotifications() {
    if (!HAS_SUPABASE) return;
    const queued = await supabaseRequest('queued_notifications');
    if (!queued || queued.length === 0) return;

    const userGroups = queued.reduce((acc, d) => {
      acc[d.user_id] = acc[d.user_id] || [];
      acc[d.user_id].push(d);
      return acc;
    }, {});

    for (const [userId, records] of Object.entries(userGroups)) {
      const isDND = await notificationPreferencesRepository.isDNDActive(userId);
      const inQuietHours = await notificationPreferencesRepository.isInsideQuietHours(userId);
      
      if (!isDND && !inQuietHours) {
        const items = records.map(r => r.notification_data);
        if (items.length === 1) {
          await this.sendNow(userId, items[0]);
        } else {
          const digest = createDigestPayload(userId, items, 'batch');
          await this.sendNow(userId, {
            id: `digest-${Date.now()}`,
            title: 'While you were away',
            message: digest.body,
            type: 'digest',
            link: '/notifications',
          });
        }
        
        // Remove delivered notifications from queue
        // In real world, we might do a bulk delete by user ID or IDs array
        await supabaseRequest(`queued_notifications?user_id=eq.${userId}`, { method: 'DELETE' });
      }
    }
  }

  // CRUD Pass-throughs for Repository
  async getNotifications(userId, offset, limit) {
    return notificationsRepository.list({ userId, limit, offset });
  }
  async markAsRead(userId, id) {
    return notificationsRepository.markAsRead(userId, id);
  }
  async markAllAsRead(userId) {
    return notificationsRepository.markAllAsRead(userId);
  }
  async clearAll(userId) {
    return notificationsRepository.clearAll(userId);
  }
  async removeNotification(userId, id) {
    return notificationsRepository.remove(userId, id);
  }
}

const notificationsService = new NotificationsService();
export default notificationsService;

export const addNotification = notificationsService.addNotification.bind(notificationsService);
export const getNotifications = notificationsService.getNotifications.bind(notificationsService);
export const markAsRead = notificationsService.markAsRead.bind(notificationsService);
export const markAllAsRead = notificationsService.markAllAsRead.bind(notificationsService);
export const clearAll = notificationsService.clearAll.bind(notificationsService);
export const removeNotification =
  notificationsService.removeNotification.bind(notificationsService);
