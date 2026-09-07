const prisma = require('../config/database');
const { paginate, buildPagination } = require('../utils/apiResponse');
const { calculateBookStatus } = require('../utils/helpers');

const READY_PICKUP_DAYS = 3;
const DAY_MS = 24 * 60 * 60 * 1000;

const getConfigValue = async (key, fallback) => {
  const config = await prisma.systemConfig.findUnique({ where: { key } });
  return config ? parseInt(config.value) : fallback;
};

const reservationInclude = {
  book: true,
  borrowRecord: { select: { id: true, borrowDate: true, dueDate: true, status: true } },
  student: { include: { user: { select: { id: true, name: true, email: true } } } },
  teacher: { include: { user: { select: { id: true, name: true, email: true } } } },
};

const isStaff = (user) => user && ['admin', 'librarian'].includes(user.role);

const assertOwnership = async (reservation, currentUser) => {
  if (isStaff(currentUser)) return;
  if (!currentUser) throw Object.assign(new Error('Unauthorized'), { statusCode: 401 });
  const user = await prisma.user.findUnique({
    where: { id: currentUser.id },
    include: { student: { select: { id: true } }, teacher: { select: { id: true } } },
  });
  const profileId = user?.student?.id || user?.teacher?.id;
  if (!profileId || profileId !== reservation.studentId && profileId !== reservation.teacherId) {
    throw Object.assign(new Error('Access denied'), { statusCode: 403 });
  }
};

const getAll = async (query, currentUser) => {
  const { skip, take, page, limit } = paginate(query.page, query.limit);
  const where = {};
  if (query.search) {
    where.OR = [
      { student: { user: { name: { contains: query.search } } } },
      { teacher: { user: { name: { contains: query.search } } } },
      { book: { title: { contains: query.search } } },
      { book: { isbn: { contains: query.search } } },
    ];
  }
  if (query.status) where.status = query.status;

  if (!isStaff(currentUser)) {
    const user = await prisma.user.findUnique({
      where: { id: currentUser.id },
      include: { student: { select: { id: true } }, teacher: { select: { id: true } } },
    });
    const profileId = user?.student?.id || user?.teacher?.id;
    if (!profileId) return { reservations: [], pagination: buildPagination(0, page, limit) };
    if (user?.student?.id) where.studentId = user.student.id;
    else where.teacherId = user.teacher.id;
  } else if (query.readerId) {
    where.readerId = query.readerId;
  }

  const [reservations, total] = await Promise.all([
    prisma.reservation.findMany({
      where, skip, take, orderBy: { createdAt: 'desc' },
      include: reservationInclude,
    }),
    prisma.reservation.count({ where }),
  ]);

  return { reservations, pagination: buildPagination(total, page, limit) };
};

const getById = async (id, currentUser) => {
  const reservation = await prisma.reservation.findUnique({ where: { id }, include: reservationInclude });
  if (!reservation) throw Object.assign(new Error('Reservation not found'), { statusCode: 404 });
  await assertOwnership(reservation, currentUser);
  return reservation;
};

const create = async (data, userId) => {
  const book = await prisma.book.findUnique({ where: { id: data.bookId } });
  if (!book) throw Object.assign(new Error('Book not found'), { statusCode: 404 });

  if (userId && data.readerId && userId !== data.readerId) {
    throw Object.assign(new Error('Bạn chỉ có thể đặt chỗ cho chính mình'), { statusCode: 403 });
  }

  let { readerType, studentId, teacherId } = data;
  const reader = data.readerId
    ? await prisma.user.findUnique({
        where: { id: data.readerId },
        include: { student: true, teacher: true },
      })
    : null;

  if (reader) {
    if (reader.status !== 'active' || (reader.student || reader.teacher)?.status !== 'active') {
      throw Object.assign(new Error('Tài khoản độc giả đang bị khóa, không thể đặt chỗ'), { statusCode: 400 });
    }
    if (reader.student || reader.teacher) {
      readerType = reader.student ? 'student' : 'teacher';
      studentId = reader.student?.id;
      teacherId = reader.teacher?.id;
    }
  }

  const activeStatuses = ['in_queue', 'processing', 'ready_for_pickup'];
  const existing = await prisma.reservation.findFirst({
    where: { bookId: data.bookId, readerId: data.readerId, status: { in: activeStatuses } },
  });
  if (existing) throw Object.assign(new Error('Bạn đã có một đặt chỗ đang chờ xử lý cho cuốn sách này'), { statusCode: 400 });

  const queueCount = await prisma.reservation.count({
    where: { bookId: data.bookId, status: { in: ['in_queue', 'processing'] } },
  });

  const reservation = await prisma.reservation.create({
    data: { ...data, readerType, studentId, teacherId, queuePosition: queueCount + 1 },
    include: reservationInclude,
  });
  return reservation;
};

