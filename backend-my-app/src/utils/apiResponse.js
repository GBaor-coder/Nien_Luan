const sendSuccess = (res, data = null, message = 'Success', statusCode = 200) => {
  const response = { success: true, message };
  if (data !== null) response.data = data;
  return res.status(statusCode).json(response);
};

const sendError = (res, message = 'Internal Server Error', statusCode = 500, errors = null) => {
  const response = { success: false, message };
  if (errors) response.errors = errors;
  return res.status(statusCode).json(response);
};

const paginate = (page = 1, limit = 10) => {
  const p = Math.max(1, parseInt(page) || 1);
  const l = Math.min(1000, Math.max(1, parseInt(limit) || 10));
  return { skip: (p - 1) * l, take: l, page: p, limit: l };
};

const buildPagination = (total, page, limit) => {
  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    hasNext: page * limit < total,
    hasPrev: page > 1,
  };
};

module.exports = { sendSuccess, sendError, paginate, buildPagination };
