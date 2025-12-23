const express = require('express');
const router = express.Router();
const { signup, login, getSession } = require('../controllers/auth.controller');
const { signupValidation, loginValidation } = require('../middleware/validation');
const auth = require('../middleware/auth');

/**
 * @route   POST /api/auth/signup
 * @desc    Register a new user
 * @access  Public
 */
router.post('/signup', signupValidation, signup);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', loginValidation, login);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user session
 * @access  Private
 */
router.get('/me', auth, getSession);

module.exports = router;