const rebalanceQueue = async (bookId) => {
  const queue = await prisma.reservation.findMany({
    where: { bookId, status: { in: ['in_queue', 'processing'] } },
    orderBy: { createdAt: 'asc' },
    select: { id: true },
  });
  await Promise.all(
    queue.map((r, i) => prisma.reservation.update({ where: { id: r.id }, data: { queuePosition: i + 1 } }))
  );
};

const notifyReader = async (reservation, title, message, type = 'info') => {
  const userId = reservation.student?.user?.id || reservation.teacher?.user?.id;
  if (!userId) return;
  await prisma.notification.create({
    data: { userId, title, message, type, category: 'reservation' },
  });
};

const STATUS_TRANSITIONS = {
  in_queue: ['ready_for_pickup', 'cancelled', 'expired'],
  processing: ['ready_for_pickup', 'cancelled', 'expired'],
  ready_for_pickup: ['fulfilled', 'cancelled', 'expired'],
  fulfilled: [],
  cancelled: [],
  expired: [],
};

const createBorrowFromReservation = async (reservation) => {
  const book = reservation.book || await prisma.book.findUnique({ where: { id: reservation.bookId } });
  if (!book) throw Object.assign(new Error('Book not found'), { statusCode: 404 });

  if (reservation.status !== 'ready_for_pickup') {
    throw Object.assign(new Error('Đặt chỗ phải ở trạng thái sẵn sàng nhận trước khi tạo phiếu mượn'), { statusCode: 400 });
  }
  if (reservation.expiryDate && new Date(reservation.expiryDate) < new Date()) {
    throw Object.assign(new Error('Đặt chỗ đã hết hạn nhận sách'), { statusCode: 400 });
  }

  let readerType = reservation.readerType;
  let studentId = reservation.studentId;
  let teacherId = reservation.teacherId;

  if (!studentId && !teacherId && reservation.readerId) {
    const reader = await prisma.user.findUnique({
      where: { id: reservation.readerId },
      include: { student: true, teacher: true },
    });
    if (reader && (reader.student || reader.teacher)) {
      readerType = reader.student ? 'student' : 'teacher';
      studentId = reader.student?.id;
      teacherId = reader.teacher?.id;
    }
  }
  if (!studentId && !teacherId) {
    throw Object.assign(new Error('Không xác định được bạn đọc của đặt chỗ'), { statusCode: 400 });
  }

  const reader = await prisma.user.findUnique({ where: { id: reservation.readerId } });
  if (reader && (reader.status !== 'active')) {
    throw Object.assign(new Error('Tài khoản độc giả đang bị khóa, không thể tạo phiếu mượn'), { statusCode: 400 });
  }

  const profileWhere = studentId ? { studentId } : { teacherId };
  const maxBorrow = await getConfigValue(
    readerType === 'student' ? 'max_borrow_student' : 'max_borrow_teacher',
    readerType === 'student' ? 5 : 10
  );
  const activeCount = await prisma.borrowRecord.count({
    where: { ...profileWhere, status: { in: ['active', 'overdue'] } },
  });
  if (activeCount >= maxBorrow) {
    throw Object.assign(new Error(`Độc giả đã đạt giới hạn mượn tối đa (${maxBorrow} quyển)`), { statusCode: 400 });
  }

  const maxBorrowDays = await getConfigValue(
    readerType === 'student' ? 'max_borrow_days_student' : 'max_borrow_days_teacher',
    readerType === 'student' ? 14 : 30
  );
  const borrowDate = new Date();
  const dueDate = new Date(borrowDate);
  dueDate.setDate(dueDate.getDate() + maxBorrowDays);

  const borrow = await prisma.$transaction(async (tx) => {
    const copy = await tx.bookCopy.findFirst({
      where: { bookId: reservation.bookId, status: 'available' },
      orderBy: { id: 'asc' },
    });
    if (!copy) throw Object.assign(new Error('Sách không còn bản để cho mượn'), { statusCode: 400 });
    const claimed = await tx.bookCopy.updateMany({
      where: { id: copy.id, status: 'available' },
      data: { status: 'borrowed' },
    });
    if (claimed.count !== 1) throw Object.assign(new Error('Sách không còn bản để cho mượn'), { statusCode: 400 });

    const updatedBook = await tx.book.update({
      where: { id: reservation.bookId },
      data: { available: { decrement: 1 } },
    });
    await tx.book.update({
      where: { id: reservation.bookId },
      data: { status: calculateBookStatus(updatedBook.available, updatedBook.quantity) },
    });

    const record = await tx.borrowRecord.create({
      data: {
        readerId: reservation.readerId,
        readerType,
        studentId,
        teacherId,
        bookId: reservation.bookId,
        bookCopyId: copy.id,
        borrowDate,
        dueDate,
        reservationId: reservation.id,
        notes: 'Mượn từ đặt chỗ',
      },
    });

    await tx.reservation.update({
      where: { id: reservation.id },
      data: { bookCopyId: copy.id },
    });
    return record;
  });

  return borrow;
};

