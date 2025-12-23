const Profile = require('../models/Profile');
const User = require('../models/User');

/**
 * Update user profile
 * PUT /api/profile
 */
const updateProfile = async (req, res, next) => {
  try {
    const userId = req.userId;
    const updates = req.body;

    // Find and update profile
    const profile = await Profile.findOne({ user_id: userId });
    
    if (!profile) {
      return res.status(404).json({
        error: 'Profile not found',
        message: 'User profile does not exist'
      });
    }

    // Update allowed fields
    if (updates.full_name !== undefined) {
      profile.full_name = updates.full_name;
      
      // Also update in user metadata
      await User.findByIdAndUpdate(userId, {
        'user_metadata.full_name': updates.full_name
      });
    }

    if (updates.avatar_url !== undefined) {
      profile.avatar_url = updates.avatar_url;
    }

    // Save profile
    await profile.save();

    // Prepare response
    const profileResponse = {
      id: userId.toString(),
      email: profile.email,
      full_name: profile.full_name,
      user_type: profile.user_type,
      avatar_url: profile.avatar_url,
      created_at: profile.created_at,
      updated_at: profile.updated_at
    };

    res.status(200).json({
      profile: profileResponse,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user profile
 * GET /api/profile
 */
const getProfile = async (req, res, next) => {
  try {
    const userId = req.userId;

    const profile = await Profile.findOne({ user_id: userId });
    
    if (!profile) {
      return res.status(404).json({
        error: 'Profile not found',
        message: 'User profile does not exist'
      });
    }

    const profileResponse = {
      id: userId.toString(),
      email: profile.email,
      full_name: profile.full_name,
      user_type: profile.user_type,
      avatar_url: profile.avatar_url,
      created_at: profile.created_at,
      updated_at: profile.updated_at
    };

    res.status(200).json({
      profile: profileResponse
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Upload avatar image
 * POST /api/profile/upload-avatar
 */
const uploadAvatar = async (req, res, next) => {
  try {
    const userId = req.userId;

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded',
        message: 'Please provide an image file'
      });
    }

    console.log('📤 Uploading avatar for user:', userId);
    console.log('📄 File info:', {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });

    // Import upload utility
    const { uploadToCloudinary } = require('../utils/upload');

    // Upload to Cloudinary
    const result = await uploadToCloudinary(
      req.file.buffer,
      'generek/avatars',
      `avatar_${userId}`
    );

    // Update profile with new avatar URL
    const profile = await Profile.findOne({ user_id: userId });
    
    if (!profile) {
      return res.status(404).json({
        error: 'Profile not found',
        message: 'User profile does not exist'
      });
    }

    profile.avatar_url = result.secure_url;
    await profile.save();

    // Prepare response
    const profileResponse = {
      id: userId.toString(),
      email: profile.email,
      full_name: profile.full_name,
      user_type: profile.user_type,
      avatar_url: profile.avatar_url,
      created_at: profile.created_at,
      updated_at: profile.updated_at
    };

    res.status(200).json({
      profile: profileResponse,
      message: 'Avatar uploaded successfully'
    });
  } catch (error) {
    console.error('❌ Avatar upload error:', error);
    next(error);
  }
};

module.exports = {
  updateProfile,
  getProfile,
  uploadAvatar
};
