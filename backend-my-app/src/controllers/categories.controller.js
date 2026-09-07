const categoriesService = require('../services/categories.service');
const { sendSuccess } = require('../utils/apiResponse');

const getAll = async (req, res, next) => {
  try {
    const result = await categoriesService.getAll(req.query);
    return sendSuccess(res, result);
  } catch (err) { next(err); }
};

const getAllSimple = async (req, res, next) => {
  try {
    const result = await categoriesService.getAllSimple();
    return sendSuccess(res, result);
  } catch (err) { next(err); }
};

const getById = async (req, res, next) => {
  try {
    const category = await categoriesService.getById(req.params.id);
    return sendSuccess(res, category);
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const category = await categoriesService.create(req.body);
    return sendSuccess(res, category, 'Category created', 201);
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const category = await categoriesService.update(req.params.id, req.body);
    return sendSuccess(res, category, 'Category updated');
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    await categoriesService.remove(req.params.id);
    return sendSuccess(res, null, 'Category deleted');
  } catch (err) { next(err); }
};

module.exports = { getAll, getAllSimple, getById, create, update, remove };
