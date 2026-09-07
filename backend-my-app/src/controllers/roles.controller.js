const rolesService = require('../services/roles.service');
const { sendSuccess } = require('../utils/apiResponse');

const getAll = async (req, res, next) => {
  try {
    const result = await rolesService.getAll(req.query || {});
    return sendSuccess(res, result);
  } catch (err) { next(err); }
};

const getById = async (req, res, next) => {
  try {
    const role = await rolesService.getById(req.params.id);
    return sendSuccess(res, role);
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const role = await rolesService.create(req.body);
    return sendSuccess(res, role, 'Role created', 201);
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const role = await rolesService.update(req.params.id, req.body);
    return sendSuccess(res, role, 'Role updated');
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    await rolesService.remove(req.params.id);
    return sendSuccess(res, null, 'Role deleted');
  } catch (err) { next(err); }
};

module.exports = { getAll, getById, create, update, remove };
