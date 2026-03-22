const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const {
  getDashboard, getAllUsers, toggleUserStatus,
  getAllSuppliers, updateSupplierStatus, deleteSupplier,
  getAllBookings, deleteUser
} = require('../controllers/admin.controller');

router.use(protect, authorize('admin'));

router.get('/dashboard', getDashboard);
router.get('/users', getAllUsers);
router.put('/users/:userId/toggle-status', toggleUserStatus);
router.delete('/users/:userId', deleteUser);
router.get('/suppliers', getAllSuppliers);
router.put('/suppliers/:supplierId/status', updateSupplierStatus);
router.delete('/suppliers/:supplierId', deleteSupplier);
router.get('/bookings', getAllBookings);

module.exports = router;
