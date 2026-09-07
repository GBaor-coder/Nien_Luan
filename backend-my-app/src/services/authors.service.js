const prisma = require('../config/database');
const { paginate, buildPagination } = require('../utils/apiResponse');

const getAll = async (query) => {
  const { skip, take, page, limit } = paginate(query.page, query.limit);
  const where = {};
  if (query.search) {
    where.OR = [
      { name: { contains: query.search } },
      { nationality: { contains: query.search } },
    ];
  }

  const [authors, total] = await Promise.all([
    prisma.author.findMany({ where, skip, take, orderBy: { name: 'asc' }, include: { _count: { select: { books: true } } } }),
    prisma.author.count({ where }),
  ]);

  return { authors, pagination: buildPagination(total, page, limit) };
};

const getById = async (id) => {
  const author = await prisma.author.findUnique({ where: { id }, include: { _count: { select: { books: true } } } });
  if (!author) throw Object.assign(new Error('Author not found'), { statusCode: 404 });
  return author;
};

const create = async (data) => {
  return prisma.author.create({ data });
};

const update = async (id, data) => {
  await prisma.author.findUniqueOrThrow({ where: { id } }).catch(() => {
    throw Object.assign(new Error('Author not found'), { statusCode: 404 });
  });
  return prisma.author.update({ where: { id }, data });
};

const remove = async (id) => {
  await prisma.author.findUniqueOrThrow({ where: { id } }).catch(() => {
    throw Object.assign(new Error('Author not found'), { statusCode: 404 });
  });
  await prisma.author.delete({ where: { id } });
};

module.exports = { getAll, getById, create, update, remove };
