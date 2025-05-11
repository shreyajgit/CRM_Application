const express = require('express');
const router = express.Router();
const { googleAuth, getCurrentUser, logout } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

/**
 * @route   POST /api/auth/google
 * @desc    Authenticate user with Google OAuth token
 * @access  Public
 */
router.post('/google', googleAuth);

/**
 * @route   GET /api/auth/me
 * @desc    Get current logged in user
 * @access  Private
 */
router.get('/me', protect, getCurrentUser);

/**
 * @route   GET /api/auth/logout
 * @desc    Logout user / clear cookie
 * @access  Private
 */
router.get('/logout', protect, logout);

module.exports = router;