const prisma = require('../config/database');
const { paginate, buildPagination } = require('../utils/apiResponse');
const { calculateBookStatus } = require('../utils/helpers');
const { promoteNextReservation } = require('./reservations.service');

const MS_PER_DAY = 1000 * 60 * 60 * 24;

const getConfigValue = async (key, fallback) => {
  const config = await prisma.systemConfig.findUnique({ where: { key } });
  return config ? parseInt(config.value) : fallback;
};

const getFinePerDay = async () => getConfigValue('fine_per_day', 5000);

const overdueDaysOf = (dueDate, fromDate = new Date()) => {
  const days = Math.floor((fromDate.getTime() - new Date(dueDate).getTime()) / MS_PER_DAY);
  return Math.max(0, days);
};

const calculateOverdueAmount = async (overdueDays) => {
  const finePerDay = await getFinePerDay();
  return Math.round(overdueDays * finePerDay);
};

const processOverdue = async () => {
  const now = new Date();

  const marked = await prisma.borrowRecord.updateMany({
    where: { status: 'active', dueDate: { lt: now } },
    data: { status: 'overdue' },
  });

  const overdueRecords = await prisma.borrowRecord.findMany({
    where: { status: 'overdue' },
    include: { student: true, teacher: true },
  });

  const created = [];
  const updated = [];

  for (const record of overdueRecords) {
    const overdueDays = overdueDaysOf(record.dueDate, now);
    if (overdueDays <= 0) continue;

    const amount = await calculateOverdueAmount(overdueDays);
    const existingFine = await prisma.fine.findFirst({
      where: { borrowRecordId: record.id, reason: 'overdue' },
    });

    if (existingFine) {
      if (existingFine.status === 'pending' && existingFine.amount !== amount) {
        await prisma.fine.update({
          where: { id: existingFine.id },
          data: { amount, notes: `Quá hạn ${overdueDays} ngày` },
        });
        updated.push(existingFine.id);
      } else if (existingFine.status === 'partial' && amount > existingFine.amount) {
        await prisma.fine.update({
          where: { id: existingFine.id },
          data: { amount, notes: `Quá hạn ${overdueDays} ngày` },
        });
        updated.push(existingFine.id);
      }
      continue;
    }

    const fine = await prisma.fine.create({
      data: {
        amount,
        reason: 'overdue',
        status: 'pending',
        paidAmount: 0,
        notes: `Quá hạn ${overdueDays} ngày`,
        studentId: record.studentId || undefined,
        teacherId: record.teacherId || undefined,
        borrowRecordId: record.id,
      },
    });
    created.push(fine);
  }

  return { markedOverdue: marked.count, created, updated };
};

const getAll = async (query, currentUser) => {
  const { skip, take, page, limit } = paginate(query.page, query.limit);
  const where = {};
  if (query.search) {
    where.OR = [
      { student: { user: { name: { contains: query.search } } } },
      { teacher: { user: { name: { contains: query.search } } } },
      { book: { title: { contains: query.search } } },
    ];
  }
  if (query.status) where.status = query.status;
  if (query.studentId) {
    if (currentUser && currentUser.role !== 'admin' && currentUser.role !== 'librarian') {
      const user = await prisma.user.findUnique({ where: { id: currentUser.id }, include: { student: true, teacher: true } });
      if (user?.student?.id !== query.studentId) {
        throw Object.assign(new Error('Access denied'), { statusCode: 403 });
      }
    }
    where.studentId = query.studentId;
  }
  if (query.teacherId) {
    if (currentUser && currentUser.role !== 'admin' && currentUser.role !== 'librarian') {
      const user = await prisma.user.findUnique({ where: { id: currentUser.id }, include: { student: true, teacher: true } });
      if (user?.teacher?.id !== query.teacherId) {
        throw Object.assign(new Error('Access denied'), { statusCode: 403 });
      }
    }
    where.teacherId = query.teacherId;
  }
  if (currentUser && currentUser.role !== 'admin' && currentUser.role !== 'librarian' && !query.studentId && !query.teacherId) {
    const user = await prisma.user.findUnique({ where: { id: currentUser.id }, include: { student: true, teacher: true } });
    if (user?.student?.id) where.studentId = user.student.id;
    else if (user?.teacher?.id) where.teacherId = user.teacher.id;
  }

  const [records, total] = await Promise.all([
    prisma.borrowRecord.findMany({
      where, skip, take, orderBy: { createdAt: 'desc' },
      include: { book: true, bookCopy: true, reservation: { select: { id: true, requestDate: true } }, student: { include: { user: { select: { name: true, email: true } } } }, teacher: { include: { user: { select: { name: true, email: true } } } } },
    }),
    prisma.borrowRecord.count({ where }),
  ]);

  return { records, pagination: buildPagination(total, page, limit) };
};

