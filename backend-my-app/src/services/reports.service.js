const prisma = require('../config/database');

const borrowingReport = async (query) => {
  const where = {};
  if (query.startDate) where.borrowDate = { ...where.borrowDate, gte: new Date(query.startDate) };
  if (query.endDate) where.borrowDate = { ...where.borrowDate, lte: new Date(query.endDate) };
  if (query.status) where.status = query.status;

  const monthConditions = [];
  const monthParams = [];
  if (query.startDate) { monthConditions.push('borrowDate >= ?'); monthParams.push(new Date(query.startDate)); }
  if (query.endDate) { monthConditions.push('borrowDate <= ?'); monthParams.push(new Date(query.endDate)); }
  if (monthConditions.length === 0) monthConditions.push("borrowDate >= DATE_SUB(NOW(), INTERVAL 12 MONTH)");

  const [records, total, byStatus, byMonth] = await Promise.all([
    prisma.borrowRecord.findMany({
      where, orderBy: { borrowDate: 'desc' },
      include: {
        student: { include: { user: { select: { name: true } } } },
        teacher: { include: { user: { select: { name: true } } } },
        book: true,
      },
    }),
    prisma.borrowRecord.count({ where }),
    prisma.borrowRecord.groupBy({ by: ['status'], where, _count: true }),
    prisma.$queryRawUnsafe(`
      SELECT DATE_FORMAT(borrowDate, '%Y-%m') AS month,
             COUNT(*) AS count,
             SUM(CASE WHEN status = 'returned' THEN 1 ELSE 0 END) AS returned
      FROM BorrowRecord
      WHERE ${monthConditions.join(' AND ')}
      GROUP BY month
      ORDER BY month ASC
    `, ...monthParams),
  ]);

  return {
    records, total,
    byStatus: byStatus.map((s) => ({ status: s.status, count: s._count })),
    byMonth: byMonth.map((m) => ({ month: m.month, count: Number(m.count), returned: Number(m.returned) })),
  };
};

const bookReport = async (query) => {
  const where = {};
  if (query.categoryId) where.categoryId = query.categoryId;
  if (query.authorId) where.authorId = query.authorId;

  const [books, total, byCategory, byStatus, mostBorrowed] = await Promise.all([
    prisma.book.findMany({
      where, orderBy: { title: 'asc' },
      include: { category: true, author: true, publisher: true },
    }),
    prisma.book.count({ where }),
    prisma.book.groupBy({ by: ['categoryId'], _count: true, _sum: { quantity: true, available: true } }),
    prisma.book.groupBy({ by: ['status'], _count: true }),
    prisma.borrowRecord.groupBy({
      by: ['bookId'], _count: true, orderBy: { _count: { bookId: 'desc' } }, take: 10,
    }),
  ]);

  const topBooks = await Promise.all(
    mostBorrowed.map(async (b) => {
      const book = await prisma.book.findUnique({ where: { id: b.bookId } });
      return { ...book, borrowCount: b._count };
    })
  );

  return {
    books, total,
    byCategory: byCategory.map((c) => ({ categoryId: c.categoryId, count: c._count, totalQuantity: c._sum.quantity, totalAvailable: c._sum.available })),
    byStatus: byStatus.map((s) => ({ status: s.status, count: s._count })),
    mostBorrowed: topBooks,
  };
};

const readerReport = async () => {
  const [students, teachers] = await Promise.all([
    prisma.student.findMany({ include: { user: { select: { name: true, email: true } } }, orderBy: { user: { name: 'asc' } } }),
    prisma.teacher.findMany({ include: { user: { select: { name: true, email: true } } }, orderBy: { user: { name: 'asc' } } }),
  ]);

  const readers = [
    ...students.map((s) => ({ ...s, type: 'student', status: s.status })),
    ...teachers.map((t) => ({ ...t, type: 'teacher', status: t.status })),
  ];

  const total = readers.length;
  const activeCount = readers.filter((r) => r.status === 'active').length;
  const byStatus = readers.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});

  const topBorrowerRows = await prisma.borrowRecord.groupBy({
    by: ['readerId'],
    _count: { readerId: true },
    orderBy: { _count: { readerId: 'desc' } },
    take: 10,
  });

  const topReaders = await Promise.all(
    topBorrowerRows.map(async (b) => {
      const user = await prisma.user.findUnique({
        where: { id: b.readerId },
        include: {
          student: { include: { user: { select: { name: true } } } },
          teacher: { include: { user: { select: { name: true } } } },
        },
      });
      const type = user?.student ? 'student' : 'teacher';
      return {
        id: b.readerId,
        name: user?.student?.user?.name || user?.teacher?.user?.name || user?.name || 'Unknown',
        type,
        borrowCount: b._count.readerId,
      };
    })
  );

  return {
    readers, total, activeCount,
    byStatus: Object.entries(byStatus).map(([status, count]) => ({ status, count })),
    mostActive: topReaders,
  };
};

const overviewReport = async () => {
  const [totalBooks, totalStudents, totalTeachers, activeBorrows, overdueCount, totalFines, recentBorrows] = await Promise.all([
    prisma.book.count(),
    prisma.student.count({ where: { status: 'active' } }),
    prisma.teacher.count({ where: { status: 'active' } }),
    prisma.borrowRecord.count({ where: { status: 'active' } }),
    prisma.borrowRecord.count({ where: { status: 'overdue' } }),
    prisma.fine.aggregate({ _sum: { amount: true }, where: { status: { in: ['pending', 'partial'] } } }),
    prisma.borrowRecord.findMany({
      take: 5, orderBy: { borrowDate: 'desc' },
      include: { student: true, teacher: true, book: true },
    }),
  ]);

  const recentBorrowsMapped = recentBorrows.map((r) => ({
    ...r,
    readerName: r.student?.name || r.teacher?.name || 'Unknown',
  }));

  return {
    totalBooks: totalBooks,
    activeReaders: totalStudents + totalTeachers,
    activeBorrows,
    overdueBorrows: overdueCount,
    outstandingFines: totalFines._sum.amount || 0,
    recentBorrows: recentBorrowsMapped,
  };
};

module.exports = { borrowingReport, bookReport, readerReport, overviewReport };
