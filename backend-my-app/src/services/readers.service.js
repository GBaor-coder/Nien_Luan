const prisma = require('../config/database');
const { paginate, buildPagination } = require('../utils/apiResponse');

const READER_ROLES = ['student', 'teacher'];

const profileInclude = {
  student: { include: { _count: { select: { borrowRecords: true } } } },
  teacher: { include: { _count: { select: { borrowRecords: true } } } },
};

const detailInclude = {
  student: {
    include: {
      borrowRecords: { include: { book: true } },
      reservations: { include: { book: true } },
      _count: { select: { borrowRecords: true } },
    },
  },
  teacher: {
    include: {
      borrowRecords: { include: { book: true } },
      reservations: { include: { book: true } },
      _count: { select: { borrowRecords: true } },
    },
  },
};

const mapReader = (user) => {
  const isStudent = !!user.student;
  const profile = user.student || user.teacher;
  const borrowed = user.student?._count?.borrowRecords ?? user.teacher?._count?.borrowRecords ?? 0;

  return {
    id: user.id,
    userId: user.id,
    readerType: isStudent ? 'student' : 'teacher',
    name: user.name,
    email: user.email,
    phone: user.phone,
    avatar: user.avatar,
    status: user.status,
    createdAt: user.createdAt,
    code: profile ? (isStudent ? profile.studentId : profile.teacherId) : user.code,
    profile: profile
      ? isStudent
        ? { id: profile.id, studentId: profile.studentId, code: profile.studentId, className: profile.className, grade: profile.grade, enrollYear: profile.enrollYear, status: profile.status }
        : { id: profile.id, teacherId: profile.teacherId, code: profile.teacherId, department: profile.department, position: profile.position, degree: profile.degree, status: profile.status }
      : null,
    borrowed,
  };
};

const buildWhere = (query) => {
  const where = { role: { name: { in: READER_ROLES } } };
  if (query.search) {
    where.OR = [
      { name: { contains: query.search } },
      { email: { contains: query.search } },
      { code: { contains: query.search } },
    ];
  }
  if (query.readerType === 'student') where.role = { name: 'student' };
  if (query.readerType === 'teacher') where.role = { name: 'teacher' };
  if (query.status) where.status = query.status;
  return where;
};

const assertReader = (user) => {
  if (!user || (!user.student && !user.teacher)) {
    throw Object.assign(new Error('Reader not found'), { statusCode: 404 });
  }
  return user;
};

const getAll = async (query) => {
  const { skip, take, page, limit } = paginate(query.page, query.limit);
  const where = buildWhere(query);

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where, skip, take, orderBy: { createdAt: 'desc' },
      include: profileInclude,
    }),
    prisma.user.count({ where }),
  ]);

  return { readers: users.map(mapReader), pagination: buildPagination(total, page, limit) };
};

const getById = async (id) => {
  const user = await prisma.user.findUnique({ where: { id }, include: detailInclude });
  assertReader(user);
  return mapReader(user);
};

const create = async (data) => {
  const bcrypt = require('bcrypt');
  const readerType = data.readerType === 'teacher' ? 'teacher' : 'student';
  const role = await prisma.role.findUnique({ where: { name: readerType } });
  if (!role) throw Object.assign(new Error('Invalid reader type'), { statusCode: 400 });

  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) throw Object.assign(new Error('Email already exists'), { statusCode: 409 });

  const now = new Date();
  const hashedPassword = await bcrypt.hash(data.password || '123456', 10);

  const user = await prisma.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: {
        code: data.code || `USR-${Date.now()}`,
        name: data.name,
        email: data.email,
        phone: data.phone,
        status: data.status || 'active',
        password: hashedPassword,
        roleId: role.id,
      },
    });

    if (readerType === 'student') {
      await tx.student.create({
        data: {
          studentId: data.studentId || `HV${now.getFullYear()}${Math.floor(100 + Math.random() * 900)}`,
          className: data.className || 'Chưa xếp lớp',
          grade: data.grade || 10,
          enrollYear: data.enrollYear || now.getFullYear(),
          status: data.status || 'active',
          userId: created.id,
        },
      });
    } else {
      await tx.teacher.create({
        data: {
          teacherId: data.teacherId || `GV${now.getFullYear()}${Math.floor(100 + Math.random() * 900)}`,
          department: data.department || 'Chưa phân công',
          position: data.position,
          degree: data.degree,
          status: data.status || 'active',
          userId: created.id,
        },
      });
    }

    return created;
  });

  return getById(user.id);
};

