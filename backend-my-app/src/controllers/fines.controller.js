const finesService = require('../services/fines.service');
const { sendSuccess } = require('../utils/apiResponse');

const getAll = async (req, res, next) => {
  try {
    const result = await finesService.getAll(req.query, req.user);
    return sendSuccess(res, result);
  } catch (err) { next(err); }
};

const getById = async (req, res, next) => {
  try {
    const fine = await finesService.getById(req.params.id, req.user);
    return sendSuccess(res, fine);
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const fine = await finesService.create(req.body);
    return sendSuccess(res, fine, 'Fine created', 201);
  } catch (err) { next(err); }
};

const addPayment = async (req, res, next) => {
  try {
    const fine = await finesService.addPayment(req.params.id, req.body);
    return sendSuccess(res, fine, 'Payment recorded');
  } catch (err) { next(err); }
};

const waive = async (req, res, next) => {
  try {
    const fine = await finesService.waive(req.params.id);
    return sendSuccess(res, fine, 'Fine waived');
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    await finesService.remove(req.params.id);
    return sendSuccess(res, null, 'Fine deleted');
  } catch (err) { next(err); }
};

const getStats = async (req, res, next) => {
  try {
    const result = await finesService.getStats();
    return sendSuccess(res, result);
  } catch (err) { next(err); }
};

module.exports = { getAll, getById, create, addPayment, waive, remove, getStats };
