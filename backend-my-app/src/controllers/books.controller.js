const booksService = require('../services/books.service');
const { sendSuccess } = require('../utils/apiResponse');

const getAll = async (req, res, next) => {
  try {
    const result = await booksService.getAll(req.query);
    return sendSuccess(res, result);
  } catch (err) { next(err); }
};

const getById = async (req, res, next) => {
  try {
    const book = await booksService.getById(req.params.id);
    return sendSuccess(res, book);
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const book = await booksService.create(req.body);
    return sendSuccess(res, book, 'Book created', 201);
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const book = await booksService.update(req.params.id, req.body);
    return sendSuccess(res, book, 'Book updated');
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    await booksService.remove(req.params.id);
    return sendSuccess(res, null, 'Book deleted');
  } catch (err) { next(err); }
};

const syncBookCopies = async (req, res, next) => {
  try {
    const result = await booksService.syncBookCopies();
    return sendSuccess(res, result, 'Book copies synced');
  } catch (err) { next(err); }
};

module.exports = { getAll, getById, create, update, remove, syncBookCopies };
