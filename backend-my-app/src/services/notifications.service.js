const prisma = require('../config/database');
const { paginate, buildPagination } = require('../utils/apiResponse');

const getAll = async (userId, query) => {
  const { skip, take, page, limit } = paginate(query.page, query.limit);
  const where = { userId };
  if (query.unreadOnly) where.read = false;

  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
    prisma.notification.count({ where }),
  ]);

  return { notifications, pagination: buildPagination(total, page, limit) };
};

const markAsRead = async (id, userId) => {
  const notification = await prisma.notification.findFirst({ where: { id, userId } });
  if (!notification) throw Object.assign(new Error('Notification not found'), { statusCode: 404 });
  return prisma.notification.update({ where: { id }, data: { read: true } });
};

const markAllAsRead = async (userId) => {
  await prisma.notification.updateMany({ where: { userId, read: false }, data: { read: true } });
};

const getUnreadCount = async (userId) => {
  const count = await prisma.notification.count({ where: { userId, read: false } });
  return { count };
};

const create = async (data) => {
  return prisma.notification.create({ data });
};

module.exports = { getAll, markAsRead, markAllAsRead, getUnreadCount, create };
