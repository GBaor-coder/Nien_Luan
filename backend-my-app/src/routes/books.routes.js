const router = require('express').Router();
const booksController = require('../controllers/books.controller');
const { validate } = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const { bookSchema, querySchema } = require('../validations/books.validation');

router.get('/', validate(querySchema, 'query'), booksController.getAll);
router.get('/:id', booksController.getById);
router.post('/sync-copies', authenticate, authorize('admin'), booksController.syncBookCopies);
router.post('/', authenticate, authorize('admin'), validate(bookSchema), booksController.create);
router.put('/:id', authenticate, authorize('admin'), validate(bookSchema), booksController.update);
router.delete('/:id', authenticate, authorize('admin'), booksController.remove);

module.exports = router;
