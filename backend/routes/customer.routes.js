const express = require('express');
const { check } = require('express-validator');
const {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomerById,
  deleteCustomerById
} = require('../controllers/customer.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect);

// Validation middleware for POST/PUT
const validateCustomer = [
  check('name', 'Name is required').not().isEmpty(),
  check('email', 'Please include a valid email').isEmail()
];

// GET all customers
router.get('/list', getAllCustomers);

// GET single customer
router.get('/detail/:customerId', getCustomerById);

// POST new customer
router.post('/create', validateCustomer, createCustomer);

// PUT update customer
router.put('/update/:customerId', validateCustomer, updateCustomerById);

// DELETE customer
router.delete('/remove/:customerId', deleteCustomerById);

module.exports = router;