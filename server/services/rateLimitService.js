import { Redis } from 'ioredis';
import { RedisStore } from 'rate-limit-redis';
import logger from '../utils/logger.js';

let redisClient = null;

// Determine available Redis URL
const redisUrl = process.env.REDIS_URL || process.env.UPSTASH_REDIS_REST_URL;

if (redisUrl) {
  try {
    redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: 1,
      retryStrategy(times) {
        // Stop retrying after 3 attempts to allow graceful fallback to memory
        if (times > 3) {
          logger.warn(
            '[RateLimiter] Redis unreachable after 3 retries, falling back to memory store if necessary.'
          );
          return null;
        }
        return Math.min(times * 100, 2000);
      },
    });

    redisClient.on('error', (err) => {
      logger.warn('[RateLimiter] Redis connection error:', err.message);
    });

    redisClient.on('connect', () => {
      logger.info('[RateLimiter] Successfully connected to Redis rate limit store.');
    });
  } catch (err) {
    logger.warn('[RateLimiter] Failed to initialize Redis client:', err.message);
    redisClient = null;
  }
}

/**
 * Creates a rate limit store. Uses Redis if configured and reachable,
 * otherwise returns undefined to force express-rate-limit to fall back
 * gracefully to its built-in memory store.
 *
 * @param {string} prefix The Redis key prefix to isolate limiters
 * @returns {RedisStore | undefined}
 */
export function createRateLimitStore(prefix) {
  if (redisClient) {
    return new RedisStore({
      // @ts-expect-error - rate-limit-redis v3 uses sendCommand with ioredis
      sendCommand: (...args) => redisClient.call(...args),
      prefix: prefix,
    });
  }
  return undefined;
}

// For testing purposes
export function _getRedisClient() {
  return redisClient;
}

export function _closeRedis() {
  if (redisClient) {
    redisClient.quit();
  }
}
