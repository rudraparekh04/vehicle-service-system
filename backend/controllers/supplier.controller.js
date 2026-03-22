const Supplier = require('../models/Supplier');
const User = require('../models/User');
const Booking = require('../models/Booking');

// @desc    Register as supplier
// @route   POST /api/supplier/register
// @access  Private (user)
const registerSupplier = async (req, res) => {
  try {
    const existingSupplier = await Supplier.findOne({ user: req.user._id });
    if (existingSupplier) {
      return res.status(400).json({ success: false, message: 'Supplier profile already exists.' });
    }

    const {
      businessName, businessType, description,
      address, phone, email, services, operatingHours
    } = req.body;

    if (!businessName || !businessType || !address || !phone || !email) {
      return res.status(400).json({ success: false, message: 'Business name, type, address, phone, and email are required.' });
    }

    const supplier = await Supplier.create({
      user: req.user._id,
      businessName, businessType, description,
      address, phone, email,
      services: services || [],
      operatingHours: operatingHours || {}
    });

    // Update user role to supplier
    await User.findByIdAndUpdate(req.user._id, { role: 'supplier' });

    res.status(201).json({
      success: true,
      message: 'Supplier registered successfully. Pending admin approval.',
      data: { supplier }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get supplier profile
// @route   GET /api/supplier/profile
// @access  Private (supplier)
const getSupplierProfile = async (req, res) => {
  try {
    const supplier = await Supplier.findOne({ user: req.user._id }).populate('user', 'name email');
    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Supplier profile not found.' });
    }
    res.json({ success: true, data: { supplier } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update supplier profile
// @route   PUT /api/supplier/profile
// @access  Private (supplier)
const updateSupplierProfile = async (req, res) => {
  try {
    const {
      businessName, businessType, description,
      address, phone, email, operatingHours
    } = req.body;

    const supplier = await Supplier.findOneAndUpdate(
      { user: req.user._id },
      { businessName, businessType, description, address, phone, email, operatingHours },
      { new: true, runValidators: true }
    );

    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Supplier profile not found.' });
    }

    res.json({ success: true, message: 'Profile updated successfully.', data: { supplier } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add service to supplier
// @route   POST /api/supplier/services
// @access  Private (supplier)
const addService = async (req, res) => {
  try {
    const { name, description, price, duration } = req.body;
    if (!name || !price) {
      return res.status(400).json({ success: false, message: 'Service name and price are required.' });
    }

    const supplier = await Supplier.findOne({ user: req.user._id });
    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Supplier profile not found.' });
    }

    supplier.services.push({ name, description, price, duration });
    await supplier.save();

    res.status(201).json({ success: true, message: 'Service added.', data: { supplier } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update service
// @route   PUT /api/supplier/services/:serviceId
// @access  Private (supplier)
const updateService = async (req, res) => {
  try {
    const supplier = await Supplier.findOne({ user: req.user._id });
    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Supplier profile not found.' });
    }

    const service = supplier.services.id(req.params.serviceId);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found.' });
    }

    const { name, description, price, duration } = req.body;
    if (name) service.name = name;
    if (description !== undefined) service.description = description;
    if (price !== undefined) service.price = price;
    if (duration !== undefined) service.duration = duration;

    await supplier.save();
    res.json({ success: true, message: 'Service updated.', data: { supplier } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete service
// @route   DELETE /api/supplier/services/:serviceId
// @access  Private (supplier)
const deleteService = async (req, res) => {
  try {
    const supplier = await Supplier.findOne({ user: req.user._id });
    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Supplier profile not found.' });
    }

    supplier.services = supplier.services.filter(s => s._id.toString() !== req.params.serviceId);
    await supplier.save();

    res.json({ success: true, message: 'Service deleted.', data: { supplier } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get bookings for supplier
// @route   GET /api/supplier/bookings
// @access  Private (supplier)
const getSupplierBookings = async (req, res) => {
  try {
    const supplier = await Supplier.findOne({ user: req.user._id });
    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Supplier profile not found.' });
    }

    const { status, page = 1, limit = 10 } = req.query;
    const query = { supplier: supplier._id };
    if (status) query.status = status;

    const bookings = await Booking.find(query)
      .populate('user', 'name email phone')
      .populate('vehicle')
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

// @desc    Update booking status (accept/reject/complete)
// @route   PUT /api/supplier/bookings/:bookingId/status
// @access  Private (supplier)
const updateBookingStatus = async (req, res) => {
  try {
    const { status, supplierNote } = req.body;
    const allowedStatuses = ['confirmed', 'in_progress', 'completed', 'rejected'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status.' });
    }

    const supplier = await Supplier.findOne({ user: req.user._id });
    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Supplier profile not found.' });
    }

    const booking = await Booking.findOne({ _id: req.params.bookingId, supplier: supplier._id });
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    booking.status = status;
    if (supplierNote) booking.supplierNote = supplierNote;
    if (status === 'completed') {
      booking.paymentStatus = 'paid';
    }
    await booking.save();

    res.json({ success: true, message: `Booking ${status} successfully.`, data: { booking } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get supplier dashboard stats
// @route   GET /api/supplier/dashboard
// @access  Private (supplier)
const getSupplierDashboard = async (req, res) => {
  try {
    const supplier = await Supplier.findOne({ user: req.user._id });
    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Supplier profile not found.' });
    }

    const [total, pending, confirmed, completed, rejected] = await Promise.all([
      Booking.countDocuments({ supplier: supplier._id }),
      Booking.countDocuments({ supplier: supplier._id, status: 'pending' }),
      Booking.countDocuments({ supplier: supplier._id, status: 'confirmed' }),
      Booking.countDocuments({ supplier: supplier._id, status: 'completed' }),
      Booking.countDocuments({ supplier: supplier._id, status: 'rejected' })
    ]);

    const revenue = await Booking.aggregate([
      { $match: { supplier: supplier._id, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    const recentBookings = await Booking.find({ supplier: supplier._id })
      .populate('user', 'name email')
      .populate('vehicle', 'make model licensePlate')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        stats: {
          total, pending, confirmed, completed, rejected,
          revenue: revenue[0]?.total || 0,
          rating: supplier.rating
        },
        recentBookings,
        supplier
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all approved suppliers (for users to browse)
// @route   GET /api/supplier/list
// @access  Public
const getAllSuppliers = async (req, res) => {
  try {
    const { city, service, page = 1, limit = 10 } = req.query;
    const query = { status: 'approved', isActive: true };

    if (city) query['address.city'] = new RegExp(city, 'i');

    let suppliers = await Supplier.find(query)
      .populate('user', 'name email')
      .sort({ 'rating.average': -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    if (service) {
      suppliers = suppliers.filter(s => 
        s.services.some(sv => sv.name.toLowerCase().includes(service.toLowerCase()))
      );
    }

    const total = await Supplier.countDocuments(query);

    res.json({
      success: true,
      data: {
        suppliers,
        pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single supplier detail
// @route   GET /api/supplier/:id
// @access  Public
const getSupplierById = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id).populate('user', 'name email');
    if (!supplier || supplier.status !== 'approved') {
      return res.status(404).json({ success: false, message: 'Supplier not found.' });
    }
    res.json({ success: true, data: { supplier } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  registerSupplier, getSupplierProfile, updateSupplierProfile,
  addService, updateService, deleteService,
  getSupplierBookings, updateBookingStatus, getSupplierDashboard,
  getAllSuppliers, getSupplierById
};
