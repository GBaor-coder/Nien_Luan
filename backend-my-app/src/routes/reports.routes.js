const router = require('express').Router();
const reportsController = require('../controllers/reports.controller');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/overview', authenticate, authorize('admin', 'teacher'), reportsController.overviewReport);
router.get('/borrowing', authenticate, authorize('admin', 'teacher'), reportsController.borrowingReport);
router.get('/books', authenticate, authorize('admin', 'teacher'), reportsController.bookReport);
router.get('/readers', authenticate, authorize('admin', 'teacher'), reportsController.readerReport);

module.exports = router;
