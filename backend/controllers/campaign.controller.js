const Campaign = require('../models/Campaign.model');
const Customer = require('../models/Customer.model');
const { validationResult } = require('express-validator');

// @desc    Get all campaigns
// @route   GET /api/campaigns
// @access  Private
exports.getAllCampaigns = async (req, res, next) => {
  try {
    const campaigns = await Campaign.find().populate('creator', 'name email');
    console.log('Campaigns:', campaigns);
    res.status(200).json({
      success: true,
      count: campaigns.length,
      data: campaigns
    });
  } catch (error) {
    console.error('Get Campaigns Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch campaigns'
    });
  }
};

// @desc    Get single campaign
// @route   GET /api/campaigns/:id
// @access  Private
exports.getCampaignById = async (req, res, next) => {
  try {
    const campaign = await Campaign.findById(req.params.id).populate('creator', 'name email');
    
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: campaign
    });
  } catch (error) {
    console.error('Get Campaign Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch campaign'
    });
  }
};

// @desc    Create new campaign
// @route   POST /api/campaigns
// @access  Private
exports.createCampaign = async (req, res, next) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
  
    // Add user as creator
    req.body.creator = req.user.id;
    
    // Calculate audience size based on segment rules
    
    const campaign = await Campaign.create(req.body);
    
    res.status(201).json({
      success: true,
      data: campaign
    });
  } catch (error) {
    console.error('Create Campaign Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create campaign'
    });
  }
};

// @desc    Update campaign
// @route   PUT /api/campaigns/:id
// @access  Private
exports.updateCampaign = async (req, res, next) => {
  try {
    let campaign = await Campaign.findById(req.params.id);
    
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }
    // console.log(req.body)
    // Check ownership
    if (campaign.creator.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this campaign'
      });
    }
    
    // Set updatedAt timestamp
    req.body.updatedAt = Date.now();
    
    campaign = await Campaign.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('creator', 'name email');
    
    res.status(200).json({
      success: true,
      data: campaign
    });
  } catch (error) {
    console.error('Update Campaign Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update campaign'
    });
  }
};

// @desc    Delete campaign
// @route   DELETE /api/campaigns/:id
// @access  Private
exports.deleteCampaign = async (req, res, next) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }
    
    // Check ownership
    if (campaign.creator.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this campaign'
      });
    }
    
    await campaign.deleteOne();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Delete Campaign Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete campaign'
    });
  }
};

// @desc    Execute campaign
// @route   POST /api/campaigns/:id/execute
// @access  Private
exports.executeCampaign = async (req, res, next) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }
    
    // Check if campaign is in valid state - can only execute from draft status
    if (campaign.status !== 'draft') {
      return res.status(400).json({
        success: false,
        message: `Campaign with status '${campaign.status}' cannot be executed`
      });
    }
    
    // Update campaign status to active (which is in the model's enum)
    campaign.status = 'active';
    await campaign.save();
    
    // Queue campaign execution in background
    triggerCampaignExecution(campaign._id);
    
    res.status(200).json({
      success: true,
      message: 'Campaign execution started',
      data: campaign
    });
  } catch (error) {
    console.error('Execute Campaign Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to execute campaign'
    });
  }
};

// @desc    Schedule campaign for future
// @route   POST /api/campaigns/:id/schedule
// @access  Private
exports.scheduleCampaign = async (req, res, next) => {
  try {
    const { scheduledDate } = req.body;
    
    if (!scheduledDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a scheduled date'
      });
    }
    
    const campaign = await Campaign.findById(req.params.id);
    
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }
    
    // Validate scheduled date
    const scheduleTime = new Date(scheduledDate);
    if (scheduleTime <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Scheduled date must be in the future'
      });
    }
    
    // Update campaign - keeping status as draft since that's what model supports
    // The scheduledDate field will indicate it's meant to be scheduled
    campaign.scheduledDate = scheduleTime;
    await campaign.save();
    
    res.status(200).json({
      success: true,
      message: 'Campaign scheduled successfully',
      data: campaign
    });
  } catch (error) {
    console.error('Schedule Campaign Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to schedule campaign'
    });
  }
};

