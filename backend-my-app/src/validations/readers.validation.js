const Joi = require('joi');

const readerSchema = Joi.object({
  name: Joi.string().min(1).max(255).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().pattern(/^[0-9]{10,11}$/).optional().allow('', null),
  password: Joi.string().min(6).optional().allow('', null),
  status: Joi.string().valid('active', 'inactive', 'locked').optional().default('active'),
  readerType: Joi.string().valid('student', 'teacher').optional(),
  code: Joi.string().optional().allow('', null),
  address: Joi.string().optional().allow('', null),
  // Student profile
  studentId: Joi.string().optional().allow('', null),
  className: Joi.string().optional().allow('', null),
  grade: Joi.number().integer().min(1).max(12).optional().allow('', null),
  enrollYear: Joi.number().integer().optional().allow('', null),
  // Teacher profile
  teacherId: Joi.string().optional().allow('', null),
  department: Joi.string().optional().allow('', null),
  position: Joi.string().optional().allow('', null),
  degree: Joi.string().optional().allow('', null),
});

const querySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().optional().allow('', null),
  status: Joi.string().optional().allow('', null),
  readerType: Joi.string().valid('student', 'teacher').optional().allow('', null),
});

module.exports = { readerSchema, querySchema };
