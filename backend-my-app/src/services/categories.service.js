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

  const [categories, total] = await Promise.all([
    prisma.category.findMany({ where, skip, take, orderBy: { name: 'asc' }, include: { _count: { select: { books: true } } } }),
    prisma.category.count({ where }),
  ]);

  const result = categories.map((c) => ({ ...c, bookCount: c._count.books, _count: undefined }));
  return { categories: result, pagination: buildPagination(total, page, limit) };
};

const getAllSimple = async () => {
  return prisma.category.findMany({ orderBy: { name: 'asc' }, include: { _count: { select: { books: true } } } });
};

const getById = async (id) => {
  const category = await prisma.category.findUnique({ where: { id }, include: { books: true, _count: { select: { books: true } } } });
  if (!category) throw Object.assign(new Error('Category not found'), { statusCode: 404 });
  return { ...category, bookCount: category._count.books };
};

const create = async (data) => {
  const category = await prisma.category.create({ data });
  return category;
};

const update = async (id, data) => {
  await prisma.category.findUniqueOrThrow({ where: { id } }).catch(() => {
    throw Object.assign(new Error('Category not found'), { statusCode: 404 });
  });
  return prisma.category.update({ where: { id }, data });
};

const remove = async (id) => {
  await prisma.category.findUniqueOrThrow({ where: { id } }).catch(() => {
    throw Object.assign(new Error('Category not found'), { statusCode: 404 });
  });
  await prisma.category.delete({ where: { id } });
};

module.exports = { getAll, getAllSimple, getById, create, update, remove };
