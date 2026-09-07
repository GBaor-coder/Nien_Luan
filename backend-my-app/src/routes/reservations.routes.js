const router = require('express').Router();
const reservationsController = require('../controllers/reservations.controller');
const { validate } = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const { reservationSchema, statusSchema, querySchema } = require('../validations/reservations.validation');

router.get('/', authenticate, validate(querySchema, 'query'), reservationsController.getAll);
router.get('/:id', authenticate, reservationsController.getById);
router.post('/', authenticate, validate(reservationSchema), reservationsController.create);
router.put('/:id/status', authenticate, authorize('admin', 'librarian'), validate(statusSchema), reservationsController.updateStatus);
router.delete('/:id', authenticate, reservationsController.remove);

module.exports = router;
