const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { addVehicle, getMyVehicles, getVehicleById, updateVehicle, deleteVehicle } = require('../controllers/vehicle.controller');

router.post('/', protect, addVehicle);
router.get('/my-vehicles', protect, getMyVehicles);
router.get('/:vehicleId', protect, getVehicleById);
router.put('/:vehicleId', protect, updateVehicle);
router.delete('/:vehicleId', protect, deleteVehicle);

module.exports = router;
