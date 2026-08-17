import mongoose from 'mongoose';

const broadcastSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true
  },
  severity: {
    type: String,
    enum: ['Code Red - Mass Casualty', 'Code Blue - Severe Surge', 'Yellow Alert - Bed Capacity', 'General Advisory'],
    default: 'Code Red - Mass Casualty'
  },
  targetHospitals: {
    type: String,
    default: 'All Regional Hospitals'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  authorName: {
    type: String,
    default: 'Chief Medical Administrator'
  },
  authorAdminId: {
    type: String,
    default: '2319'
  }
}, {
  timestamps: true
});

const Broadcast = mongoose.model('Broadcast', broadcastSchema);
export default Broadcast;
