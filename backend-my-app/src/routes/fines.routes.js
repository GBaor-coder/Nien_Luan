const router = require('express').Router();
const finesController = require('../controllers/fines.controller');
const { validate } = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const { fineSchema, paymentSchema, querySchema } = require('../validations/fines.validation');

router.get('/stats', authenticate, authorize('admin'), finesController.getStats);
router.get('/', authenticate, validate(querySchema, 'query'), finesController.getAll);
router.get('/:id', authenticate, finesController.getById);
router.post('/', authenticate, authorize('admin'), validate(fineSchema), finesController.create);
router.put('/:id/payment', authenticate, authorize('admin'), validate(paymentSchema), finesController.addPayment);
router.put('/:id/waive', authenticate, authorize('admin'), finesController.waive);
router.delete('/:id', authenticate, authorize('admin'), finesController.remove);

module.exports = router;
