const express = require('express');
const router = express.Router();
const { updateProfile, getProfile, uploadAvatar } = require('../controllers/profile.controller');
const { profileUpdateValidation } = require('../middleware/validation');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

/**
 * @route   GET /api/profile
 * @desc    Get user profile
 * @access  Private
 */
router.get('/', auth, getProfile);

/**
 * @route   PUT /api/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/', auth, profileUpdateValidation, updateProfile);

/**
 * @route   POST /api/profile/upload-avatar
 * @desc    Upload profile avatar image
 * @access  Private
 */
router.post('/upload-avatar', auth, upload.single('avatar'), uploadAvatar);

module.exports = router;
