const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true
  },
  full_name: {
    type: String,
    required: true,
    trim: true
  },
  user_type: {
    type: String,
    required: true,
    enum: ['artist', 'listener']
  },
  avatar_url: {
    type: String,
    default: null
  },
  // Artist Bio Fields
  genres: {
    type: [String],
    default: []
  },
  location: {
    type: String,
    default: null
  },
  minPrice: {
    type: Number,
    default: null,
    min: [0, 'Minimum price must be positive']
  },
  about: {
    type: String,
    default: null
  },
  eventTypes: {
    type: [String],
    default: []
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Create index on user_id for faster lookups
profileSchema.index({ user_id: 1 });

// Method to format profile response
profileSchema.methods.toJSON = function() {
  const profile = this.toObject();
  profile.id = profile.user_id.toString();
  delete profile.__v;
  return profile;
};

module.exports = mongoose.model('Profile', profileSchema);
