import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  patientName: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    required: true
  },
  hospitalName: {
    type: String,
    required: true
  },
  bedType: {
    type: String,
    required: true,
    default: 'ICU Bed'
  },
  needAmbulance: {
    type: Boolean,
    default: false
  },
  conditionSummary: {
    type: String,
    default: 'Emergency Bed Reservation'
  },
  token: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['Confirmed', 'Admitted', 'Discharged', 'Cancelled'],
    default: 'Confirmed'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
