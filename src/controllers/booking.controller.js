const Booking = require('../models/Booking');
const User = require('../models/User');
const Profile = require('../models/Profile');

/**
 * Create a new booking
 * POST /api/bookings
 */
const createBooking = async (req, res, next) => {
  try {
    // Support both camelCase and snake_case
    const artistId = req.body.artistId || req.body.artist_id;
    const eventType = req.body.eventType || req.body.event_type;
    const eventDate = req.body.eventDate || req.body.event_date;
    const eventTime = req.body.eventTime || req.body.event_time;
    const duration = req.body.duration || req.body.duration_hours; // Spec calls it duration_hours
    const location = req.body.location;
    const notes = req.body.notes;
    
    const listenerId = req.userId;

    // Basic validation
    if (!artistId || !eventType || !eventDate || !eventTime || !duration || !location) {
        return res.status(400).json({ 
            message: 'Campos obrigatórios faltando (artist_id, event_type, event_date, event_time, duration_hours, location)' 
        });
    }

    // Fetch Artist Profile to get price
    const artistProfile = await Profile.findOne({ user_id: artistId });
    const hourlyRate = artistProfile ? (artistProfile.minPrice || 0) : 0;
    const totalPrice = hourlyRate * duration;

    const booking = new Booking({
      artistId,
      listenerId,
      eventType,
      eventDate,
      eventTime,
      duration,
      location,
      notes,
      totalPrice, 
      listenerConfirmed: true, // Implicit confirmation by creator (Listener)
      status: 'waiting_confirmation'
    });
    
    await booking.save();

    res.status(201).json({
        booking_id: booking._id,
        status: booking.status,
        created_at: booking.created_at,
        total_price: booking.totalPrice,
        message: "Solicitação enviada com sucesso"
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Artist Accept Booking
 * POST /api/bookings/:id/accept
 */
const acceptBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);

    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // Verify Is Artist Owner
    if (booking.artistId.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Apenas o artista pode aceitar esta solicitação' });
    }

    // State Transition
    if (booking.status !== 'waiting_confirmation') {
         return res.status(400).json({ message: 'Booking not in waiting_confirmation state' });
    }

    booking.artistConfirmed = true;
    
    // If listener matches true (which we set on create now), move to payment
    if (booking.listenerConfirmed) {
        booking.status = 'waiting_payment'; // Maps to 'payment_pending' in spec
    }

    await booking.save();
    res.status(200).json(booking);

  } catch (error) {
    next(error);
  }
};

/**
 * Artist Reject Booking
 * POST /api/bookings/:id/reject
 */
const rejectBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);

    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // Verify Is Artist Owner
    if (booking.artistId.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Apenas o artista pode rejeitar esta solicitação' });
    }

    booking.status = 'cancelled';
    booking.cancelledBy = 'artist';

    await booking.save();
    res.status(200).json({ message: 'Booking rejected', booking });

  } catch (error) {
    next(error);
  }
};

/**
 * Get bookings
 * GET /api/bookings
 */
const getBookings = async (req, res, next) => {
  try {
    // Filter based on query params and user role security
    // Users should only see their own bookings
    const { status, artistId, listenerId } = req.query;
    const query = {};

    if (status) query.status = status;
    
    // Security check: Force filter to current user unless admin (not implemented)
    // Actually, we should check if the user is part of the booking.
    // A simplified approach is: return bookings where user is artist OR listener.
    
    query.$or = [{ artistId: req.userId }, { listenerId: req.userId }];
    
    // Check specific filters if provided
    if (artistId && artistId !== req.userId && req.user.user_type !== 'artist') {
        // trying to see other's bookings?
    }

    const bookings = await Booking.find(query)
      .populate('artistId', 'user_metadata') 
      .populate('listenerId', 'user_metadata')
      .sort({ created_at: -1 });

    // Enrich with avatars manually since User doesn't have it
    const enrichedBookings = await Promise.all(bookings.map(async (booking) => {
        const bookingObj = booking.toObject();
        
        // Find artist profile for avatar
        if (bookingObj.artistId) {
            // Robust ID extraction: handles populated object or raw ID
            const aid = bookingObj.artistId._id || bookingObj.artistId;
            const artistProfile = await Profile.findOne({ user_id: aid });
            
            const avatarUrl = artistProfile ? artistProfile.avatar_url : null;
            
            // Inject into populated object if it exists
            if (bookingObj.artistId && typeof bookingObj.artistId === 'object') {
                bookingObj.artistId.avatar_url = avatarUrl;
            }
            
            // Also add to root for convenience
            bookingObj.artist_avatar = avatarUrl;
        }
        
        // Optional: listener avatar too if needed
        if (bookingObj.listenerId) {
             const lid = bookingObj.listenerId._id || bookingObj.listenerId;
             const listenerProfile = await Profile.findOne({ user_id: lid });
             const lAvatar = listenerProfile ? listenerProfile.avatar_url : null;
             
             if (bookingObj.listenerId && typeof bookingObj.listenerId === 'object') {
                bookingObj.listenerId.avatar_url = lAvatar;
             }
        }

        return bookingObj;
    }));

    console.log('📦 [DEBUG] GET /api/bookings Response:', JSON.stringify(enrichedBookings, null, 2));

    res.status(200).json(enrichedBookings);
  } catch (error) {
    next(error);
  }
};

