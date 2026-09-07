const publishersService = require('../services/publishers.service');
const { sendSuccess } = require('../utils/apiResponse');

const getAll = async (req, res, next) => {
  try {
    const result = await publishersService.getAll(req.query);
    return sendSuccess(res, result);
  } catch (err) { next(err); }
};

const getAllSimple = async (req, res, next) => {
  try {
    const result = await publishersService.getAllSimple();
    return sendSuccess(res, result);
  } catch (err) { next(err); }
};

const getById = async (req, res, next) => {
  try {
    const publisher = await publishersService.getById(req.params.id);
    return sendSuccess(res, publisher);
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const publisher = await publishersService.create(req.body);
    return sendSuccess(res, publisher, 'Publisher created', 201);
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const publisher = await publishersService.update(req.params.id, req.body);
    return sendSuccess(res, publisher, 'Publisher updated');
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    await publishersService.remove(req.params.id);
    return sendSuccess(res, null, 'Publisher deleted');
  } catch (err) { next(err); }
};

module.exports = { getAll, getAllSimple, getById, create, update, remove };
