const prisma = require('../config/database');
const { paginate, buildPagination } = require('../utils/apiResponse');

const getAll = async (query) => {
  const { skip, take, page, limit } = paginate(query.page, query.limit);
  const where = {};
  if (query.search) {
    where.OR = [
      { name: { contains: query.search } },
      { address: { contains: query.search } },
      { description: { contains: query.search } },
    ];
  }

  const [publishers, total] = await Promise.all([
    prisma.publisher.findMany({ where, skip, take, orderBy: { name: 'asc' }, include: { _count: { select: { books: true } } } }),
    prisma.publisher.count({ where }),
  ]);

  const result = publishers.map((p) => ({ ...p, bookCount: p._count.books, _count: undefined }));
  return { publishers: result, pagination: buildPagination(total, page, limit) };
};

const getAllSimple = async () => {
  return prisma.publisher.findMany({ orderBy: { name: 'asc' }, include: { _count: { select: { books: true } } } });
};

const getById = async (id) => {
  const publisher = await prisma.publisher.findUnique({ where: { id }, include: { books: true, _count: { select: { books: true } } } });
  if (!publisher) throw Object.assign(new Error('Publisher not found'), { statusCode: 404 });
  return { ...publisher, bookCount: publisher._count.books };
};

const create = async (data) => {
  return prisma.publisher.create({ data });
};

const update = async (id, data) => {
  await prisma.publisher.findUniqueOrThrow({ where: { id } }).catch(() => {
    throw Object.assign(new Error('Publisher not found'), { statusCode: 404 });
  });
  return prisma.publisher.update({ where: { id }, data });
};

const remove = async (id) => {
  await prisma.publisher.findUniqueOrThrow({ where: { id } }).catch(() => {
    throw Object.assign(new Error('Publisher not found'), { statusCode: 404 });
  });
  await prisma.publisher.delete({ where: { id } });
};

module.exports = { getAll, getAllSimple, getById, create, update, remove };