const updateStatus = async (id, status, currentUser) => {
  const reservation = await prisma.reservation.findUnique({ where: { id }, include: reservationInclude });
  if (!reservation) throw Object.assign(new Error('Reservation not found'), { statusCode: 404 });
  if (!isStaff(currentUser)) {
    await assertOwnership(reservation, currentUser);
    const allowed = status === 'cancelled' && ['in_queue', 'processing', 'ready_for_pickup'].includes(reservation.status);
    if (!allowed) {
      throw Object.assign(new Error('Bạn chỉ có thể hủy đặt chỗ của chính mình'), { statusCode: 403 });
    }
  }

  if (reservation.status === status) return reservation;
  if (!(STATUS_TRANSITIONS[reservation.status] || []).includes(status)) {
    throw Object.assign(new Error(`Không thể chuyển trạng thái từ "${reservation.status}" sang "${status}"`), { statusCode: 400 });
  }

  const data = { status };
  if (status === 'ready_for_pickup') {
    data.expiryDate = new Date(Date.now() + READY_PICKUP_DAYS * DAY_MS);
  }

  if (status === 'fulfilled') {
    let borrow = reservation.borrowRecord;
    if (!borrow) {
      borrow = await createBorrowFromReservation(reservation);
    }
  }

  const updated = await prisma.reservation.update({ where: { id }, data, include: reservationInclude });

  if (['cancelled', 'expired', 'fulfilled'].includes(status) || status === 'ready_for_pickup') {
    await rebalanceQueue(reservation.bookId);
  }

  if (status === 'ready_for_pickup') {
    await notifyReader(reservation, 'Sách đã sẵn sàng nhận',
      `Sách "${reservation.book.title}" đã sẵn sàng tại quầy thủ thư. Vui lòng nhận trong vòng ${READY_PICKUP_DAYS} ngày.`, 'success');
  } else if (status === 'fulfilled') {
    await notifyReader(reservation, 'Đã xác nhận nhận sách',
      `Bạn đã nhận sách "${reservation.book.title}". Chúc bạn có trải nghiệm đọc vui!`, 'success');
  } else if (status === 'cancelled') {
    await notifyReader(reservation, 'Đặt chỗ đã bị hủy',
      `Đặt chỗ sách "${reservation.book.title}" của bạn đã bị hủy.`, 'warning');
  }

  return updated;
};

const promoteNextReservation = async (bookId) => {
  const next = await prisma.reservation.findFirst({
    where: { bookId, status: { in: ['in_queue', 'processing'] } },
    orderBy: { createdAt: 'asc' },
    include: reservationInclude,
  });
  if (!next) return null;

  const updated = await prisma.reservation.update({
    where: { id: next.id },
    data: { status: 'ready_for_pickup', expiryDate: new Date(Date.now() + READY_PICKUP_DAYS * DAY_MS) },
    include: reservationInclude,
  });

  await rebalanceQueue(bookId);
  await notifyReader(next, 'Sách đã sẵn sàng nhận',
    `Sách "${next.book.title}" bạn đặt trước đã có sẵn tại quầy thủ thư. Vui lòng nhận trong vòng ${READY_PICKUP_DAYS} ngày.`, 'success');

  return updated;
};

const expireReservations = async () => {
  const expired = await prisma.reservation.findMany({
    where: { status: 'ready_for_pickup', expiryDate: { lt: new Date() } },
    include: reservationInclude,
  });

  const bookIds = new Set(expired.map((r) => r.bookId));
  const result = await prisma.reservation.updateMany({
    where: { status: 'ready_for_pickup', expiryDate: { lt: new Date() } },
    data: { status: 'expired' },
  });

  for (const r of expired) {
    await notifyReader(r, 'Đặt chỗ đã hết hạn',
      `Đặt chỗ sách "${r.book.title}" đã hết hạn nhận sách và bị hủy.`, 'warning');
  }
  for (const bookId of bookIds) {
    await rebalanceQueue(bookId);
  }
  return { expired: result.count };
};

const remove = async (id, currentUser) => {
  const reservation = await prisma.reservation.findUnique({ where: { id }, include: reservationInclude });
  if (!reservation) throw Object.assign(new Error('Reservation not found'), { statusCode: 404 });
  await assertOwnership(reservation, currentUser);

  if (['cancelled', 'expired', 'fulfilled'].includes(reservation.status)) {
    await prisma.reservation.delete({ where: { id } });
    return;
  }

  await prisma.reservation.update({ where: { id }, data: { status: 'cancelled' } });
  await rebalanceQueue(reservation.bookId);
  await notifyReader(reservation, 'Đặt chỗ đã bị hủy',
    `Đặt chỗ sách "${reservation.book.title}" của bạn đã bị hủy.`, 'warning');
};

module.exports = { getAll, getById, create, updateStatus, promoteNextReservation, expireReservations, remove };
