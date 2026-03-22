const Vehicle = require('../models/Vehicle');

// @desc    Add vehicle
// @route   POST /api/vehicle
// @access  Private (user)
const addVehicle = async (req, res) => {
  try {
    const { make, model, year, licensePlate, vehicleType, color, fuelType, mileage, vin, insuranceExpiry, notes } = req.body;

    if (!make || !model || !year || !licensePlate || !vehicleType) {
      return res.status(400).json({ success: false, message: 'Make, model, year, license plate, and vehicle type are required.' });
    }

    const existingVehicle = await Vehicle.findOne({ licensePlate: licensePlate.toUpperCase() });
    if (existingVehicle) {
      return res.status(400).json({ success: false, message: 'A vehicle with this license plate already exists.' });
    }

    const vehicle = await Vehicle.create({
      owner: req.user._id,
      make, model, year, licensePlate, vehicleType,
      color, fuelType, mileage, vin, insuranceExpiry, notes
    });

    res.status(201).json({ success: true, message: 'Vehicle added successfully.', data: { vehicle } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user's vehicles
// @route   GET /api/vehicle/my-vehicles
// @access  Private (user)
const getMyVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ owner: req.user._id, isActive: true }).sort({ createdAt: -1 });
    res.json({ success: true, data: { vehicles } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single vehicle
// @route   GET /api/vehicle/:vehicleId
// @access  Private (user)
const getVehicleById = async (req, res) => {
  try {
    const vehicle = await Vehicle.findOne({ _id: req.params.vehicleId, owner: req.user._id });
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found.' });
    }
    res.json({ success: true, data: { vehicle } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update vehicle
// @route   PUT /api/vehicle/:vehicleId
// @access  Private (user)
const updateVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findOneAndUpdate(
      { _id: req.params.vehicleId, owner: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found.' });
    }
    res.json({ success: true, message: 'Vehicle updated successfully.', data: { vehicle } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete vehicle (soft delete)
// @route   DELETE /api/vehicle/:vehicleId
// @access  Private (user)
const deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findOneAndUpdate(
      { _id: req.params.vehicleId, owner: req.user._id },
      { isActive: false },
      { new: true }
    );
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found.' });
    }
    res.json({ success: true, message: 'Vehicle removed successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { addVehicle, getMyVehicles, getVehicleById, updateVehicle, deleteVehicle };
