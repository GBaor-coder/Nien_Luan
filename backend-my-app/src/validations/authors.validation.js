const Joi = require('joi');

const authorSchema = Joi.object({
  name: Joi.string().min(1).max(255).required(),
  nationality: Joi.string().max(100).optional().allow('', null),
  bio: Joi.string().optional().allow('', null),
  avatar: Joi.string().optional().allow('', null),
  birthYear: Joi.number().integer().min(1000).max(2100).optional().allow(null),
  deathYear: Joi.number().integer().min(1000).max(2100).optional().allow(null),
});

const querySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(1000).default(10),
  search: Joi.string().optional().allow('', null),
});

module.exports = { authorSchema, querySchema };
