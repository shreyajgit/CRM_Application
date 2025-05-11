const Order = require('../models/Order.model');
const Customer = require('../models/Customer.model');
const mongoose = require('mongoose');
// @desc    Get all orders
// @route   GET /api/orders
// @access  Private
exports.getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find().populate('customer', 'name email');
    // console.log('Orders:', orders);
    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    console.error('Get Orders Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders'
    });
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
exports.getOrder = async (req, res, next) => {
  try {
    const orderId = mongoose.Types.ObjectId.isValid(req.params.id) 
      ? req.params.id 
      : null;
    console.log('Order ID:', req.params.id);
    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID format'
      });
    }
    const order = await Order.findById(req.params.id).populate('customer', 'name email');
    
    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Get Order Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order'
    });
  }
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res, next) => {
  try {
    
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    // Convert string customerId to ObjectId before querying
    const customerId = mongoose.Types.ObjectId.isValid(req.body.customer) 
      ? req.body.customer 
      : null;
    
    if (!customerId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid customer ID format' 
      });
    }

    // Check if customer exists
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    // Create order (the customer ID will be properly stored as ObjectId)
    const order = await Order.create(req.body);

    // Update customer order stats
    await Customer.findByIdAndUpdate(customer._id, {
      $inc: { totalOrders: 1, totalSpend: req.body.totalAmount },
      lastOrderDate: Date.now()
    });

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    console.error('Create Order Error:', error);
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Order with that order number already exists'
      });
    }
    res.status(500).json({ success: false, message: 'Failed to create order' });
  }
};

// @desc    Update order
// @route   PUT /api/orders/:id
// @access  Private
exports.updateOrder = async (req, res, next) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Update Order Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order'
    });
  }
};

// @desc    Delete order
// @route   DELETE /api/orders/:id
// @access  Private
exports.deleteOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Update customer stats
    await Customer.findByIdAndUpdate(order.customer, {
      $inc: { totalOrders: -1, totalSpend: -order.totalAmount }
    });
    
    await order.deleteOne();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Delete Order Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete order'
    });
  }
};