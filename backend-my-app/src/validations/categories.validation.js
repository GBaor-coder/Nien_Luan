const Joi = require('joi');

const categorySchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  description: Joi.string().optional().allow('', null),
  color: Joi.string().max(20).default('#2563EB'),
});

const querySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().optional().allow('', null),
});

module.exports = { categorySchema, querySchema };
