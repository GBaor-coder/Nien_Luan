const Joi = require('joi');
const { sendError } = require('../utils/apiResponse');

const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], { abortEarly: false, stripUnknown: true });
    if (error) {
      const errors = error.details.map((d) => d.message);
      return sendError(res, 'Validation failed', 422, errors);
    }
    req[property] = value;
    next();
  };
};

module.exports = { validate };