// Helper function to calculate audience size
const calculateAudienceSize = async (segmentRules) => {
  try {
    // Build MongoDB query from segment rules
    const query = buildQueryFromRules(segmentRules);
    
    // Count matching customers
    const count = await Customer.countDocuments(query);
    return count;
  } catch (error) {
    console.error('Calculate Audience Error:', error);
    return 0;
  }
};

// Helper to build MongoDB query from segment rules
const buildQueryFromRules = (rules) => {
  let query = {};
  
  if (!rules || rules.length === 0) {
    return query;
  }
  
  const conditions = rules.map(rule => {
    const { field, operator, value } = rule;
    
    switch (operator) {
      case 'equals':
        return { [field]: value };
      case 'not_equals':
        return { [field]: { $ne: value } };
      case 'greater_than':
        return { [field]: { $gt: value } };
      case 'less_than':
        return { [field]: { $lt: value } };
      case 'contains':
        return { [field]: { $regex: value, $options: 'i' } };
      case 'not_contains':
        return { [field]: { $not: { $regex: value, $options: 'i' } } };
      case 'between':
        if (Array.isArray(value) && value.length === 2) {
          return { [field]: { $gte: value[0], $lte: value[1] } };
        }
        return {};
      case 'in':
        return { [field]: { $in: Array.isArray(value) ? value : [value] } };
      case 'not_in':
        return { [field]: { $nin: Array.isArray(value) ? value : [value] } };
      default:
        return {};
    }
  });
  
  // Combine conditions based on logical operators in rules
  const logicalOperators = rules.map(rule => rule.logicalOperator || 'AND');
  
  if (conditions.length === 1) {
    return conditions[0];
  } else {
    // Group conditions by logical operator
    const andConditions = [];
    const orConditions = [];
    
    conditions.forEach((condition, index) => {
      if (index === 0) {
        // First condition always goes to AND
        andConditions.push(condition);
      } else {
        // Check previous rule's logical operator
        if (logicalOperators[index - 1] === 'AND') {
          andConditions.push(condition);
        } else {
          orConditions.push(condition);
        }
      }
    });
    
    let finalQuery = {};
    
    if (andConditions.length > 0) {
      finalQuery.$and = andConditions;
    }
    
    if (orConditions.length > 0) {
      finalQuery.$or = orConditions;
    }
    
    return finalQuery;
  }
};

// Helper function to trigger campaign execution
// In a real app, this would use a job queue
const triggerCampaignExecution = async (campaignId) => {
  try {
    // Simulating background process
    setTimeout(async () => {
      const campaign = await Campaign.findById(campaignId);
      if (!campaign) return;
      
      // Example of updating campaign after execution
      campaign.status = 'completed';
      campaign.deliveryStats.sent = campaign.audienceSize;
      await campaign.save();
      
      console.log(`Campaign ${campaignId} completed`);
    }, 5000); // Simulate 5 second processing time
  } catch (error) {
    console.error('Campaign Execution Error:', error);
  }
};

// Helper function to generate AI tags based on message content
// This is a simple implementation - in a real app, you might use NLP or ML
const generateAITags = (message) => {
  const tags = [];
  
  // Example simple tag generation logic
  if (message.toLowerCase().includes('sale') || message.toLowerCase().includes('discount')) {
    tags.push('promotional');
  }
  
  if (message.toLowerCase().includes('new') || message.toLowerCase().includes('launch')) {
    tags.push('product-launch');
  }
  
  if (message.toLowerCase().includes('limited') || message.toLowerCase().includes('exclusive')) {
    tags.push('limited-offer');
  }
  
  if (message.toLowerCase().includes('thank')) {
    tags.push('appreciation');
  }
  
  // Add a default tag if none were found
  if (tags.length === 0) {
    tags.push('general');
  }
  
  return tags;
};