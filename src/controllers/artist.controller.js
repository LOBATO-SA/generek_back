const Profile = require('../models/Profile');

/**
 * Update Artist Bio
 * PUT /api/artists/bio
 */
const updateBio = async (req, res, next) => {
  try {
    // 1. Check if user is an artist
    if (req.user.user_metadata.user_type !== 'artist') {
      return res.status(403).json({
        message: 'Apenas artistas podem atualizar a bio'
      });
    }

    const { genres, location, minPrice, about, eventTypes } = req.body;

    // 2. Validate minPrice if provided
    if (minPrice !== undefined && minPrice < 0) {
      return res.status(400).json({
        message: 'Preço mínimo deve ser maior ou igual a zero'
      });
    }

    // 3. Find and update profile
    const profile = await Profile.findOne({ user_id: req.userId });

    if (!profile) {
      return res.status(404).json({ message: 'Perfil não encontrado' });
    }

    // Update fields
    if (genres !== undefined) profile.genres = genres;
    if (location !== undefined) profile.location = location;
    if (minPrice !== undefined) profile.minPrice = minPrice;
    if (about !== undefined) profile.about = about;
    if (eventTypes !== undefined) profile.eventTypes = eventTypes;

    await profile.save();

    // 4. Return response
    res.status(200).json({
      message: 'Bio atualizada com sucesso',
      bio: {
        genres: profile.genres,
        location: profile.location,
        minPrice: profile.minPrice,
        about: profile.about,
        eventTypes: profile.eventTypes
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Get Artist Bio
 * GET /api/artists/bio
 */
const getBio = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ user_id: req.userId });

    if (!profile) {
      return res.status(200).json({ bio: null });
    }

    res.status(200).json({
      bio: {
        genres: profile.genres,
        location: profile.location,
        minPrice: profile.minPrice,
        about: profile.about,
        eventTypes: profile.eventTypes
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  updateBio,
  getBio
};
