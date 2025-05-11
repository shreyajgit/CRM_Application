const CommunicationLog = require('../models/CommunicationLog.model');
const Campaign = require('../models/Campaign.model');
const Customer = require('../models/Customer.model');
const { validationResult } = require('express-validator');

// @desc    Get all communication logs
// @route   GET /api/communication-logs
// @access  Private
exports.getAllCommunicationLogs = async (req, res, next) => {
  try {
    const logs = await CommunicationLog.find()
      .populate('campaign', 'name')
      .populate('customer', 'name email');
    
    res.status(200).json({
      success: true,
      count: logs.length,
      data: logs
    });
  } catch (error) {
    console.error('Get Communication Logs Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch communication logs'
    });
  }
};

// @desc    Get communication logs by campaign
// @route   GET /api/communication-logs/campaign/:campaignId
// @access  Private
exports.getLogsByCampaign = async (req, res, next) => {
  try {
    const campaignId = req.params.campaignId;
    
    // Verify campaign exists
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }
    
    const logs = await CommunicationLog.find({ campaign: campaignId })
      .populate('customer', 'name email');
    
    res.status(200).json({
      success: true,
      count: logs.length,
      data: logs
    });
  } catch (error) {
    console.error('Get Campaign Logs Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch campaign communication logs'
    });
  }
};

// @desc    Get communication logs by customer
// @route   GET /api/communication-logs/customer/:customerId
// @access  Private
exports.getLogsByCustomer = async (req, res, next) => {
  try {
    const customerId = req.params.customerId;
    
    // Verify customer exists
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }
    
    const logs = await CommunicationLog.find({ customer: customerId })
      .populate('campaign', 'name');
    
    res.status(200).json({
      success: true,
      count: logs.length,
      data: logs
    });
  } catch (error) {
    console.error('Get Customer Logs Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch customer communication logs'
    });
  }
};

// @desc    Create new communication log
// @route   POST /api/communication-logs
// @access  Private
exports.createCommunicationLog = async (req, res, next) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    
    // Verify campaign exists
    const campaign = await Campaign.findById(req.body.campaign);
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }
    
    // Verify customer exists
    const customer = await Customer.findById(req.body.customer);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }
    
    // Create log
    const log = await CommunicationLog.create(req.body);
    
    res.status(201).json({
      success: true,
      data: log
    });
  } catch (error) {
    console.error('Create Communication Log Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create communication log'
    });
  }
};

// @desc    Update communication log status
// @route   PUT /api/communication-logs/:id/status
// @access  Private
exports.updateLogStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a status'
      });
    }
    
    const validStatuses = ['pending', 'sent', 'failed', 'delivered', 'opened'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }
    
    const log = await CommunicationLog.findById(req.params.id);
    
    if (!log) {
      return res.status(404).json({
        success: false,
        message: 'Communication log not found'
      });
    }
    
    // Update log status
    log.status = status;
    
    // If status is delivered, set deliveredAt
    if (status === 'delivered') {
      log.deliveredAt = Date.now();
    }
    
    // If status is failed, increment delivery attempts
    if (status === 'failed') {
      log.deliveryAttempts += 1;
      
      // If failure reason provided
      if (req.body.failureReason) {
        log.failureReason = req.body.failureReason;
      }
    }
    
    await log.save();
    
    // Update campaign stats if applicable
    if (['sent', 'failed'].includes(status)) {
      const campaign = await Campaign.findById(log.campaign);
      if (campaign) {
        if (status === 'sent') {
          campaign.deliveryStats.sent += 1;
        } else if (status === 'failed') {
          campaign.deliveryStats.failed += 1;
        }
        await campaign.save();
      }
    }
    
    res.status(200).json({
      success: true,
      data: log
    });
  } catch (error) {
    console.error('Update Log Status Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update communication log status'
    });
  }
};

// @desc    Delete communication log
// @route   DELETE /api/communication-logs/:id
// @access  Private (Admin only)
exports.deleteLog = async (req, res, next) => {
  try {
    const log = await CommunicationLog.findById(req.params.id);
    
    if (!log) {
      return res.status(404).json({
        success: false,
        message: 'Communication log not found'
      });
    }
    
    await log.deleteOne();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Delete Log Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete communication log'
    });
  }
};

// @desc    Get communication log analytics
// @route   GET /api/communication-logs/analytics
// @access  Private
exports.getAnalytics = async (req, res, next) => {
  try {
    // Get total counts by status
    const statusCounts = await CommunicationLog.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Format results
    const analytics = {
      total: 0,
      byStatus: {}
    };
    
    statusCounts.forEach(item => {
      analytics.byStatus[item._id] = item.count;
      analytics.total += item.count;
    });
    
    // Get delivery rate
    const deliveryRate = analytics.byStatus.delivered 
      ? (analytics.byStatus.delivered / analytics.total * 100).toFixed(2)
      : 0;
    
    // Get open rate
    const openRate = analytics.byStatus.opened && analytics.byStatus.delivered
      ? (analytics.byStatus.opened / analytics.byStatus.delivered * 100).toFixed(2)
      : 0;
    
    analytics.deliveryRate = parseFloat(deliveryRate);
    analytics.openRate = parseFloat(openRate);
    
    res.status(200).json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Analytics Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch communication analytics'
    });
  }
};