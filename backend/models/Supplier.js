const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  businessName: {
    type: String,
    required: [true, 'Business name is required'],
    trim: true
  },
  businessType: {
    type: String,
    enum: ['garage', 'workshop', 'dealership', 'mobile_service', 'other'],
    required: [true, 'Business type is required']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true }
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required']
  },
  email: {
    type: String,
    required: true,
    lowercase: true
  },
  services: [{
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true, min: 0 },
    duration: { type: String } // e.g. "2 hours"
  }],
  operatingHours: {
    open: { type: String, default: '09:00' },
    close: { type: String, default: '18:00' },
    days: [{
      type: String,
      enum: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']
    }]
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'suspended'],
    default: 'pending'
  },
  rating: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 }
  },
  documents: {
    license: { type: String },
    gst: { type: String }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  adminNote: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Supplier', supplierSchema);
