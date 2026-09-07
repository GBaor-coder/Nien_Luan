const router = require('express').Router();
const rolesController = require('../controllers/roles.controller');
const { validate } = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const { roleSchema, querySchema } = require('../validations/roles.validation');

router.get('/', validate(querySchema, 'query'), rolesController.getAll);
router.get('/:id', rolesController.getById);
router.post('/', authenticate, authorize('admin'), validate(roleSchema), rolesController.create);
router.put('/:id', authenticate, authorize('admin'), validate(roleSchema), rolesController.update);
router.delete('/:id', authenticate, authorize('admin'), rolesController.remove);

module.exports = router;
