const Profile = require('../models/Profile');
const Song = require('../models/Song');

/**
 * Get Artists List
 * GET /api/artists
 */
const getArtists = async (req, res, next) => {
  try {
    const { search, genre, limit = 10, offset = 0 } = req.query;

    const query = { user_type: 'artist' };

    // Search logic
    if (search) {
      query.$or = [
        { full_name: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { genres: { $regex: search, $options: 'i' } }
      ];
    }

    // Genre filter
    if (genre) {
      query.genres = { $in: [new RegExp(genre, 'i')] };
    }

    // Count total
    const total = await Profile.countDocuments(query);

    // Fetch profiles
    const profiles = await Profile.find(query)
      .skip(Number(offset))
      .limit(Number(limit))
      .select('user_id full_name avatar_url minPrice genres location about eventTypes'); // Select specific fields

    // Map to specification format
    const artists = profiles.map(p => ({
      id: p.user_id, // Mapping User ID as the main ID
      name: p.full_name,
      avatar_url: p.avatar_url,
      verified: false, // Placeholder
      hourly_rate: p.minPrice, // Mapping minPrice to hourly_rate/base rate
      genre: p.genres[0] || 'Vários',
      location: p.location || 'Não informado',
      rating: 0, // Placeholder
      total_bookings: 0, // Placeholder
      bio: p.about ? p.about.substring(0, 100) + '...' : '',
      followers: 0,
      available: true
    }));

    res.status(200).json({
      artists,
      total
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Get Artist Profile Details
 * GET /api/artists/:id
 */
const getArtistById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const profile = await Profile.findOne({ user_id: id });

    if (!profile) {
      return res.status(404).json({ message: 'Artista não encontrado' });
    }

    // Fetch top songs
    const topSongs = await Song.find({ artist_id: id })
      .limit(5)
      .sort({ created_at: -1 }); // Newest first for now

    res.status(200).json({
      id: profile.user_id,
      name: profile.full_name,
      avatar_url: profile.avatar_url,
      verified: false,
      hourly_rate: profile.minPrice,
      genre: profile.genres.join(', '),
      location: profile.location,
      rating: 0,
      total_bookings: 0,
      bio: profile.about, // Short bio
      about: profile.about, // Long description
      experience: "N/A", // Placeholder
      available_events: profile.eventTypes,
      social_media: {
        instagram: "",
        facebook: ""
      },
      top_songs: topSongs.map(s => ({
        id: s._id,
        title: s.title,
        duration: "03:30", // Placeholder if not stored
        cover_url: s.cover_url || profile.avatar_url, // Fallback
        audio_url: s.file_url,
        plays: 0
      }))
    });

  } catch (error) {
    next(error);
  }
};



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
  getBio,
  getArtists,
  getArtistById
};
