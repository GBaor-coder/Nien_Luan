const Joi = require('joi');

const notificationSchema = Joi.object({
  userId: Joi.string().required(),
  title: Joi.string().min(1).max(255).required(),
  message: Joi.string().required(),
  type: Joi.string().valid('info', 'warning', 'error', 'success').default('info'),
});

const querySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  unreadOnly: Joi.boolean().default(false),
});

module.exports = { notificationSchema, querySchema };
