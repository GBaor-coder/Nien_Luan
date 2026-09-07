const crypto = require('crypto');
const prisma = require('../config/database');
const { paginate, buildPagination } = require('../utils/apiResponse');
const { calculateBookStatus } = require('../utils/helpers');

const generateIsbn = () => {
  const digits = `978${crypto.randomInt(0, 1e9).toString().padStart(9, '0')}`;
  const sum = digits.split('').reduce((acc, d, i) => acc + (+d) * (i % 2 === 0 ? 1 : 3), 0);
  const check = (10 - (sum % 10)) % 10;
  return `${digits}${check}`.replace(/(\d{3})(\d)(\d{4})(\d{4})(\d)/, '$1-$2-$3-$4-$5');
};

const generateUniqueIsbn = async () => {
  for (let i = 0; i < 10; i++) {
    const isbn = generateIsbn();
    const existing = await prisma.book.findUnique({ where: { isbn } });
    if (!existing) return isbn;
  }
  throw Object.assign(new Error('Could not generate a unique ISBN'), { statusCode: 500 });
};

const getAll = async (query) => {
  const { skip, take, page, limit } = paginate(query.page, query.limit);
  const where = {};

  if (query.search) {
    where.OR = [
      { title: { contains: query.search } },
      { isbn: { contains: query.search } },
      { author: { name: { contains: query.search } } },
    ];
  }
  if (query.categoryId) where.categoryId = query.categoryId;
  if (query.authorId) where.authorId = query.authorId;
  if (query.publisherId) where.publisherId = query.publisherId;
  if (query.status) where.status = query.status;

  const orderBy = {};
  if (query.sort === 'author') orderBy.author = { name: query.order };
  else if (query.sort === 'category') orderBy.category = { name: query.order };
  else orderBy[query.sort] = query.order;

  const [books, total] = await Promise.all([
    prisma.book.findMany({ where, skip, take, orderBy, include: { category: true, author: true, publisher: true } }),
    prisma.book.count({ where }),
  ]);

  return { books, pagination: buildPagination(total, page, limit) };
};

const getById = async (id) => {
  const book = await prisma.book.findUnique({ where: { id }, include: { category: true, author: true, publisher: true, copies: true } });
  if (!book) throw Object.assign(new Error('Book not found'), { statusCode: 404 });
  return book;
};

const createBookCopies = async (tx, book, count) => {
  const copies = [];
  for (let i = 1; i <= count; i++) {
    const suffix = crypto.randomBytes(3).toString('hex').toUpperCase();
    const barcode = `LIB-${suffix}-${String(i).padStart(4, '0')}`;
    copies.push(
      tx.bookCopy.create({
        data: {
          barcode,
          condition: 'new',
          shelfLocation: book.location || null,
          status: 'available',
          book: { connect: { id: book.id } },
        },
      })
    );
  }
  return Promise.all(copies);
};

const create = async (data) => {
  if (data.quantity !== undefined && data.available === undefined) {
    data.available = data.quantity;
  }
  if (data.quantity !== undefined && data.available !== undefined) {
    data.status = calculateBookStatus(data.available, data.quantity);
  }
  if (!data.isbn) {
    data.isbn = await generateUniqueIsbn();
  }
  const book = await prisma.book.create({ data, include: { category: true, author: true, publisher: true } });

  const copyCount = data.available || data.quantity || 1;
  await createBookCopies(prisma, book, copyCount);

  return book;
};

const update = async (id, data) => {
  const existing = await prisma.book.findUniqueOrThrow({ where: { id }, include: { copies: true } }).catch(() => {
    throw Object.assign(new Error('Book not found'), { statusCode: 404 });
  });
  if (!data.isbn) {
    delete data.isbn;
    if (!existing.isbn) data.isbn = await generateUniqueIsbn();
  }
  if (data.quantity !== undefined && data.available !== undefined) {
    data.status = calculateBookStatus(data.available, data.quantity);
  }
  const book = await prisma.book.update({ where: { id }, data, include: { category: true, author: true, publisher: true } });

  if (data.quantity !== undefined || data.available !== undefined) {
    const targetAvailable = data.available !== undefined ? data.available : book.available;
    const currentCopies = existing.copies || [];
    const availableCopies = currentCopies.filter((c) => c.status === 'available');
    const diff = targetAvailable - availableCopies.length;

    if (diff > 0) {
      for (let i = 1; i <= diff; i++) {
        const idx = currentCopies.length + i;
        const suffix = crypto.randomBytes(3).toString('hex').toUpperCase();
        const barcode = `LIB-${suffix}-${String(idx).padStart(4, '0')}`;
        await prisma.bookCopy.create({
          data: {
            barcode,
            condition: 'new',
            shelfLocation: book.location || null,
            status: 'available',
            bookId: book.id,
          },
        });
      }
    }
  }

  return book;
};

const remove = async (id) => {
  await prisma.book.findUniqueOrThrow({ where: { id } }).catch(() => {
    throw Object.assign(new Error('Book not found'), { statusCode: 404 });
  });

  await prisma.$transaction([
    prisma.fine.deleteMany({ where: { borrowRecord: { bookId: id } } }),
    prisma.bookStats.deleteMany({ where: { bookId: id } }),
    prisma.bookTag.deleteMany({ where: { bookId: id } }),
    prisma.review.deleteMany({ where: { bookId: id } }),
    prisma.reservation.deleteMany({ where: { bookId: id } }),
    prisma.borrowRecord.deleteMany({ where: { bookId: id } }),
    prisma.bookCopy.deleteMany({ where: { bookId: id } }),
    prisma.book.delete({ where: { id } }),
  ]);
};

const syncBookCopies = async () => {
  const books = await prisma.book.findMany({ include: { copies: true } });
  let fixed = 0;
  let syncAvailable = 0;
  for (const book of books) {
    const availableCopies = book.copies.filter((c) => c.status === 'available');
    if (availableCopies.length === 0 && book.available > 0) {
      await createBookCopies(prisma, book, book.available);
      fixed++;
    }
    if (book.available !== availableCopies.length) {
      await prisma.book.update({
        where: { id: book.id },
        data: {
          available: availableCopies.length,
          status: calculateBookStatus(availableCopies.length, book.quantity),
        },
      });
      syncAvailable++;
    }
  }
  return { total: books.length, fixed, syncAvailable };
};

module.exports = { getAll, getById, create, update, remove, syncBookCopies };
