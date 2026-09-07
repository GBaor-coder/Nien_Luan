const notificationsService = require('../services/notifications.service');
const { sendSuccess } = require('../utils/apiResponse');

const getAll = async (req, res, next) => {
  try {
    const result = await notificationsService.getAll(req.user.id, req.query);
    return sendSuccess(res, result);
  } catch (err) { next(err); }
};

const markAsRead = async (req, res, next) => {
  try {
    const notification = await notificationsService.markAsRead(req.params.id, req.user.id);
    return sendSuccess(res, notification, 'Notification marked as read');
  } catch (err) { next(err); }
};

const markAllAsRead = async (req, res, next) => {
  try {
    await notificationsService.markAllAsRead(req.user.id);
    return sendSuccess(res, null, 'All notifications marked as read');
  } catch (err) { next(err); }
};

const getUnreadCount = async (req, res, next) => {
  try {
    const result = await notificationsService.getUnreadCount(req.user.id);
    return sendSuccess(res, result);
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const notification = await notificationsService.create(req.body);
    return sendSuccess(res, notification, 'Notification created', 201);
  } catch (err) { next(err); }
};

module.exports = { getAll, markAsRead, markAllAsRead, getUnreadCount, create };
