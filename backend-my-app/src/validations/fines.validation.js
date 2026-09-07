const Joi = require('joi');

const fineSchema = Joi.object({
  readerId: Joi.string().required(),
  borrowRecordId: Joi.string().optional().allow('', null),
  amount: Joi.number().positive().required(),
  reason: Joi.string().min(1).max(500).required(),
  notes: Joi.string().max(1000).optional().allow('', null),
});

const paymentSchema = Joi.object({
  paidAmount: Joi.number().positive().required(),
  notes: Joi.string().max(1000).optional().allow('', null),
});

const querySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().optional().allow('', null),
  status: Joi.string().valid('pending', 'partial', 'partially_paid', 'paid', 'waived').optional().allow('', null),
  readerId: Joi.string().optional().allow('', null),
});

module.exports = { fineSchema, paymentSchema, querySchema };
