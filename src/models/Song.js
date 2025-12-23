const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  artist_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  file_url: {
    type: String,
    required: [true, 'File URL is required']
  },
  file_path: {
    type: String,
    required: [true, 'File path is required for management']
  },
  cover_url: {
    type: String,
    default: null
  },
  duration: {
    type: Number,
    default: 0
  },
  genre: {
    type: String,
    default: 'Uncategorized',
    trim: true
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Index for faster queries by artist and genre
songSchema.index({ artist_id: 1 });
songSchema.index({ genre: 1 });

module.exports = mongoose.model('Song', songSchema);
