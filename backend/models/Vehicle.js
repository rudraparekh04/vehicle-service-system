const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  make: {
    type: String,
    required: [true, 'Vehicle make is required'],
    trim: true
  },
  model: {
    type: String,
    required: [true, 'Vehicle model is required'],
    trim: true
  },
  year: {
    type: Number,
    required: [true, 'Vehicle year is required'],
    min: 1900,
    max: new Date().getFullYear() + 1
  },
  licensePlate: {
    type: String,
    required: [true, 'License plate is required'],
    unique: true,
    uppercase: true,
    trim: true
  },
  vehicleType: {
    type: String,
    enum: ['car', 'motorcycle', 'truck', 'bus', 'van', 'suv', 'other'],
    required: [true, 'Vehicle type is required']
  },
  color: {
    type: String,
    trim: true
  },
  fuelType: {
    type: String,
    enum: ['petrol', 'diesel', 'electric', 'hybrid', 'cng', 'other'],
    default: 'petrol'
  },
  mileage: {
    type: Number,
    default: 0
  },
  vin: {
    type: String,
    trim: true
  },
  insuranceExpiry: {
    type: Date
  },
  lastServiced: {
    type: Date
  },
  notes: {
    type: String,
    maxlength: [300, 'Notes cannot exceed 300 characters']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Vehicle', vehicleSchema);
