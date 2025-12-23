const { verifyToken } = require('../utils/jwt');
const User = require('../models/User');
const Profile = require('../models/Profile');

/**
 * Authentication middleware - verifies JWT token
 */
const auth = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Access denied. No token provided or invalid format.'
      });
    }

    // Extract token
    const token = authHeader.replace('Bearer ', '');

    // Verify token
    const decoded = verifyToken(token);

    // Get user from database
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({
        error: 'User not found. Token may be invalid.'
      });
    }

    // Get user profile
    const profile = await Profile.findOne({ user_id: user._id });

    // Attach user and profile to request
    req.user = user;
    req.profile = profile;
    req.userId = user._id;

    next();
  } catch (error) {
    if (error.message === 'Invalid or expired token') {
      return res.status(401).json({
        error: 'Invalid or expired token. Please login again.'
      });
    }
    
    return res.status(500).json({
      error: 'Authentication failed',
      message: error.message
    });
  }
};

module.exports = auth;
