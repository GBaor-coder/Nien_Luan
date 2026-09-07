const borrowingService = require('../services/borrowing.service');
const { sendSuccess } = require('../utils/apiResponse');

const getAll = async (req, res, next) => {
  try {
    const result = await borrowingService.getAll(req.query, req.user);
    return sendSuccess(res, result);
  } catch (err) { next(err); }
};

const getById = async (req, res, next) => {
  try {
    const record = await borrowingService.getById(req.params.id, req.user);
    return sendSuccess(res, record);
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const record = await borrowingService.create(req.body);
    return sendSuccess(res, record, 'Borrowing record created', 201);
  } catch (err) { next(err); }
};

const returnBook = async (req, res, next) => {
  try {
    const record = await borrowingService.returnBook(req.params.id, req.body.notes);
    return sendSuccess(res, record, 'Book returned successfully');
  } catch (err) { next(err); }
};

const getStats = async (req, res, next) => {
  try {
    const stats = await borrowingService.getStats();
    return sendSuccess(res, stats);
  } catch (err) { next(err); }
};

const renewBook = async (req, res, next) => {
  try {
    const record = await borrowingService.renewBook(req.params.id, req.body);
    return sendSuccess(res, record, 'Book renewed successfully');
  } catch (err) { next(err); }
};

const getOverdueDetails = async (req, res, next) => {
  try {
    const result = await borrowingService.getOverdueDetails(req.query);
    return sendSuccess(res, result);
  } catch (err) { next(err); }
};

const processOverdue = async (req, res, next) => {
  try {
    const result = await borrowingService.processOverdue();
    return sendSuccess(res, result, `Đã chuyển ${result.markedOverdue} phiếu sang quá hạn, tạo ${result.created.length} phiếu phạt`);
  } catch (err) { next(err); }
};

module.exports = { getAll, getById, create, returnBook, getStats, renewBook, getOverdueDetails, processOverdue };
