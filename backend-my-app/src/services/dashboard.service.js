const prisma = require('../config/database');

const STATUS_ACTION_MAP = {
  active: 'borrow',
  returned: 'return',
  overdue: 'overdue',
  lost: 'lost',
};

const computeChange = (current, previous) => {
  if (previous === 0) return current > 0 ? '+100%' : '0%';
  const pct = ((current - previous) / previous) * 100;
  const sign = pct >= 0 ? '+' : '';
  return `${sign}${pct.toFixed(1)}%`;
};

const getOverview = async (query = {}) => {
  const now = new Date();
  const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [
    totalBooksResult,
    overdueCount,
    activeStudents,
    activeTeachers,
    totalStudents,
    totalTeachers,
    totalCategories,
    totalAuthors,
    availableBooksResult,
    activeBorrowsCount,
    lostBooksCount,
    outstandingFinesAgg,
    pendingReservations,
    currentMonthBorrowed,
    lastMonthBorrowed,
    currentMonthReturned,
    lastMonthReturned,
    readyForPickup,
    totalReservations,
  ] = await Promise.all([
    prisma.book.count(),
    prisma.borrowRecord.count({ where: { status: 'overdue' } }),
    prisma.student.count({ where: { status: 'active' } }),
    prisma.teacher.count({ where: { status: 'active' } }),
    prisma.student.count(),
    prisma.teacher.count(),
    prisma.category.count(),
    prisma.author.count(),
    prisma.book.count({ where: { available: { gt: 0 } } }),
    prisma.borrowRecord.count({ where: { status: 'active' } }),
    prisma.borrowRecord.count({ where: { status: 'lost' } }),
    prisma.fine.aggregate({ _sum: { amount: true }, where: { status: { in: ['pending', 'partial'] } } }),
    prisma.reservation.count({ where: { status: { in: ['in_queue', 'processing'] } } }),
    prisma.borrowRecord.count({ where: { borrowDate: { gte: startOfCurrentMonth, lt: startOfNextMonth } } }),
    prisma.borrowRecord.count({ where: { borrowDate: { gte: startOfLastMonth, lt: startOfCurrentMonth } } }),
    prisma.borrowRecord.count({ where: { returnDate: { gte: startOfCurrentMonth, lt: startOfNextMonth } } }),
    prisma.borrowRecord.count({ where: { returnDate: { gte: startOfLastMonth, lt: startOfCurrentMonth } } }),
    prisma.reservation.count({ where: { status: 'ready_for_pickup' } }),
    prisma.reservation.count(),
  ]);

  const totalBooksCount = totalBooksResult || 0;
  const availableBooksCount = availableBooksResult || 0;

  const activeReaders = activeStudents + activeTeachers;

  return {
    kpis: {
      totalBooks: totalBooksCount,
      borrowedBooks: activeBorrowsCount,
      overdueBooks: overdueCount,
      activeReaders,
      availableBooks: availableBooksCount,
      totalReaders: totalStudents + totalTeachers,
      outstandingFines: outstandingFinesAgg._sum.amount || 0,
      pendingReservations,
      returnedBooks: currentMonthReturned,
      lostBooks: lostBooksCount,
    },
    kpiTrends: {
      borrowedBooks: {
        current: currentMonthBorrowed,
        previous: lastMonthBorrowed,
        change: computeChange(currentMonthBorrowed, lastMonthBorrowed),
        trend: currentMonthBorrowed >= lastMonthBorrowed ? 'up' : 'down',
      },
      returnedBooks: {
        current: currentMonthReturned,
        previous: lastMonthReturned,
        change: computeChange(currentMonthReturned, lastMonthReturned),
        trend: currentMonthReturned >= lastMonthReturned ? 'up' : 'down',
      },
    },
    counts: {
      categories: totalCategories,
      authors: totalAuthors,
    },
    insights: {
      overdueBooks: overdueCount,
      outstandingFines: outstandingFinesAgg._sum.amount || 0,
      readyForPickup,
      totalReservations,
    },
  };
};

