const reservationsService = require('../services/reservations.service');
const { sendSuccess } = require('../utils/apiResponse');

const getAll = async (req, res, next) => {
  try {
    const result = await reservationsService.getAll(req.query, req.user);
    return sendSuccess(res, result);
  } catch (err) { next(err); }
};

const getById = async (req, res, next) => {
  try {
    const reservation = await reservationsService.getById(req.params.id, req.user);
    return sendSuccess(res, reservation);
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const reservation = await reservationsService.create(req.body, req.user?.id);
    return sendSuccess(res, reservation, 'Reservation created', 201);
  } catch (err) { next(err); }
};

const updateStatus = async (req, res, next) => {
  try {
    const reservation = await reservationsService.updateStatus(req.params.id, req.body.status, req.user);
    return sendSuccess(res, reservation, 'Reservation status updated');
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    await reservationsService.remove(req.params.id, req.user);
    return sendSuccess(res, null, 'Reservation cancelled');
  } catch (err) { next(err); }
};

module.exports = { getAll, getById, create, updateStatus, remove };
