const express = require('express');
const router = express.Router();
const { uploadSong, deleteSong, getSongs, getArtistSongs, getMySongs } = require('../controllers/song.controller');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload'); // Reusing upload middleware (needs check for audio type)

// Custom middleware to validate audio files specifically
const multer = require('multer');
const storage = multer.memoryStorage();

const audioFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('audio/') || file.mimetype === 'application/octet-stream') {
    cb(null, true);
  } else {
    cb(new Error('Only audio files are allowed!'), false);
  }
};

const audioUpload = multer({
  storage: storage,
  fileFilter: audioFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit for songs
  }
});

/**
 * @route   POST /api/songs/upload
 * @desc    Upload a new song (Artist only)
 * @access  Private (Artist)
 */
router.post('/upload', auth, audioUpload.single('song'), uploadSong);

/**
 * @route   DELETE /api/songs/:id
 * @desc    Delete a song (Artist only)
 * @access  Private (Artist)
 */
router.delete('/:id', auth, deleteSong);

/**
 * @route   GET /api/songs/my-songs
 * @desc    Get current user's songs
 * @access  Private
 */
router.get('/my-songs', auth, getMySongs);

/**
 * @route   GET /api/songs
 * @desc    Get all songs
 * @access  Public
 */
router.get('/', getSongs);

/**
 * @route   GET /api/songs/artist/:artistId
 * @desc    Get songs by artist
 * @access  Public
 */
router.get('/artist/:artistId', getArtistSongs);

module.exports = router;