const update = async (id, data) => {
  const user = await prisma.user.findUnique({ where: { id }, include: { student: true, teacher: true } });
  assertReader(user);

  const userData = {};
  if (data.name !== undefined) userData.name = data.name;
  if (data.email !== undefined) userData.email = data.email;
  if (data.phone !== undefined) userData.phone = data.phone;
  if (data.status !== undefined) userData.status = data.status;

  const isStudent = data.readerType === 'student' || (user.student && !user.teacher);

  await prisma.$transaction(async (tx) => {
    if (Object.keys(userData).length) {
      await tx.user.update({ where: { id }, data: userData });
    }

    if (user.student) {
      const profileData = {};
      if (data.className !== undefined) profileData.className = data.className;
      if (data.grade !== undefined) profileData.grade = data.grade;
      if (data.enrollYear !== undefined) profileData.enrollYear = data.enrollYear;
      if (data.studentId !== undefined) profileData.studentId = data.studentId;
      if (data.status !== undefined) profileData.status = data.status;
      if (Object.keys(profileData).length) {
        await tx.student.update({ where: { id: user.student.id }, data: profileData });
      }
    } else if (isStudent) {
      const now = new Date();
      await tx.student.create({
        data: {
          studentId: data.studentId || `HV${now.getFullYear()}${Math.floor(100 + Math.random() * 900)}`,
          className: data.className || 'Chưa xếp lớp',
          grade: data.grade || 10,
          enrollYear: data.enrollYear || now.getFullYear(),
          status: data.status || user.status || 'active',
          userId: id,
        },
      });
    } else if (user.teacher) {
      const profileData = {};
      if (data.department !== undefined) profileData.department = data.department;
      if (data.position !== undefined) profileData.position = data.position;
      if (data.degree !== undefined) profileData.degree = data.degree;
      if (data.teacherId !== undefined) profileData.teacherId = data.teacherId;
      if (data.status !== undefined) profileData.status = data.status;
      if (Object.keys(profileData).length) {
        await tx.teacher.update({ where: { id: user.teacher.id }, data: profileData });
      }
    } else {
      const now = new Date();
      await tx.teacher.create({
        data: {
          teacherId: data.teacherId || `GV${now.getFullYear()}${Math.floor(100 + Math.random() * 900)}`,
          department: data.department || 'Chưa phân công',
          position: data.position,
          degree: data.degree,
          status: data.status || user.status || 'active',
          userId: id,
        },
      });
    }
  });

  return getById(id);
};

const remove = async (id) => {
  const user = await prisma.user.findUnique({ where: { id }, include: { student: true, teacher: true } });
  assertReader(user);

  await prisma.$transaction(async (tx) => {
    const borrowRecords = await tx.borrowRecord.findMany({
      where: { readerId: id },
      select: { id: true },
    });
    const borrowRecordIds = borrowRecords.map((b) => b.id);
    if (borrowRecordIds.length) {
      await tx.fine.deleteMany({ where: { borrowRecordId: { in: borrowRecordIds } } });
    }
    await tx.borrowRecord.deleteMany({ where: { readerId: id } });
    await tx.reservation.deleteMany({ where: { readerId: id } });
    await tx.notification.deleteMany({ where: { userId: id } });
    await tx.auditLog.deleteMany({ where: { userId: id } });
    await tx.review.deleteMany({ where: { userId: id } });
    await tx.session.deleteMany({ where: { userId: id } });

    if (user.student) {
      await tx.membershipCard.deleteMany({ where: { studentId: user.student.id } });
      await tx.fine.deleteMany({ where: { studentId: user.student.id } });
      await tx.student.delete({ where: { id: user.student.id } });
    }
    if (user.teacher) {
      await tx.membershipCard.deleteMany({ where: { teacherId: user.teacher.id } });
      await tx.fine.deleteMany({ where: { teacherId: user.teacher.id } });
      await tx.teacher.delete({ where: { id: user.teacher.id } });
    }

    await tx.user.delete({ where: { id } });
  });
};

module.exports = { getAll, getById, create, update, remove };
