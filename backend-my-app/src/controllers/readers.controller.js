const readersService = require('../services/readers.service');
const { sendSuccess } = require('../utils/apiResponse');

const getAll = async (req, res, next) => {
  try {
    const result = await readersService.getAll(req.query);
    return sendSuccess(res, result);
  } catch (err) { next(err); }
};

const getById = async (req, res, next) => {
  try {
    const reader = await readersService.getById(req.params.id);
    return sendSuccess(res, reader);
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const reader = await readersService.create(req.body);
    return sendSuccess(res, reader, 'Reader created', 201);
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const reader = await readersService.update(req.params.id, req.body);
    return sendSuccess(res, reader, 'Reader updated');
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    await readersService.remove(req.params.id);
    return sendSuccess(res, null, 'Reader deleted');
  } catch (err) { next(err); }
};

module.exports = { getAll, getById, create, update, remove };
