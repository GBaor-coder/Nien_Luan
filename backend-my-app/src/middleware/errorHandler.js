const { sendError } = require('../utils/apiResponse');

const errorHandler = (err, req, res, _next) => {
  console.error('Error:', err.message);
  console.error(err.stack);

  if (err.code === 'P2002') {
    return sendError(res, 'A record with this value already exists.', 409);
  }
  if (err.code === 'P2025') {
    return sendError(res, 'Record not found.', 404);
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  return sendError(res, message, statusCode);
};

module.exports = errorHandler;
