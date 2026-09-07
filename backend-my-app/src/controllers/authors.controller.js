const authorsService = require('../services/authors.service');
const { sendSuccess } = require('../utils/apiResponse');

const getAll = async (req, res, next) => {
  try {
    const result = await authorsService.getAll(req.query);
    return sendSuccess(res, result);
  } catch (err) { next(err); }
};

const getById = async (req, res, next) => {
  try {
    const author = await authorsService.getById(req.params.id);
    return sendSuccess(res, author);
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const author = await authorsService.create(req.body);
    return sendSuccess(res, author, 'Author created', 201);
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const author = await authorsService.update(req.params.id, req.body);
    return sendSuccess(res, author, 'Author updated');
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    await authorsService.remove(req.params.id);
    return sendSuccess(res, null, 'Author deleted');
  } catch (err) { next(err); }
};

module.exports = { getAll, getById, create, update, remove };
