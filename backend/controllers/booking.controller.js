const Booking = require('../models/Booking');
const Supplier = require('../models/Supplier');
const Vehicle = require('../models/Vehicle');

// @desc    Create booking
// @route   POST /api/booking
// @access  Private (user)
const createBooking = async (req, res) => {
  try {
    const { vehicleId, supplierId, services, scheduledDate, scheduledTime, notes } = req.body;

    if (!vehicleId || !supplierId || !services || !scheduledDate || !scheduledTime) {
      return res.status(400).json({ success: false, message: 'Vehicle, supplier, services, date and time are required.' });
    }

    // Validate vehicle belongs to user
    const vehicle = await Vehicle.findOne({ _id: vehicleId, owner: req.user._id });
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found.' });
    }

    // Validate supplier is approved
    const supplier = await Supplier.findOne({ _id: supplierId, status: 'approved', isActive: true });
    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Supplier not found or not available.' });
    }

    // Calculate total amount
    const totalAmount = services.reduce((sum, service) => sum + (service.price || 0), 0);

    const booking = await Booking.create({
      user: req.user._id,
      vehicle: vehicleId,
      supplier: supplierId,
      services,
      scheduledDate,
      scheduledTime,
      notes,
      totalAmount
    });

    await booking.populate([
      { path: 'vehicle' },
      { path: 'supplier', select: 'businessName email phone address' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Booking created successfully.',
      data: { booking }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user bookings
// @route   GET /api/booking/my-bookings
// @access  Private (user)
const getMyBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = { user: req.user._id };
    if (status) query.status = status;

    const bookings = await Booking.find(query)
      .populate('vehicle', 'make model licensePlate vehicleType')
      .populate({ path: 'supplier', select: 'businessName email phone address' })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Booking.countDocuments(query);

    res.json({
      success: true,
      data: {
        bookings,
        pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single booking
// @route   GET /api/booking/:bookingId
// @access  Private
const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId)
      .populate('user', 'name email phone')
      .populate('vehicle')
      .populate({ path: 'supplier', select: 'businessName email phone address services' });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    // Only allow owner, supplier or admin to see booking
    const isOwner = booking.user._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    let isSupplier = false;
    if (req.user.role === 'supplier') {
      const supplier = await Supplier.findOne({ user: req.user._id });
      isSupplier = supplier && booking.supplier._id.toString() === supplier._id.toString();
    }

    if (!isOwner && !isAdmin && !isSupplier) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    res.json({ success: true, data: { booking } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cancel booking (by user)
// @route   PUT /api/booking/:bookingId/cancel
// @access  Private (user)
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.bookingId, user: req.user._id });
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    if (['completed', 'in_progress', 'cancelled'].includes(booking.status)) {
      return res.status(400).json({ success: false, message: `Cannot cancel a ${booking.status} booking.` });
    }

    booking.status = 'cancelled';
    await booking.save();

    res.json({ success: true, message: 'Booking cancelled successfully.', data: { booking } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Rate a completed booking
// @route   POST /api/booking/:bookingId/rate
// @access  Private (user)
const rateBooking = async (req, res) => {
  try {
    const { score, review } = req.body;
    if (!score || score < 1 || score > 5) {
      return res.status(400).json({ success: false, message: 'Rating score must be between 1 and 5.' });
    }

    const booking = await Booking.findOne({ _id: req.params.bookingId, user: req.user._id });
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }
    if (booking.status !== 'completed') {
      return res.status(400).json({ success: false, message: 'Can only rate completed bookings.' });
    }
    if (booking.rating?.score) {
      return res.status(400).json({ success: false, message: 'Booking already rated.' });
    }

    booking.rating = { score, review, createdAt: new Date() };
    await booking.save();

    // Update supplier rating average
    const supplier = await Supplier.findById(booking.supplier);
    const allRatings = await Booking.find({ supplier: booking.supplier, 'rating.score': { $exists: true } });
    const avg = allRatings.reduce((sum, b) => sum + b.rating.score, 0) / allRatings.length;
    supplier.rating = { average: Math.round(avg * 10) / 10, count: allRatings.length };
    await supplier.save();

    res.json({ success: true, message: 'Rating submitted successfully.', data: { booking } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createBooking, getMyBookings, getBookingById, cancelBooking, rateBooking };
