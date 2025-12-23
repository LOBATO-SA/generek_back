const User = require('../models/User');
const Profile = require('../models/Profile');
const { generateToken } = require('../utils/jwt');

/**
 * Sign up a new user
 * POST /api/auth/signup
 */
const signup = async (req, res, next) => {
  try {
    console.log('📝 Signup request received:', JSON.stringify(req.body, null, 2));
    const { email, password, fullName, userType } = req.body;
    console.log('📋 Extracted fields:', { email, password: password ? '***' : undefined, fullName, userType });

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        error: 'User already exists',
        message: 'A user with this email already exists'
      });
    }

    // Create user
    const user = await User.create({
      email,
      password,
      user_metadata: {
        full_name: fullName,
        user_type: userType
      }
    });

    // Create profile
    const profile = await Profile.create({
      user_id: user._id,
      email: user.email,
      full_name: fullName,
      user_type: userType
    });

    // Generate token
    const access_token = generateToken(user._id);

    // Prepare response (match frontend expectations)
    const userResponse = {
      id: user._id.toString(),
      email: user.email,
      user_metadata: {
        full_name: fullName,
        user_type: userType
      }
    };

    const profileResponse = {
      id: user._id.toString(),
      email: user.email,
      full_name: fullName,
      user_type: userType,
      avatar_url: profile.avatar_url,
      created_at: user.created_at
    };

    res.status(201).json({
      user: userResponse,
      session: {
        access_token,
        user: userResponse
      },
      profile: profileResponse
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login user
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user and include password field
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
    }

    // Get profile
    const profile = await Profile.findOne({ user_id: user._id });

    // Generate token
    const access_token = generateToken(user._id);

    // Prepare response
    const userResponse = {
      id: user._id.toString(),
      email: user.email,
      user_metadata: user.user_metadata
    };

    const profileResponse = {
      id: user._id.toString(),
      email: user.email,
      full_name: profile.full_name,
      user_type: profile.user_type,
      avatar_url: profile.avatar_url,
      created_at: user.created_at
    };

    res.status(200).json({
      user: userResponse,
      session: {
        access_token,
        user: userResponse
      },
      profile: profileResponse
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user session
 * GET /api/auth/me
 */
const getSession = async (req, res, next) => {
  try {
    // User and profile are already attached by auth middleware
    const user = req.user;
    const profile = req.profile;

    if (!profile) {
      return res.status(404).json({
        error: 'Profile not found',
        message: 'User profile does not exist'
      });
    }

    // Generate new token (refresh session)
    const access_token = generateToken(user._id);

    // Prepare response
    const userResponse = {
      id: user._id.toString(),
      email: user.email,
      user_metadata: user.user_metadata
    };

    const profileResponse = {
      id: user._id.toString(),
      email: user.email,
      full_name: profile.full_name,
      user_type: profile.user_type,
      avatar_url: profile.avatar_url,
      created_at: user.created_at
    };

    res.status(200).json({
      user: userResponse,
      session: {
        access_token,
        user: userResponse
      },
      profile: profileResponse
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  signup,
  login,
  getSession
};
