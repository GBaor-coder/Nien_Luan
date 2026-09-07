const usersService = require('../services/users.service');
const { sendSuccess } = require('../utils/apiResponse');

const getAll = async (req, res, next) => {
  try {
    const result = await usersService.getAll(req.query);
    return sendSuccess(res, result);
  } catch (err) { next(err); }
};

const getById = async (req, res, next) => {
  try {
    const user = await usersService.getById(req.params.id, req.user);
    return sendSuccess(res, user);
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const user = await usersService.create(req.body);
    return sendSuccess(res, user, 'User created', 201);
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const user = await usersService.update(req.params.id, req.body);
    return sendSuccess(res, user, 'User updated');
  } catch (err) { next(err); }
};

const changePassword = async (req, res, next) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }
    await usersService.changePassword(req.params.id, password);
    return sendSuccess(res, null, 'Password updated successfully');
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    await usersService.remove(req.params.id);
    return sendSuccess(res, null, 'User deleted');
  } catch (err) { next(err); }
};

module.exports = { getAll, getById, create, update, changePassword, remove };
