const router = require('express').Router();
const usersController = require('../controllers/users.controller');
const { validate } = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const { userSchema, querySchema } = require('../validations/users.validation');

router.get('/', authenticate, validate(querySchema, 'query'), usersController.getAll);
router.get('/:id', authenticate, usersController.getById);
router.post('/', authenticate, authorize('admin'), validate(userSchema), usersController.create);
router.put('/:id', authenticate, authorize('admin'), validate(userSchema), usersController.update);
router.put('/:id/password', authenticate, authorize('admin'), usersController.changePassword);
router.delete('/:id', authenticate, authorize('admin'), usersController.remove);

module.exports = router;
