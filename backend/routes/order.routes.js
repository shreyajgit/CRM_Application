const express = require('express');
const { check } = require('express-validator');
const { 
  getOrders, 
  getOrder, 
  createOrder, 
  updateOrder, 
  deleteOrder 
} = require('../controllers/order.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();


// Routes
router.route('/all-orders').get(getOrders)               // GET /api/orders 

router.route('/:id').get(getOrder)                // GET /api/orders/:orderId
module.exports = router;
