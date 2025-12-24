const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  artistId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  listenerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  eventType: {
    type: String,
    required: true
  },
  eventDate: {
    type: Date,
    required: true
  },
  eventTime: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  notes: {
    type: String
  },
  status: {
    type: String,
    enum: [
      'waiting_confirmation',
      'waiting_payment',
      'waiting_final_confirmation',
      'completed',
      'cancelled',
      'incomplete'
    ],
    default: 'waiting_confirmation'
  },
  totalPrice: {
    type: Number,
    default: 0
  },
  listenerConfirmed: {
    type: Boolean,
    default: false
  },
  artistConfirmed: {
    type: Boolean,
    default: false
  },
  listenerFinalConfirmed: {
    type: Boolean,
    default: false
  },
  artistFinalConfirmed: {
    type: Boolean,
    default: false
  },
  paymentDone: {
    type: Boolean,
    default: false
  },
  cancelledBy: {
    type: String,
    enum: ['artist', 'listener', null],
    default: null
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Method to ensure JSON response matches spec
bookingSchema.methods.toJSON = function() {
  const obj = this.toObject();
  obj.id = obj._id;
  delete obj._id;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('Booking', bookingSchema);
