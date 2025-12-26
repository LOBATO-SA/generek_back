const express = require('express');
const router = express.Router();
const { updateProfile, getProfile, uploadAvatar, getCloudinarySignature } = require('../controllers/profile.controller');
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
 * @route   GET /api/profile/cloudinary-signature
 * @desc    Get signed config for direct Cloudinary upload
 * @access  Private
 */
router.get('/cloudinary-signature', auth, getCloudinarySignature);

/**
 * @route   POST /api/profile/upload-avatar
 * @desc    Upload profile avatar image (Legacy - Use Direct Upload instead)
 * @access  Private
 */
router.post('/upload-avatar', auth, upload.single('avatar'), uploadAvatar);

module.exports = router;
