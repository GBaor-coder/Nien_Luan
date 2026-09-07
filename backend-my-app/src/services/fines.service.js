const prisma = require('../config/database');
const { paginate, buildPagination } = require('../utils/apiResponse');

const isStaff = (user) => user && ['admin', 'librarian'].includes(user.role);

const profileInclude = {
  student: { include: { user: { select: { id: true, name: true, email: true } } } },
  teacher: { include: { user: { select: { id: true, name: true, email: true } } } },
};

const resolveProfile = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { student: { select: { id: true } }, teacher: { select: { id: true } } },
  });
  return user?.student?.id || user?.teacher?.id;
};

const getAll = async (query, currentUser) => {
  const { skip, take, page, limit } = paginate(query.page, query.limit);
  const where = {};
  if (query.search) {
    where.OR = [
      { student: { name: { contains: query.search } } },
      { teacher: { name: { contains: query.search } } },
      { reason: { contains: query.search } },
    ];
  }
  if (query.status) where.status = query.status;
  if (query.studentId) where.studentId = query.studentId;
  if (query.teacherId) where.teacherId = query.teacherId;

  if (!isStaff(currentUser)) {
    const profileId = currentUser ? await resolveProfile(currentUser.id) : null;
    if (!profileId) return { fines: [], pagination: buildPagination(0, page, limit) };
    where.OR = [{ studentId: profileId }, { teacherId: profileId }];
    delete where.studentId;
    delete where.teacherId;
  }

  const [fines, total] = await Promise.all([
    prisma.fine.findMany({
      where, skip, take, orderBy: { createdAt: 'desc' },
      include: { ...profileInclude, borrowRecord: { include: { book: true } } },
    }),
    prisma.fine.count({ where }),
  ]);

  return { fines, pagination: buildPagination(total, page, limit) };
};

const getById = async (id, currentUser) => {
  const fine = await prisma.fine.findUnique({
    where: { id },
    include: { ...profileInclude, borrowRecord: { include: { book: true } } },
  });
  if (!fine) throw Object.assign(new Error('Fine not found'), { statusCode: 404 });
  if (!isStaff(currentUser)) {
    const profileId = currentUser ? await resolveProfile(currentUser.id) : null;
    if (!profileId || (profileId !== fine.studentId && profileId !== fine.teacherId)) {
      throw Object.assign(new Error('Access denied'), { statusCode: 403 });
    }
  }
  return fine;
};

const create = async (data) => {
  let studentId, teacherId;
  if (data.readerId) {
    const user = await prisma.user.findUnique({ where: { id: data.readerId }, include: { student: true, teacher: true } });
    if (user?.student) studentId = user.student.id;
    else if (user?.teacher) teacherId = user.teacher.id;
  }
  const { readerId, ...rest } = data;
  return prisma.fine.create({
    data: { ...rest, studentId: studentId || undefined, teacherId: teacherId || undefined },
    include: profileInclude,
  });
};

const addPayment = async (id, data) => {
  const fine = await prisma.fine.findUnique({ where: { id } });
  if (!fine) throw Object.assign(new Error('Fine not found'), { statusCode: 404 });
  if (fine.status === 'paid') throw Object.assign(new Error('Fine is already fully paid'), { statusCode: 400 });
  if (fine.status === 'waived') throw Object.assign(new Error('Fine has been waived'), { statusCode: 400 });

  const newPaidAmount = fine.paidAmount + data.paidAmount;
  if (newPaidAmount > fine.amount) {
    throw Object.assign(new Error('Payment amount exceeds fine balance'), { statusCode: 400 });
  }

  const status = newPaidAmount >= fine.amount ? 'paid' : 'partial';
  const notes = data.notes ? `${fine.notes ? fine.notes + '; ' : ''}${data.notes}` : fine.notes;

  return prisma.fine.update({
    where: { id },
    data: {
      paidAmount: newPaidAmount,
      status,
      paidDate: status === 'paid' ? new Date() : null,
      notes,
    },
    include: profileInclude,
  });
};

const waive = async (id) => {
  const fine = await prisma.fine.findUnique({ where: { id } });
  if (!fine) throw Object.assign(new Error('Fine not found'), { statusCode: 404 });

  return prisma.fine.update({
    where: { id },
    data: { status: 'waived' },
    include: profileInclude,
  });
};

const remove = async (id) => {
  await prisma.fine.findUniqueOrThrow({ where: { id } }).catch(() => {
    throw Object.assign(new Error('Fine not found'), { statusCode: 404 });
  });
  await prisma.fine.delete({ where: { id } });
};

const getStats = async () => {
  const [totalPending, totalPartial, totalPaid, totalWaived, totalAmount, paidAmount] = await Promise.all([
    prisma.fine.count({ where: { status: 'pending' } }),
    prisma.fine.count({ where: { status: { in: ['partial', 'partially_paid'] } } }),
    prisma.fine.count({ where: { status: 'paid' } }),
    prisma.fine.count({ where: { status: 'waived' } }),
    prisma.fine.aggregate({ _sum: { amount: true }, where: { status: { in: ['pending', 'partial', 'partially_paid'] } } }),
    prisma.fine.aggregate({ _sum: { paidAmount: true }, where: { status: { in: ['pending', 'partial', 'partially_paid'] } } }),
  ]);

  return {
    pendingCount: totalPending + totalPartial,
    paidCount: totalPaid,
    waivedCount: totalWaived,
    totalOutstanding: (totalAmount._sum.amount || 0) - (paidAmount._sum.paidAmount || 0),
    totalPaid: paidAmount._sum.paidAmount || 0,
  };
};

module.exports = { getAll, getById, create, addPayment, waive, remove, getStats };
