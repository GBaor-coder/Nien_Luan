const Joi = require('joi');

const publisherSchema = Joi.object({
  name: Joi.string().min(1).max(255).required(),
  address: Joi.string().max(500).optional().allow('', null),
  phone: Joi.string().max(20).optional().allow('', null),
  email: Joi.string().email().optional().allow('', null),
  website: Joi.string().uri().optional().allow('', null),
  description: Joi.string().max(1000).optional().allow('', null),
});

const querySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().optional().allow('', null),
});

module.exports = { publisherSchema, querySchema };
