const generateId = (prefix, length = 3) => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 2 + length);
  return `${prefix}-${timestamp}${random}`.toUpperCase();
};

const calculateBookStatus = (available, quantity) => {
  if (available === 0) return 'out_of_stock';
  if (available < quantity * 0.3) return 'limited';
  return 'available';
};

const calculateRemainingDays = (dueDate) => {
  const now = new Date();
  const due = new Date(dueDate);
  const diff = due - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

module.exports = { generateId, calculateBookStatus, calculateRemainingDays };
