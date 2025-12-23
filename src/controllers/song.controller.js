const Song = require('../models/Song');
const { uploadToBytescale, deleteFromBytescale } = require('../utils/bytescale');

/**
 * Upload a new song
 * POST /api/songs/upload
 */
const uploadSong = async (req, res, next) => {
  try {
    // 1. Check if user is an artist
    if (req.user.user_metadata.user_type !== 'artist') {
      return res.status(403).json({
        error: 'Permission denied',
        message: 'Only artists can upload songs'
      });
    }

    // 2. Check if file exists
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded',
        message: 'Please provide an audio file'
      });
    }

    const { title, genre } = req.body;

    if (!title) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Title is required'
      });
    }

    console.log(`📤 Uploading song "${title}" for artist ${req.userId}`);

    // 3. Upload to Bytescale
    const uploadResult = await uploadToBytescale(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );

    // 4. Create Song record
    const song = await Song.create({
      title,
      artist_id: req.userId,
      file_url: uploadResult.fileUrl,
      file_path: uploadResult.filePath,
      genre: genre || 'Uncategorized',
      // Duration and cover_url can be updated later or extracted if we had metadata tools
    });

    res.status(201).json({
      message: 'Song uploaded successfully',
      song
    });

  } catch (error) {
    console.error('❌ Song upload error:', error);
    next(error);
  }
};

/**
 * Delete a song
 * DELETE /api/songs/:id
 */
const deleteSong = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    // Find the song
    const song = await Song.findById(id);

    if (!song) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Song not found'
      });
    }

    // Check ownership
    // Ensure both are strings for comparison
    if (song.artist_id.toString() !== userId.toString()) {
      return res.status(403).json({
        error: 'Permission denied',
        message: 'You can only delete your own songs'
      });
    }

    // Delete from Bytescale
    // We need the filePath, which we saved in the model
    if (song.file_path) {
      await deleteFromBytescale(song.file_path);
    }

    // Delete from MongoDB
    await Song.findByIdAndDelete(id);

    res.status(200).json({
      message: 'Song deleted successfully',
      id: id
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Get all songs
 * GET /api/songs
 */
const getSongs = async (req, res, next) => {
  try {
    const songs = await Song.find()
      .populate('artist_id', 'user_metadata.full_name email')
      .sort({ created_at: -1 });

    res.status(200).json({ songs });
  } catch (error) {
    next(error);
  }
};

/**
 * Get songs by artist
 * GET /api/songs/artist/:artistId
 */
const getArtistSongs = async (req, res, next) => {
  try {
    const { artistId } = req.params;
    const songs = await Song.find({ artist_id: artistId })
      .sort({ created_at: -1 });

    res.status(200).json({ songs });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user's songs
 * GET /api/songs/my-songs
 */
const getMySongs = async (req, res, next) => {
  try {
    const songs = await Song.find({ artist_id: req.userId })
      .sort({ created_at: -1 });

    res.status(200).json({ songs });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadSong,
  deleteSong,
  getSongs,
  getArtistSongs,
  getMySongs
};
