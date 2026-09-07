const Joi = require('joi');

const borrowSchema = Joi.object({
  readerId: Joi.string().required(),
  bookId: Joi.string().required(),
  borrowDate: Joi.date().optional(),
  dueDate: Joi.date().optional(),
  readerType: Joi.string().valid('student', 'teacher').optional(),
  notes: Joi.string().optional().allow('', null),
});

const returnSchema = Joi.object({
  notes: Joi.string().optional().allow('', null),
});

const renewSchema = Joi.object({
  dueDate: Joi.date().optional(),
  notes: Joi.string().optional().allow('', null),
});

const querySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().optional().allow('', null),
  status: Joi.string().optional().allow('', null),
});

module.exports = { borrowSchema, returnSchema, renewSchema, querySchema };
