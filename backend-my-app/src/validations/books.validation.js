const Joi = require('joi');

const bookSchema = Joi.object({
  title: Joi.string().min(1).max(255).required(),
  isbn: Joi.string().max(20).optional().allow('', null),
  authorId: Joi.string().optional().allow('', null),
  categoryId: Joi.string().optional().allow('', null),
  publisherId: Joi.string().optional().allow('', null),
  year: Joi.number().integer().min(1000).max(9999).optional().allow(null),
  pages: Joi.number().integer().min(1).optional().allow(null),
  language: Joi.string().max(50).default('English'),
  price: Joi.number().min(0).optional().allow(null),
  location: Joi.string().max(50).optional().allow('', null),
  description: Joi.string().optional().allow('', null),
  coverImage: Joi.string().optional().allow('', null),
  coverColor: Joi.string().max(20).default('#2563EB'),
  edition: Joi.string().max(50).optional().allow('', null),
  quantity: Joi.number().integer().min(0).default(1),
  available: Joi.number().integer().min(0).default(1),
});

const querySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().optional().allow('', null),
  categoryId: Joi.string().optional().allow('', null),
  authorId: Joi.string().optional().allow('', null),
  publisherId: Joi.string().optional().allow('', null),
  status: Joi.string().optional().allow('', null),
  sort: Joi.string().valid('title', 'author', 'category', 'year', 'createdAt', 'quantity').default('createdAt'),
  order: Joi.string().valid('asc', 'desc').default('desc'),
});

module.exports = { bookSchema, querySchema };
