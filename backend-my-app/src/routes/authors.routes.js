const router = require('express').Router();
const authorsController = require('../controllers/authors.controller');
const { validate } = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const { authorSchema, querySchema } = require('../validations/authors.validation');

router.get('/', validate(querySchema, 'query'), authorsController.getAll);
router.get('/:id', authorsController.getById);
router.post('/', authenticate, authorize('admin'), validate(authorSchema), authorsController.create);
router.put('/:id', authenticate, authorize('admin'), validate(authorSchema), authorsController.update);
router.delete('/:id', authenticate, authorize('admin'), authorsController.remove);

module.exports = router;
