const Joi = require('joi');

const userSchema = Joi.object({
  code: Joi.string().min(2).max(50).optional().allow('', null),
  name: Joi.string().min(2).max(255).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().pattern(/^[0-9]{10,11}$/).message('Số điện thoại phải gồm 10-11 chữ số').optional().allow('', null),
  password: Joi.string().min(6).optional().allow('', null),
  role: Joi.string().valid('admin', 'teacher', 'student').default('student'),
  status: Joi.string().valid('active', 'inactive', 'locked').default('active'),
});

const querySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().optional().allow('', null),
  role: Joi.string().optional().allow('', null),
  status: Joi.string().optional().allow('', null),
});

module.exports = { userSchema, querySchema };
