const router = require('express').Router();
const readersController = require('../controllers/readers.controller');
const { validate } = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const { readerSchema, querySchema } = require('../validations/readers.validation');

router.get('/', authenticate, validate(querySchema, 'query'), readersController.getAll);
router.get('/:id', authenticate, readersController.getById);
router.post('/', authenticate, authorize('admin'), validate(readerSchema), readersController.create);
router.put('/:id', authenticate, authorize('admin'), validate(readerSchema), readersController.update);
router.delete('/:id', authenticate, authorize('admin'), readersController.remove);

module.exports = router;
