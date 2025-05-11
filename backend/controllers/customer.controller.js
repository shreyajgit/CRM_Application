const Customer = require('../models/Customer.model');
const { validationResult } = require('express-validator');

// @desc    Get all customers
// @route   GET /api/customers/list
// @access  Private
exports.getAllCustomers = async (req, res, next) => {
  try {
    const customers = await Customer.find();
    // console.log('Customers:', customers); 
    res.status(200).json({
      success: true,
      count: customers ? customers.length : 0,
      customers: customers || []
    });
  } catch (error) {
    console.error('Get Customers Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch customers',
      customers: [] // Always return an array, even on error
    });
  }
};

// @desc    Get single customer
// @route   GET /api/customers/detail/:customerId
// @access  Private
exports.getCustomerById = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
        customer: null
      });
    }
    res.status(200).json({
      success: true,
      customer: customer
    });
  } catch (error) {
    console.error('Get Customer Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch customer',
      customer: null
    });
  }
};

// @desc    Create new customer
// @route   POST /api/customers/create
// @access  Private
exports.createCustomer = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    // Make sure tags is an array
    if (req.body.tags && !Array.isArray(req.body.tags)) {
      req.body.tags = req.body.tags.toString().split(',').map(tag => tag.trim());
    }

    const customer = await Customer.create(req.body);
    res.status(201).json({
      success: true,
      customer: customer
    });
  } catch (error) {
    console.error('Create Customer Error:', error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Customer with that email already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create customer'
    });
  }
};

// @desc    Update customer
// @route   PUT /api/customers/update/:customerId
// @access  Private
exports.updateCustomerById = async (req, res, next) => {
  try {
    // Make sure tags is an array
    if (req.body.tags && !Array.isArray(req.body.tags)) {
      req.body.tags = req.body.tags.toString().split(',').map(tag => tag.trim());
    }
    
    const customer = await Customer.findByIdAndUpdate(
      req.params.customerId,
      req.body,
      { new: true, runValidators: true }
    );

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    res.status(200).json({
      success: true,
      customer: customer // Use consistent key naming
    });
  } catch (error) {
    console.error('Update Customer Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update customer'
    });
  }
};

// @desc    Delete customer
// @route   DELETE /api/customers/remove/:customerId
// @access  Private
exports.deleteCustomerById = async (req, res, next) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Delete Customer Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete customer'
    });
  }
};