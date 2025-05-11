const mongoose = require('mongoose');

const CustomerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
      'Please add a valid email'
    ]
  },
  phone: {
    type: String,
    match: [
      /^\+?[0-9]{10,15}$/,
      'Please add a valid phone number'
    ]
  },
  segment: {
    type: [String],
    default: ['default']
  },
  totalSpend: {
    type: Number,
    default: 0
  },
  totalOrders: {
    type: Number,
    default: 0
  },
  lastOrderDate: {
    type: Date
  },
  visits: {
    type: Number,
    default: 0
  },
  lastVisitDate: {
    type: Date
  },
  tags: {
    type: [String],
    default: []
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Customer', CustomerSchema);