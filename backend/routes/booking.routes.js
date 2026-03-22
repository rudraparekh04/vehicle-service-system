const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const { createBooking, getMyBookings, getBookingById, cancelBooking, rateBooking } = require('../controllers/booking.controller');

router.post('/', protect, authorize('user'), createBooking);
router.get('/my-bookings', protect, getMyBookings);
router.get('/:bookingId', protect, getBookingById);
router.put('/:bookingId/cancel', protect, authorize('user'), cancelBooking);
router.post('/:bookingId/rate', protect, authorize('user'), rateBooking);

module.exports = router;
