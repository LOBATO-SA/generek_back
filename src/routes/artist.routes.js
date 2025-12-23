const express = require('express');
const router = express.Router();
const { updateBio, getBio } = require('../controllers/artist.controller');
const auth = require('../middleware/auth');

/**
 * @route   PUT /api/artists/bio
 * @desc    Update artist bio information
 * @access  Private (Artist only)
 */
router.put('/bio', auth, updateBio);

/**
 * @route   GET /api/artists/bio
 * @desc    Get artist bio information
 * @access  Private
 */
router.get('/bio', auth, getBio);

module.exports = router;