const getById = async (id, currentUser) => {
  const record = await prisma.borrowRecord.findUnique({
    where: { id },
    include: { book: true, reservation: { select: { id: true, requestDate: true } }, student: { include: { user: { select: { name: true, email: true } } } }, teacher: { include: { user: { select: { name: true, email: true } } } } },
  });
  if (!record) throw Object.assign(new Error('Borrow record not found'), { statusCode: 404 });
  if (currentUser && currentUser.role !== 'admin' && currentUser.role !== 'librarian') {
    const user = await prisma.user.findUnique({ where: { id: currentUser.id }, include: { student: true, teacher: true } });
    const profileId = user?.student?.id || user?.teacher?.id;
    if (profileId && profileId !== record.studentId && profileId !== record.teacherId) {
      throw Object.assign(new Error('Access denied'), { statusCode: 403 });
    }
  }
  return record;
};

const create = async (data) => {
  const book = await prisma.book.findUnique({ where: { id: data.bookId } });
  if (!book) throw Object.assign(new Error('Book not found'), { statusCode: 404 });
  if (book.available <= 0) throw Object.assign(new Error('Book is not available'), { statusCode: 400 });

  const reader = await prisma.user.findUnique({
    where: { id: data.readerId },
    include: { student: true, teacher: true },
  });
  if (!reader || (!reader.student && !reader.teacher)) {
    throw Object.assign(new Error('Reader not found'), { statusCode: 404 });
  }
  if (reader.status !== 'active') {
    throw Object.assign(new Error('Tài khoản độc giả đang bị khóa'), { statusCode: 400 });
  }

  const readerType = reader.student ? 'student' : 'teacher';
  const profile = reader.student || reader.teacher;
  if (profile.status !== 'active') {
    throw Object.assign(new Error('Thẻ thư viện của độc giả đang bị khóa'), { statusCode: 400 });
  }

  const membershipCard = await prisma.membershipCard.findFirst({
    where: {
      OR: [
        { studentId: reader.student?.id || undefined },
        { teacherId: reader.teacher?.id || undefined },
      ],
    },
  });
  if (membershipCard) {
    if (['suspended', 'lost'].includes(membershipCard.status)) {
      throw Object.assign(new Error('Thẻ thư viện đang bị tạm khóa hoặc mất'), { statusCode: 400 });
    }
    if (membershipCard.expiryDate && new Date(membershipCard.expiryDate) < new Date()) {
      throw Object.assign(new Error('Thẻ thư viện đã hết hạn'), { statusCode: 400 });
    }
  }

  const studentId = reader.student?.id;
  const teacherId = reader.teacher?.id;

  const maxBorrow = await getConfigValue(
    readerType === 'student' ? 'max_borrow_student' : 'max_borrow_teacher',
    readerType === 'student' ? 5 : 10
  );
  const activeCount = await prisma.borrowRecord.count({
    where: { OR: [{ studentId }, { teacherId }], status: { in: ['active', 'overdue'] } },
  });
  if (activeCount >= maxBorrow) {
    throw Object.assign(new Error(`Độc giả đã đạt giới hạn mượn tối đa (${maxBorrow} quyển)`), { statusCode: 400 });
  }

  const maxBorrowDays = await getConfigValue(
    readerType === 'student' ? 'max_borrow_days_student' : 'max_borrow_days_teacher',
    readerType === 'student' ? 14 : 30
  );
  const borrowDate = data.borrowDate ? new Date(data.borrowDate) : new Date();
  const maxDue = new Date(borrowDate);
  maxDue.setDate(maxDue.getDate() + maxBorrowDays);

  let dueDate;
  if (data.dueDate) {
    dueDate = new Date(data.dueDate);
    if (dueDate < borrowDate) {
      throw Object.assign(new Error('Hạn trả phải sau ngày mượn'), { statusCode: 400 });
    }
    if (dueDate > maxDue) {
      throw Object.assign(new Error(`Hạn trả vượt quá thời hạn cho phép (${maxBorrowDays} ngày)`), { statusCode: 400 });
    }
  } else {
    dueDate = maxDue;
  }

  const record = await prisma.$transaction(async (tx) => {
    const copy = await tx.bookCopy.findFirst({ where: { bookId: data.bookId, status: 'available' }, orderBy: { id: 'asc' } });
    if (!copy) throw Object.assign(new Error('Book is not available'), { statusCode: 400 });
    const claimed = await tx.bookCopy.updateMany({
      where: { id: copy.id, status: 'available' },
      data: { status: 'borrowed' },
    });
    if (claimed.count !== 1) {
      throw Object.assign(new Error('Book is not available'), { statusCode: 400 });
    }

    const updatedBook = await tx.book.update({
      where: { id: data.bookId },
      data: { available: { decrement: 1 } },
    });
    await tx.book.update({
      where: { id: data.bookId },
      data: { status: calculateBookStatus(updatedBook.available, updatedBook.quantity) },
    });

    return tx.borrowRecord.create({
      data: {
        readerId: reader.id,
        readerType,
        studentId,
        teacherId,
        bookId: data.bookId,
        bookCopyId: copy.id,
        borrowDate,
        dueDate,
        notes: data.notes || null,
      },
      include: { book: true, student: { include: { user: { select: { name: true, email: true } } } }, teacher: { include: { user: { select: { name: true, email: true } } } } },
    });
  });

  return record;
};

