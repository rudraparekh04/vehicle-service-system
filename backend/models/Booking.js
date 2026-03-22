const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: true
  },
  services: [{
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String }
  }],
  scheduledDate: {
    type: Date,
    required: [true, 'Scheduled date is required']
  },
  scheduledTime: {
    type: String,
    required: [true, 'Scheduled time is required']
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'rejected'],
    default: 'pending'
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  supplierNote: {
    type: String
  },
  completionNote: {
    type: String
  },
  rating: {
    score: { type: Number, min: 1, max: 5 },
    review: { type: String },
    createdAt: { type: Date }
  },
  bookingNumber: {
    type: String,
    unique: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending'
  }
}, { timestamps: true });

// Generate booking number before saving
bookingSchema.pre('save', async function(next) {
  if (!this.bookingNumber) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    this.bookingNumber = `VSS-${timestamp}-${random}`;
  }
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);
