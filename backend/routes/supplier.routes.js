const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const {
  registerSupplier, getSupplierProfile, updateSupplierProfile,
  addService, updateService, deleteService,
  getSupplierBookings, updateBookingStatus, getSupplierDashboard,
  getAllSuppliers, getSupplierById
} = require('../controllers/supplier.controller');

// Public routes
router.get('/list', getAllSuppliers);
router.get('/:id', getSupplierById);

// Authenticated user can register as supplier
router.post('/register', protect, registerSupplier);

// Supplier only routes
router.get('/profile', protect, authorize('supplier'), getSupplierProfile);
router.put('/profile', protect, authorize('supplier'), updateSupplierProfile);
router.get('/dashboard', protect, authorize('supplier'), getSupplierDashboard);

// Service management
router.post('/services', protect, authorize('supplier'), addService);
router.put('/services/:serviceId', protect, authorize('supplier'), updateService);
router.delete('/services/:serviceId', protect, authorize('supplier'), deleteService);

// Booking management
router.get('/bookings', protect, authorize('supplier'), getSupplierBookings);
router.put('/bookings/:bookingId/status', protect, authorize('supplier'), updateBookingStatus);

module.exports = router;
