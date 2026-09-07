const router = require('express').Router();
const categoriesController = require('../controllers/categories.controller');
const { validate } = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const { categorySchema, querySchema } = require('../validations/categories.validation');

router.get('/simple', categoriesController.getAllSimple);
router.get('/', validate(querySchema, 'query'), categoriesController.getAll);
router.get('/:id', categoriesController.getById);
router.post('/', authenticate, authorize('admin'), validate(categorySchema), categoriesController.create);
router.put('/:id', authenticate, authorize('admin'), validate(categorySchema), categoriesController.update);
router.delete('/:id', authenticate, authorize('admin'), categoriesController.remove);

module.exports = router;
