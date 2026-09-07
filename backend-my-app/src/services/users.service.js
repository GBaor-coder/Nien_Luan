const prisma = require('../config/database');
const { paginate, buildPagination } = require('../utils/apiResponse');

const getAll = async (query) => {
  const { skip, take, page, limit } = paginate(query.page, query.limit);
  const where = {};
  if (query.search) {
    where.OR = [
      { name: { contains: query.search } },
      { email: { contains: query.search } },
    ];
  }
  if (query.role) where.role = { name: query.role };
  if (query.status) where.status = query.status;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where, skip, take, orderBy: { createdAt: 'desc' },
      select: {
        id: true, code: true, name: true, email: true, phone: true,
        role: { select: { name: true } },
        status: true, lastActive: true, createdAt: true,
      },
    }),
    prisma.user.count({ where }),
  ]);

  // Map role object to string
  const result = users.map((u) => ({ ...u, role: u.role.name }));

  return { users: result, pagination: buildPagination(total, page, limit) };
};

const getById = async (id, currentUser) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true, code: true, name: true, email: true, phone: true, avatar: true,
      role: { select: { name: true } },
      status: true, lastActive: true, createdAt: true,
    },
  });
  if (!user) throw Object.assign(new Error('User not found'), { statusCode: 404 });
  if (currentUser && currentUser.role !== 'admin' && currentUser.id !== id) {
    throw Object.assign(new Error('Access denied'), { statusCode: 403 });
  }
  return { ...user, role: user.role.name };
};

const create = async (data) => {
  const bcrypt = require('bcrypt');
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) throw Object.assign(new Error('Email already exists'), { statusCode: 409 });

  if (data.code && data.code.trim()) {
    const existingCode = await prisma.user.findUnique({ where: { code: data.code } });
    if (existingCode) throw Object.assign(new Error('Mã số đã tồn tại'), { statusCode: 409 });
  }

  // Convert role name to roleId
  const roleName = data.role || 'student';
  const role = await prisma.role.findFirst({ where: { name: roleName } });
  if (!role) throw Object.assign(new Error('Invalid role'), { statusCode: 400 });

  const hashedPassword = await bcrypt.hash(data.password || 'default123', 10);
  const now = new Date();
  const userCode = data.code && data.code.trim() ? data.code.trim() : `USR-${Date.now()}`;
  const user = await prisma.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        code: userCode,
        status: data.status || 'active',
        password: hashedPassword,
        roleId: role.id,
      },
      select: {
        id: true, code: true, name: true, email: true, phone: true,
        role: { select: { name: true } },
        status: true, createdAt: true,
      },
    });

    if (roleName === 'student') {
      await tx.student.create({
        data: {
          studentId: `HV${now.getFullYear()}${Math.floor(100 + Math.random() * 900)}`,
          className: data.className || 'Chưa xếp lớp',
          grade: data.grade || 10,
          enrollYear: data.enrollYear || now.getFullYear(),
          status: data.status || 'active',
          userId: created.id,
        },
      });
    } else if (roleName === 'teacher') {
      await tx.teacher.create({
        data: {
          teacherId: `GV${now.getFullYear()}${Math.floor(100 + Math.random() * 900)}`,
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
  return { ...user, role: user.role.name };
};

const update = async (id, data) => {
  await prisma.user.findUniqueOrThrow({ where: { id } }).catch(() => {
    throw Object.assign(new Error('User not found'), { statusCode: 404 });
  });

  const updateData = { ...data };

  // Check code uniqueness if provided
  if (data.code && data.code.trim()) {
    const existing = await prisma.user.findUnique({ where: { code: data.code } });
    if (existing && existing.id !== id) {
      throw Object.assign(new Error('Mã số đã tồn tại'), { statusCode: 409 });
    }
    updateData.code = data.code.trim();
  }

  if (data.role) {
    const role = await prisma.role.findFirst({ where: { name: data.role } });
    if (!role) throw Object.assign(new Error('Invalid role'), { statusCode: 400 });
    updateData.roleId = role.id;
    delete updateData.role;
  }

  const user = await prisma.user.update({
    where: { id }, data: updateData,
    select: {
      id: true, code: true, name: true, email: true, phone: true,
      role: { select: { name: true } },
      status: true, lastActive: true, createdAt: true,
    },
  });
  return { ...user, role: user.role.name };
};

const remove = async (id) => {
  const user = await prisma.user.findUnique({
    where: { id },
    include: { student: true, teacher: true, librarian: true },
  });
  if (!user) throw Object.assign(new Error('User not found'), { statusCode: 404 });

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
    if (user.librarian) {
      await tx.borrowRecord.updateMany({
        where: { librarianId: user.librarian.id },
        data: { librarianId: null },
      });
      await tx.librarian.delete({ where: { id: user.librarian.id } });
    }

    await tx.user.delete({ where: { id } });
  });
};

const changePassword = async (id, newPassword) => {
  const bcrypt = require('bcrypt');
  await prisma.user.findUniqueOrThrow({ where: { id } }).catch(() => {
    throw Object.assign(new Error('User not found'), { statusCode: 404 });
  });
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id }, data: { password: hashedPassword } });
};

module.exports = { getAll, getById, create, update, changePassword, remove };
