const router = require('express').Router();
const publishersController = require('../controllers/publishers.controller');
const { validate } = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const { publisherSchema, querySchema } = require('../validations/publishers.validation');

router.get('/simple', publishersController.getAllSimple);
router.get('/', validate(querySchema, 'query'), publishersController.getAll);
router.get('/:id', publishersController.getById);
router.post('/', authenticate, authorize('admin'), validate(publisherSchema), publishersController.create);
router.put('/:id', authenticate, authorize('admin'), validate(publisherSchema), publishersController.update);
router.delete('/:id', authenticate, authorize('admin'), publishersController.remove);

module.exports = router;
