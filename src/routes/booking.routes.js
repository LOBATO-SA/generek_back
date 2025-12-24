const express = require('express');
const router = express.Router();
const controller = require('../controllers/booking.controller');
const auth = require('../middleware/auth');

// All routes require authentication
router.use(auth);

/**
 * @route   POST /api/bookings
 * @desc    Create a new booking request
 */
router.post('/', controller.createBooking);

/**
 * @route   GET /api/bookings
 * @desc    Get user's bookings
 */
router.get('/', controller.getBookings);

/**
 * @route   POST /api/bookings/:id/accept
 * @desc    Artist accepts booking
 */
router.post('/:id/accept', controller.acceptBooking);

/**
 * @route   POST /api/bookings/:id/reject
 * @desc    Artist rejects booking
 */
router.post('/:id/reject', controller.rejectBooking);

/**
 * @route   PATCH /api/bookings/:id/confirm
 * @desc    Confirm booking (Artist or Listener)
 */
router.patch('/:id/confirm', controller.confirmBooking);

/**
 * @route   PATCH /api/bookings/:id/pay
 * @desc    Pay for booking (Listener only)
 */
router.patch('/:id/pay', controller.payBooking);

/**
 * @route   PATCH /api/bookings/:id/final-confirm
 * @desc    Final confirmation after payment/event
 */
router.patch('/:id/final-confirm', controller.finalConfirmBooking);

/**
 * @route   PATCH /api/bookings/:id/cancel
 * @desc    Cancel booking
 */
router.patch('/:id/cancel', controller.cancelBooking);

/**
 * @route   PATCH /api/bookings/:id/incomplete
 * @desc    Mark booking as incomplete
 */
router.patch('/:id/incomplete', controller.incompleteBooking);

module.exports = router;
