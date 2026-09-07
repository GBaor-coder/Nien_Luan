const router = require('express').Router();
const borrowingController = require('../controllers/borrowing.controller');
const { validate } = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const { borrowSchema, returnSchema, renewSchema, querySchema } = require('../validations/borrowing.validation');

router.get('/stats', authenticate, borrowingController.getStats);
router.get('/overdue', authenticate, authorize('admin', 'librarian'), borrowingController.getOverdueDetails);
router.post('/process-overdue', authenticate, authorize('admin'), borrowingController.processOverdue);
router.get('/', authenticate, validate(querySchema, 'query'), borrowingController.getAll);
router.get('/:id', authenticate, borrowingController.getById);
router.post('/', authenticate, authorize('admin', 'librarian'), validate(borrowSchema), borrowingController.create);
router.put('/:id/return', authenticate, authorize('admin', 'librarian'), validate(returnSchema), borrowingController.returnBook);
router.put('/:id/renew', authenticate, authorize('admin', 'librarian'), validate(renewSchema), borrowingController.renewBook);

module.exports = router;
