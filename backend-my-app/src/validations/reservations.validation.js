const Joi = require('joi');

const reservationSchema = Joi.object({
  readerId: Joi.string().required(),
  bookId: Joi.string().required(),
  readerType: Joi.string().valid('student', 'teacher').required(),
  studentId: Joi.string().optional().allow('', null),
  teacherId: Joi.string().optional().allow('', null),
  estimatedAvailability: Joi.date().optional(),
});

const statusSchema = Joi.object({
  status: Joi.string().valid('in_queue', 'processing', 'ready_for_pickup', 'fulfilled', 'expired', 'cancelled').required(),
});

const querySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().optional().allow('', null),
  status: Joi.string().valid('in_queue', 'processing', 'ready_for_pickup', 'fulfilled', 'expired', 'cancelled').optional().allow('', null),
  readerId: Joi.string().optional().allow('', null),
});

module.exports = { reservationSchema, statusSchema, querySchema };
