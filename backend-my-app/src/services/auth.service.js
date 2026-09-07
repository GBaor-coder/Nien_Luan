const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../config/database');

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

const register = async (data) => {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) throw Object.assign(new Error('Email already registered'), { statusCode: 409 });

  const hashedPassword = await bcrypt.hash(data.password, 10);

  // Find role by name, default to 'student'
  const roleName = data.role || 'student';
  const role = await prisma.role.findFirst({ where: { name: roleName } });
  if (!role) throw Object.assign(new Error('Invalid role'), { statusCode: 400 });

  const user = await prisma.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        phone: data.phone,
        code: `USR-${Date.now()}`,
        roleId: role.id,
        status: 'active',
      },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    if (roleName === 'student') {
      await tx.student.create({
        data: {
          studentId: `HV${new Date().getFullYear()}${Math.floor(100 + Math.random() * 900)}`,
          className: data.className || 'Chưa xếp lớp',
          grade: data.grade || 10,
          enrollYear: data.enrollYear || new Date().getFullYear(),
          status: 'active',
          userId: created.id,
        },
      });
    } else if (roleName === 'teacher') {
      await tx.teacher.create({
        data: {
          teacherId: `GV${new Date().getFullYear()}${Math.floor(100 + Math.random() * 900)}`,
          department: data.department || 'Chưa phân công',
          position: data.position,
          degree: data.degree,
          status: 'active',
          userId: created.id,
        },
      });
    }

    return created;
  });

  const tokenPayload = { id: user.id, email: user.email, role: role.name };
  const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
  return { user: { ...user, role: role.name }, token };
};

const login = async (username, password) => {
  let user = null;

  const student = await prisma.student.findUnique({
    where: { studentId: username },
    include: { user: { include: { role: true } } },
  });
  if (student) user = student.user;

  if (!user) {
    const teacher = await prisma.teacher.findUnique({
      where: { teacherId: username },
      include: { user: { include: { role: true } } },
    });
    if (teacher) user = teacher.user;
  }

  if (!user) {
    const codeUser = await prisma.user.findUnique({
      where: { code: username },
      include: { role: true },
    });
    if (codeUser) user = codeUser;
  }

  if (!user) {
    const emailUser = await prisma.user.findUnique({
      where: { email: username },
      include: { role: true },
    });
    if (emailUser) user = emailUser;
  }

  if (!user) throw Object.assign(new Error('Invalid credentials'), { statusCode: 401 });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw Object.assign(new Error('Invalid credentials'), { statusCode: 401 });

  await prisma.user.update({ where: { id: user.id }, data: { lastActive: new Date() } });

  const tokenPayload = { id: user.id, email: user.email, role: user.role.name };
  const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
  const { password: _, role: __, ...userWithoutPassword } = user;
  return { user: { ...userWithoutPassword, role: user.role.name }, token };
};

const getProfile = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true, name: true, email: true, phone: true, avatar: true,
      gender: true, dateOfBirth: true, code: true,
      role: { select: { name: true } },
      status: true, createdAt: true,
      student: {
        select: {
          id: true, studentId: true, className: true, grade: true,
          enrollYear: true, status: true,
          membershipCard: {
            select: { id: true, cardNumber: true, maxBorrow: true, borrowDays: true, expiryDate: true, status: true }
          }
        }
      },
      teacher: {
        select: {
          id: true, teacherId: true, department: true, position: true,
          degree: true, status: true,
          membershipCard: {
            select: { id: true, cardNumber: true, maxBorrow: true, borrowDays: true, expiryDate: true, status: true }
          }
        }
      },
    },
  });
  if (!user) throw Object.assign(new Error('User not found'), { statusCode: 404 });
  return { ...user, role: user.role.name };
};

module.exports = { register, login, getProfile };