const returnBook = async (id, notes) => {
  const record = await prisma.borrowRecord.findUnique({ where: { id }, include: { book: true } });
  if (!record) throw Object.assign(new Error('Borrow record not found'), { statusCode: 404 });
  if (record.status === 'returned') throw Object.assign(new Error('Book already returned'), { statusCode: 400 });

  const wasOverdue = record.status === 'overdue';

  const updated = await prisma.$transaction(async (tx) => {
    const borrow = await tx.borrowRecord.update({
      where: { id },
      data: { status: 'returned', returnDate: new Date(), notes: notes || record.notes },
      include: { book: true, student: { include: { user: { select: { name: true, email: true } } } }, teacher: { include: { user: { select: { name: true, email: true } } } } },
    });
    const updatedBook = await tx.book.update({
      where: { id: record.bookId },
      data: { available: { increment: 1 } },
    });
    await tx.book.update({
      where: { id: record.bookId },
      data: { status: calculateBookStatus(updatedBook.available, updatedBook.quantity) },
    });
    if (record.bookCopyId) {
      await tx.bookCopy.update({
        where: { id: record.bookCopyId },
        data: { status: 'available' },
      });
    }
    return borrow;
  });

  if (wasOverdue) {
    const overdueDays = overdueDaysOf(record.dueDate);
    if (overdueDays > 0) {
      const amount = await calculateOverdueAmount(overdueDays);
      const existingFine = await prisma.fine.findFirst({
        where: { borrowRecordId: record.id, reason: 'overdue' },
      });
      if (existingFine) {
        if (existingFine.status === 'pending') {
          await prisma.fine.update({
            where: { id: existingFine.id },
            data: { amount, notes: `Quá hạn ${overdueDays} ngày khi trả sách` },
          });
        } else if (existingFine.status === 'partial' && amount > existingFine.amount) {
          await prisma.fine.update({
            where: { id: existingFine.id },
            data: { amount, notes: `Quá hạn ${overdueDays} ngày khi trả sách` },
          });
        }
      } else {
        await prisma.fine.create({
          data: {
            amount,
            reason: 'overdue',
            status: 'pending',
            paidAmount: 0,
            notes: `Quá hạn ${overdueDays} ngày khi trả sách`,
            studentId: record.studentId || undefined,
            teacherId: record.teacherId || undefined,
            borrowRecordId: record.id,
          },
        });
      }
    }
  }

  await promoteNextReservation(record.bookId);

  return updated;
};

