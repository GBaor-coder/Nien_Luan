const router = require('express').Router();
const notificationsController = require('../controllers/notifications.controller');
const { validate } = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const { notificationSchema } = require('../validations/notifications.validation');

router.get('/unread-count', authenticate, notificationsController.getUnreadCount);
router.get('/', authenticate, notificationsController.getAll);
router.post('/', authenticate, authorize('admin'), validate(notificationSchema), notificationsController.create);
router.put('/mark-all-read', authenticate, notificationsController.markAllAsRead);
router.put('/:id/read', authenticate, notificationsController.markAsRead);

module.exports = router;
