import * as Router from 'express';
import * as eventsController from '../controllers/eventsController.js';
import * as activityEventsController from '../controllers/activityEventsController.js';
import * as adminAuthMiddleware from '../middleware/adminAuthMiddleware.js';
import * as coreTeamController from '../controllers/coreTeamController.js';
import * as eventRegistrationController from '../controllers/eventRegistrationController.js';
import * as usersController from '../controllers/usersController.js';

const router = Router();

// Public
router.get('/api/users', usersController.getPublicUsers);
router.get('/api/content/events', eventsController.listEvents);
router.post('/api/content/events/:eventId/register', eventRegistrationController.registerForEvent);
router.get(
  '/api/content/activity-events/:activityKey',
  activityEventsController.listActivityEvents
);
router.post(
  '/api/content/activity-events/:activityKey',
  adminAuthMiddleware.requireScope('events:write'),
  activityEventsController.addActivityEvent
);
router.delete(
  '/api/content/activity-events/:activityKey/:eventId',
  adminAuthMiddleware.requireScope('events:write'),
  activityEventsController.deleteActivityEvent
);

// Admin auth
router.get('/api/admin/users', adminAuthMiddleware.requireAdmin, usersController.getAdminUsers);
router.post('/api/admin/login', adminAuthMiddleware.login);
router.post('/api/admin/logout', adminAuthMiddleware.requireAdmin, adminAuthMiddleware.logout);

router.get(
  '/api/admin/events',
  adminAuthMiddleware.requireScope('events:read'),
  eventsController.adminListEvents
);
router.post(
  '/api/admin/events',
  adminAuthMiddleware.requireScope('events:write'),
  eventsController.adminCreateEvent
);
router.put(
  '/api/admin/events/:id',
  adminAuthMiddleware.requireScope('events:write'),
  eventsController.adminUpdateEvent
);
router.delete(
  '/api/admin/events/:id',
  adminAuthMiddleware.requireScope('events:write'),
  eventsController.adminDeleteEvent
);

// Core team management APIs
router.get(
  '/api/admin/core-team/members',
  adminAuthMiddleware.requireScope('settings:admin'),
  coreTeamController.adminListCoreTeamMembers
);
router.post(
  '/api/admin/core-team/members',
  adminAuthMiddleware.requireScope('settings:admin'),
  coreTeamController.adminAddCoreTeamMember
);
router.delete(
  '/api/admin/core-team/members/:id',
  adminAuthMiddleware.requireScope('settings:admin'),
  coreTeamController.adminDeleteCoreTeamMember
);

export default router;
