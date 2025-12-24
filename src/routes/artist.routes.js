const express = require('express');
const router = express.Router();
const { updateBio, getBio, getArtists, getArtistById } = require('../controllers/artist.controller');
const auth = require('../middleware/auth');

/**
 * @route   PUT /api/artists/bio
 * @desc    Update artist bio information
 * @access  Private (Artist only)
 */
router.put('/bio', auth, updateBio);

/**
 * @route   GET /api/artists
 * @desc    Get all artists (Public)
 */
router.get('/', getArtists);

/**
 * @route   GET /api/artists/bio
 * @desc    Get artist bio information
 * @access  Private
 */
router.get('/bio', auth, getBio);

/**
 * @route   GET /api/artists/:id
 * @desc    Get artist profile details (Public)
 */
router.get('/:id', getArtistById);

module.exports = router;
