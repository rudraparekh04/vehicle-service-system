const User = require('../models/User');
const Supplier = require('../models/Supplier');
const Booking = require('../models/Booking');
const Vehicle = require('../models/Vehicle');

// @desc    Get dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private (admin)
const getDashboard = async (req, res) => {
  try {
    const [
      totalUsers, totalSuppliers, totalBookings, totalVehicles,
      pendingSuppliers, completedBookings
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Supplier.countDocuments(),
      Booking.countDocuments(),
      Vehicle.countDocuments(),
      Supplier.countDocuments({ status: 'pending' }),
      Booking.countDocuments({ status: 'completed' })
    ]);

    const revenue = await Booking.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    const recentBookings = await Booking.find()
      .populate('user', 'name email')
      .populate('vehicle', 'make model licensePlate')
      .populate({ path: 'supplier', select: 'businessName' })
      .sort({ createdAt: -1 })
      .limit(10);

    const recentSuppliers = await Supplier.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    // Monthly bookings (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyBookings = await Booking.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          count: { $sum: 1 },
          revenue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          totalUsers, totalSuppliers, totalBookings, totalVehicles,
          pendingSuppliers, completedBookings,
          totalRevenue: revenue[0]?.total || 0
        },
        recentBookings,
        recentSuppliers,
        monthlyBookings
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (admin)
const getAllUsers = async (req, res) => {
  try {
    const { role, search, page = 1, limit = 10 } = req.query;
    const query = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') }
      ];
    }

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        users,
        pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle user active status
// @route   PUT /api/admin/users/:userId/toggle-status
// @access  Private (admin)
const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot modify admin account.' });
    }
    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully.`,
      data: { user }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all suppliers
// @route   GET /api/admin/suppliers
// @access  Private (admin)
const getAllSuppliers = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { businessName: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') }
      ];
    }

    const suppliers = await Supplier.find(query)
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

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

// @desc    Update supplier status (approve/reject/suspend)
// @route   PUT /api/admin/suppliers/:supplierId/status
// @access  Private (admin)
const updateSupplierStatus = async (req, res) => {
  try {
    const { status, adminNote } = req.body;
    const allowedStatuses = ['approved', 'rejected', 'suspended', 'pending'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status.' });
    }

    const supplier = await Supplier.findById(req.params.supplierId).populate('user');
    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Supplier not found.' });
    }

    supplier.status = status;
    if (adminNote) supplier.adminNote = adminNote;

    // If rejected or suspended, deactivate supplier's user account
    if (status === 'suspended') {
      await User.findByIdAndUpdate(supplier.user._id, { isActive: false });
    } else if (status === 'approved') {
      await User.findByIdAndUpdate(supplier.user._id, { isActive: true });
    }

    await supplier.save();

    res.json({
      success: true,
      message: `Supplier ${status} successfully.`,
      data: { supplier }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete supplier
// @route   DELETE /api/admin/suppliers/:supplierId
// @access  Private (admin)
const deleteSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.supplierId);
    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Supplier not found.' });
    }
    // Change user role back to user
    await User.findByIdAndUpdate(supplier.user, { role: 'user' });
    await Supplier.findByIdAndDelete(req.params.supplierId);

    res.json({ success: true, message: 'Supplier deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all bookings
// @route   GET /api/admin/bookings
// @access  Private (admin)
const getAllBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = {};
    if (status) query.status = status;

    const bookings = await Booking.find(query)
      .populate('user', 'name email')
      .populate('vehicle', 'make model licensePlate')
      .populate({ path: 'supplier', select: 'businessName email' })
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

// @desc    Delete user
// @route   DELETE /api/admin/users/:userId
// @access  Private (admin)
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot delete admin account.' });
    }
    await User.findByIdAndDelete(req.params.userId);
    res.json({ success: true, message: 'User deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getDashboard, getAllUsers, toggleUserStatus,
  getAllSuppliers, updateSupplierStatus, deleteSupplier,
  getAllBookings, deleteUser
};
