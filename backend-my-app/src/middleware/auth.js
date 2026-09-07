const jwt = require('jsonwebtoken');
const { sendError } = require('../utils/apiResponse');

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendError(res, 'Access denied. No token provided.', 401);
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return sendError(res, 'Invalid or expired token.', 401);
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'Access denied.', 401);
    }
    if (roles.length && !roles.includes(req.user.role)) {
      return sendError(res, 'Insufficient permissions.', 403);
    }
    next();
  };
};

module.exports = { authenticate, authorize };
