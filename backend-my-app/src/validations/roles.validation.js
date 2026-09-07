const Joi = require('joi');

const roleSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  description: Joi.string().max(500).optional().allow('', null),
  permissions: Joi.array().items(Joi.string()).optional(),
});

const querySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().optional().allow('', null),
});

module.exports = { roleSchema, querySchema };