const getStats = async () => {
  const [total, active, returned, overdue] = await Promise.all([
    prisma.borrowRecord.count(),
    prisma.borrowRecord.count({ where: { status: 'active' } }),
    prisma.borrowRecord.count({ where: { status: 'returned' } }),
    prisma.borrowRecord.count({ where: { status: 'overdue' } }),
  ]);
  const overdueByReaderType = await prisma.borrowRecord.groupBy({
    by: ['readerType'],
    where: { status: 'overdue' },
    _count: { id: true },
  });
  const overdueRecords = await prisma.borrowRecord.findMany({
    where: { status: 'overdue' },
    include: { book: { select: { category: { select: { name: true } } } } },
  });
  const categoryCounts = {};
  overdueRecords.forEach((r) => {
    const catName = r.book?.category?.name || 'Chưa phân loại';
    categoryCounts[catName] = (categoryCounts[catName] || 0) + 1;
  });
  const avgOverdueDays = overdueRecords.length > 0
    ? Math.round(
        overdueRecords.reduce((sum, r) => sum + overdueDaysOf(r.dueDate), 0) / overdueRecords.length
      )
    : 0;
  return { total, active, returned, overdue, overdueByReaderType, overdueByCategory: categoryCounts, avgOverdueDays };
};

const getOverdueDetails = async (query) => {
  const { skip, take, page, limit } = paginate(query.page, query.limit);
  const where = { status: 'overdue' };
  if (query.search) {
    where.OR = [
      { student: { user: { name: { contains: query.search } } } },
      { teacher: { user: { name: { contains: query.search } } } },
      { book: { title: { contains: query.search } } },
    ];
  }
  const [records, total] = await Promise.all([
    prisma.borrowRecord.findMany({
      where, skip, take, orderBy: { dueDate: 'asc' },
      include: { book: true, bookCopy: true, student: { include: { user: { select: { name: true, email: true } } } }, teacher: { include: { user: { select: { name: true, email: true } } } } },
    }),
    prisma.borrowRecord.count({ where }),
  ]);
  return { records, pagination: buildPagination(total, page, limit) };
};

const renewBook = async (id, body = {}) => {
  const record = await prisma.borrowRecord.findUnique({
    where: { id },
    include: { book: true, student: { include: { user: { select: { name: true, email: true } } } }, teacher: { include: { user: { select: { name: true, email: true } } } } },
  });
  if (!record) throw Object.assign(new Error('Borrow record not found'), { statusCode: 404 });
  if (record.status !== 'active') throw Object.assign(new Error('Chỉ có thể gia hạn phiếu mượn đang mượn'), { statusCode: 400 });

  const maxRenewals = await getConfigValue('max_renewals', record.maxRenewals);
  if (record.renewalCount >= maxRenewals) throw Object.assign(new Error(`Đã đạt giới hạn gia hạn (${maxRenewals} lần)`), { statusCode: 400 });

  const maxBorrowDays = await getConfigValue(
    record.readerType === 'teacher' ? 'max_borrow_days_teacher' : 'max_borrow_days_student',
    record.readerType === 'teacher' ? 30 : 14
  );
  const hardCap = new Date(record.borrowDate);
  hardCap.setDate(hardCap.getDate() + maxBorrowDays);

  let newDueDate;
  if (body.dueDate) {
    newDueDate = new Date(body.dueDate);
    if (newDueDate <= new Date(record.dueDate)) {
      throw Object.assign(new Error('Hạn trả mới phải sau hạn trả hiện tại'), { statusCode: 400 });
    }
  } else {
    const renewalDays = await getConfigValue('renewal_days', maxBorrowDays);
    newDueDate = new Date(record.dueDate);
    newDueDate.setDate(newDueDate.getDate() + renewalDays);
  }

  if (newDueDate <= new Date()) {
    throw Object.assign(new Error('Hạn trả mới phải ở tương lai'), { statusCode: 400 });
  }
  if (newDueDate > hardCap) {
    throw Object.assign(new Error(`Không thể gia hạn quá ${maxBorrowDays} ngày kể từ ngày mượn`), { statusCode: 400 });
  }

  const updated = await prisma.borrowRecord.update({
    where: { id },
    data: {
      dueDate: newDueDate,
      renewalCount: record.renewalCount + 1,
      notes: body.notes !== undefined ? body.notes : record.notes,
    },
    include: { book: true, bookCopy: true, student: { include: { user: { select: { name: true, email: true } } } }, teacher: { include: { user: { select: { name: true, email: true } } } } },
  });

  return updated;
};

module.exports = { getAll, getById, create, returnBook, getStats, renewBook, getOverdueDetails, processOverdue };
