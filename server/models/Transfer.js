import mongoose from 'mongoose';

const transferSchema = new mongoose.Schema({
  patientName: {
    type: String,
    required: true,
    trim: true
  },
  patientAge: {
    type: Number,
    required: true
  },
  patientGender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    default: 'Male'
  },
  conditionSummary: {
    type: String,
    required: true
  },
  priority: {
    type: String,
    enum: ['P1 - Critical Emergency', 'P2 - Urgent Care', 'P3 - Standard Transfer'],
    default: 'P1 - Critical Emergency'
  },
  requiredBedType: {
    type: String,
    enum: ['ICU Bed', 'Oxygen Bed', 'General Bed', 'Ventilator Unit'],
    default: 'ICU Bed'
  },
  originHospital: {
    type: String,
    required: true
  },
  destinationHospital: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending Review', 'Ambulance Dispatched', 'In Transit', 'Completed', 'Cancelled'],
    default: 'Pending Review'
  },
  ambulanceUnit: {
    type: String,
    default: 'ALS-Rescue-04'
  },
  etaMinutes: {
    type: Number,
    default: 12
  },
  requestedBy: {
    type: String,
    default: 'Chief Medical Administrator'
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

const Transfer = mongoose.model('Transfer', transferSchema);
export default Transfer;
