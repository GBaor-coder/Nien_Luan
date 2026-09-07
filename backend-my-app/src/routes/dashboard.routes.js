const router = require('express').Router();
const dashboardController = require('../controllers/dashboard.controller');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/overview', authenticate, authorize('admin', 'teacher'), dashboardController.getOverview);
router.get('/borrowing-trends', authenticate, authorize('admin', 'teacher'), dashboardController.getBorrowingTrends);
router.get('/category-distribution', authenticate, authorize('admin', 'teacher'), dashboardController.getCategoryDistribution);
router.get('/recent-activity', authenticate, authorize('admin', 'teacher'), dashboardController.getRecentActivity);
router.get('/status-distribution', authenticate, authorize('admin', 'teacher'), dashboardController.getStatusDistribution);

module.exports = router;