/**
 * Confirm Booking
 * PATCH /api/bookings/:id/confirm
 */
const confirmBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    // Removed dependency on req.body.role
    
    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    let role = null;
    if (booking.artistId.toString() === req.userId.toString()) role = 'artist';
    if (booking.listenerId.toString() === req.userId.toString()) role = 'listener';

    // Verify ownership
    if (!role) {
      return res.status(403).json({ message: 'Unauthorized: You are not part of this booking' });
    }

    // Update flags
    if (role === 'artist') booking.artistConfirmed = true;
    if (role === 'listener') booking.listenerConfirmed = true;

    // State Transition: waiting_confirmation -> waiting_payment
    if (booking.status === 'waiting_confirmation' && booking.artistConfirmed && booking.listenerConfirmed) {
      booking.status = 'waiting_payment';
    }

    await booking.save();
    res.status(200).json(booking);
  } catch (error) {
    next(error);
  }
};

/**
 * Pay Booking
 * PATCH /api/bookings/:id/pay
 */
const payBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);

    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.listenerId.toString() !== req.userId.toString()) return res.status(403).json({ message: 'Unauthorized' });

    if (booking.status !== 'waiting_payment') {
      return res.status(400).json({ message: 'Booking is not in payment state' });
    }

    // Simulate payment processing
    booking.paymentDone = true;
    
    // State Transition: waiting_payment -> waiting_final_confirmation
    booking.status = 'waiting_final_confirmation';
    
    // Reset final flags just in case
    booking.listenerFinalConfirmed = false;
    booking.artistFinalConfirmed = false;

    await booking.save();
    res.status(200).json(booking);
  } catch (error) {
    next(error);
  }
};

/**
 * Final Confirm
 * PATCH /api/bookings/:id/final-confirm
 */
const finalConfirmBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    // Infer role from session
    
    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    let role = null;
    if (booking.artistId.toString() === req.userId.toString()) role = 'artist';
    if (booking.listenerId.toString() === req.userId.toString()) role = 'listener';

    if (!role) {
      return res.status(403).json({ message: 'Unauthorized: You are not part of this booking' });
    }

    if (booking.status !== 'waiting_final_confirmation') {
       return res.status(400).json({ message: 'Not ready for final confirmation' });
    }

    if (role === 'artist') booking.artistFinalConfirmed = true;
    if (role === 'listener') booking.listenerFinalConfirmed = true;

    // State Transition: waiting_final_confirmation -> completed
    if (booking.artistFinalConfirmed && booking.listenerFinalConfirmed) {
      booking.status = 'completed';
    }

    await booking.save();
    res.status(200).json(booking);
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel Booking
 * PATCH /api/bookings/:id/cancel
 */
const cancelBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body || {}; // Safe destructuring

    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    let role = null;
    if (booking.artistId.toString() === req.userId.toString()) role = 'artist';
    if (booking.listenerId.toString() === req.userId.toString()) role = 'listener';

    if (!role) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    booking.status = 'cancelled';
    booking.cancelledBy = role;
    if (reason) {
        booking.notes = booking.notes ? booking.notes + ` [Cancel Reason: ${reason}]` : `[Cancel Reason: ${reason}]`;
    }

    await booking.save();
    res.status(200).json(booking);
  } catch (error) {
    next(error);
  }
};

/**
 * Mark Incomplete
 * PATCH /api/bookings/:id/incomplete
 */
const incompleteBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    // Logic for incomplete? Usually means no-show or issue.
    // For now simple status update.
    
    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

     // Verify ownership (simplified for now)
    if (booking.artistId.toString() !== req.userId.toString() && booking.listenerId.toString() !== req.userId.toString()) {
       return res.status(403).json({ message: 'Unauthorized' });
    }

    booking.status = 'incomplete';
    await booking.save();
    res.status(200).json(booking);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  getBookings,
  confirmBooking,
  payBooking,
  finalConfirmBooking,
  cancelBooking,
  incompleteBooking,
  acceptBooking,
  rejectBooking
};
