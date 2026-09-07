const reportsService = require('../services/reports.service');
const { sendSuccess } = require('../utils/apiResponse');

const borrowingReport = async (req, res, next) => {
  try {
    const result = await reportsService.borrowingReport(req.query);
    return sendSuccess(res, result);
  } catch (err) { next(err); }
};

const bookReport = async (req, res, next) => {
  try {
    const result = await reportsService.bookReport(req.query);
    return sendSuccess(res, result);
  } catch (err) { next(err); }
};

const readerReport = async (req, res, next) => {
  try {
    const result = await reportsService.readerReport();
    return sendSuccess(res, result);
  } catch (err) { next(err); }
};

const overviewReport = async (req, res, next) => {
  try {
    const result = await reportsService.overviewReport();
    return sendSuccess(res, result);
  } catch (err) { next(err); }
};

module.exports = { borrowingReport, bookReport, readerReport, overviewReport };
