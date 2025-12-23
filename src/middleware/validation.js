const { body, validationResult } = require('express-validator');

/**
 * Validation middleware to check for validation errors
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('❌ Validation failed:', JSON.stringify(errors.array(), null, 2));
    console.log('📥 Request body was:', JSON.stringify(req.body, null, 2));
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

/**
 * Signup validation rules
 */
const signupValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('fullName')
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 2 })
    .withMessage('Full name must be at least 2 characters long'),
  body('userType')
    .isIn(['artist', 'listener'])
    .withMessage('User type must be either artist or listener'),
  validate
];

/**
 * Login validation rules
 */
const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  validate
];

/**
 * Profile update validation rules
 */
const profileUpdateValidation = [
  body('full_name')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Full name must be at least 2 characters long'),
  body('avatar_url')
    .optional({ nullable: true, checkFalsy: true })
    .custom((value) => {
      // Allow empty string, null, or undefined
      if (!value || value === '') return true;
      // If value exists, must be valid URL
      const urlRegex = /^https?:\/\/.+/;
      if (!urlRegex.test(value)) {
        throw new Error('Avatar URL must be a valid URL');
      }
      return true;
    }),
  validate
];

module.exports = {
  signupValidation,
  loginValidation,
  profileUpdateValidation
};
