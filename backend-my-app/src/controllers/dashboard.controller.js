const dashboardService = require('../services/dashboard.service');
const { sendSuccess } = require('../utils/apiResponse');

const getOverview = async (req, res, next) => {
  try {
    const data = await dashboardService.getOverview(req.query);
    return sendSuccess(res, data);
  } catch (err) { next(err); }
};

const getBorrowingTrends = async (req, res, next) => {
  try {
    const data = await dashboardService.getBorrowingTrends(req.query);
    return sendSuccess(res, data);
  } catch (err) { next(err); }
};

const getCategoryDistribution = async (req, res, next) => {
  try {
    const data = await dashboardService.getCategoryDistribution(req.query);
    return sendSuccess(res, data);
  } catch (err) { next(err); }
};

const getRecentActivity = async (req, res, next) => {
  try {
    const data = await dashboardService.getRecentActivity(parseInt(req.query.limit) || 10);
    return sendSuccess(res, data);
  } catch (err) { next(err); }
};

const getStatusDistribution = async (req, res, next) => {
  try {
    const data = await dashboardService.getStatusDistribution();
    return sendSuccess(res, data);
  } catch (err) { next(err); }
};

module.exports = { getOverview, getBorrowingTrends, getCategoryDistribution, getRecentActivity, getStatusDistribution };
