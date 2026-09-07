const prisma = require('../config/database');
const { paginate, buildPagination } = require('../utils/apiResponse');

const getAll = async (query) => {
  const { skip, take, page, limit } = paginate(query.page, query.limit);
  const where = {};
  if (query.search) {
    where.OR = [
      { name: { contains: query.search } },
      { description: { contains: query.search } },
    ];
  }

  const [roles, total] = await Promise.all([
    prisma.role.findMany({ where, skip, take, orderBy: { name: 'asc' }, include: { _count: { select: { users: true } } } }),
    prisma.role.count({ where }),
  ]);

  const result = roles.map((r) => ({
    ...r,
    permissions: JSON.parse(r.permissions || '[]'),
    users: r._count.users,
    _count: undefined,
  }));

  return { roles: result, pagination: buildPagination(total, page, limit) };
};

const getById = async (id) => {
  const role = await prisma.role.findUnique({ where: { id }, include: { _count: { select: { users: true } } } });
  if (!role) throw Object.assign(new Error('Role not found'), { statusCode: 404 });
  return { ...role, permissions: JSON.parse(role.permissions || '[]'), users: role._count.users };
};

const create = async (data) => {
  if (data.permissions && Array.isArray(data.permissions)) {
    data.permissions = JSON.stringify(data.permissions);
  }
  return prisma.role.create({ data });
};

const update = async (id, data) => {
  await prisma.role.findUniqueOrThrow({ where: { id } }).catch(() => {
    throw Object.assign(new Error('Role not found'), { statusCode: 404 });
  });
  if (data.permissions && Array.isArray(data.permissions)) {
    data.permissions = JSON.stringify(data.permissions);
  }
  return prisma.role.update({ where: { id }, data });
};

const remove = async (id) => {
  await prisma.role.findUniqueOrThrow({ where: { id } }).catch(() => {
    throw Object.assign(new Error('Role not found'), { statusCode: 404 });
  });
  await prisma.role.delete({ where: { id } });
};

module.exports = { getAll, getById, create, update, remove };