const getBorrowingTrends = async (query = {}) => {
  const dateClause = [];
  if (query.startDate) {
    dateClause.push(`borrowDate >= '${new Date(query.startDate).toISOString().slice(0, 19).replace('T', ' ')}'`);
  }
  if (query.endDate) {
    dateClause.push(`borrowDate <= '${new Date(query.endDate).toISOString().slice(0, 19).replace('T', ' ')}'`);
  }
  if (!query.startDate && !query.endDate) {
    dateClause.push(`borrowDate >= DATE_SUB(NOW(), INTERVAL 12 MONTH)`);
  }
  const whereClause = dateClause.length > 0 ? `WHERE ${dateClause.join(' AND ')}` : '';

  const borrowQuery = `SELECT DATE_FORMAT(borrowDate, '%Y-%m') as month, COUNT(*) as count FROM BorrowRecord ${whereClause} GROUP BY month ORDER BY month ASC`;
  const returnQuery = `SELECT DATE_FORMAT(returnDate, '%Y-%m') as month, COUNT(*) as count FROM BorrowRecord WHERE returnDate IS NOT NULL ${dateClause.length > 0 ? `AND ${dateClause.join(' AND ')}` : 'WHERE returnDate >= DATE_SUB(NOW(), INTERVAL 12 MONTH)'} GROUP BY month ORDER BY month ASC`;

  const borrowResults = await prisma.$queryRawUnsafe(borrowQuery);
  const returnResults = await prisma.$queryRawUnsafe(returnQuery);

  const months = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const monthStr = d.toLocaleString('en-US', { month: 'short' });
    const isoMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    months.push({ month: monthStr, monthKey: isoMonth, borrowed: 0, returned: 0 });
  }

  const borrowMap = {};
  borrowResults.forEach((r) => { borrowMap[r.month] = Number(r.count); });
  const returnMap = {};
  returnResults.forEach((r) => { returnMap[r.month] = Number(r.count); });

  return months.map((m) => ({
    month: m.month,
    borrowed: borrowMap[m.monthKey] || 0,
    returned: returnMap[m.monthKey] || 0,
  }));
};

const getCategoryDistribution = async (query = {}) => {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { books: true } } },
    orderBy: { name: 'asc' },
  });

  const colors = ['#2563EB', '#8B5CF6', '#EC4899', '#F59E0B', '#22C55E', '#06B6D4', '#A855F7', '#EF4444', '#14B8A6', '#F97316'];
  return categories.map((c, i) => ({
    name: c.name,
    value: c._count.books,
    color: c.color || colors[i % colors.length],
  }));
};

const getRecentActivity = async (limit = 10) => {
  const records = await prisma.borrowRecord.findMany({
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      student: { include: { user: { select: { name: true } } } },
      teacher: { include: { user: { select: { name: true } } } },
      book: true,
    },
  });

  return records.map((r) => ({
    id: r.id,
    reader: r.student?.user?.name || r.teacher?.user?.name || 'Unknown',
    bookTitle: r.book.title,
    action: STATUS_ACTION_MAP[r.status] || r.status,
    date: r.borrowDate.toISOString().split('T')[0],
    borrowDate: r.borrowDate.toISOString().split('T')[0],
    dueDate: r.dueDate.toISOString().split('T')[0],
    status: r.status,
  }));
};

const getStatusDistribution = async () => {
  const [activeCount, overdueCount, returnedCount, lostCount, totalBooksResult] = await Promise.all([
    prisma.borrowRecord.count({ where: { status: 'active' } }),
    prisma.borrowRecord.count({ where: { status: 'overdue' } }),
    prisma.borrowRecord.count({ where: { status: 'returned' } }),
    prisma.borrowRecord.count({ where: { status: 'lost' } }),
    prisma.book.count({ where: { available: { gt: 0 } } }),
  ]);

  const totalAvailable = totalBooksResult || 0;

  return [
    { status: 'available', count: totalAvailable },
    { status: 'borrowed', count: activeCount },
    { status: 'overdue', count: overdueCount },
    { status: 'returned', count: returnedCount },
    { status: 'lost', count: lostCount },
  ];
};

module.exports = { getOverview, getBorrowingTrends, getCategoryDistribution, getRecentActivity, getStatusDistribution };
