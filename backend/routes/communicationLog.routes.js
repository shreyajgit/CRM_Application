const express = require('express');
const { check } = require('express-validator');
const { 
  getAllCommunicationLogs,
  getLogsByCampaign,
  getLogsByCustomer,
  createCommunicationLog,
  updateLogStatus,
  deleteLog,
  getAnalytics
} = require('../controllers/communicationLog.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

// Protect all routes
router.use(protect);

// Validation middleware
const validateLog = [
  check('campaign', 'Campaign ID is required').isMongoId(),
  check('customer', 'Customer ID is required').isMongoId(),
  check('message', 'Message content is required').not().isEmpty()
];

// Base routes
router.route('/')
  .get(getAllCommunicationLogs)
  .post(validateLog, createCommunicationLog);

// Delete log - admin only
router.delete('/:id', authorize('admin'), deleteLog);

// Update log status
router.put('/:id/status', updateLogStatus);

// Get logs by campaign
router.get('/campaign/:campaignId', getLogsByCampaign);

// Get logs by customer
router.get('/customer/:customerId', getLogsByCustomer);

// Get analytics
router.get('/analytics', getAnalytics);

module.exports = router;