import mongoose from 'mongoose';

const hospitalSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    default: 'Metro Medical District'
  },
  state: {
    type: String,
    default: 'National Health Zone'
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  distanceKm: {
    type: Number,
    default: 2.5
  },
  etaMin: {
    type: Number,
    default: 8
  },
  icuBeds: {
    type: Number,
    required: true,
    default: 5
  },
  oxygenBeds: {
    type: Number,
    required: true,
    default: 15
  },
  generalBeds: {
    type: Number,
    required: true,
    default: 30
  },
  ventilators: {
    type: Number,
    required: true,
    default: 4
  },
  maxBedCapacity: {
    type: Number,
    required: true,
    default: 100
  },
  departments: {
    type: [String],
    default: ['Emergency / Trauma', 'Cardiology', 'Pulmonology', 'Critical Care']
  },
  emergencyStatus: {
    type: String,
    default: 'Open - Rapid Triage Active'
  },
  isEmergencyReady: {
    type: Boolean,
    default: true
  },
  bloodInventory: {
    oNegative: { type: Number, default: 8 },
    oPositive: { type: Number, default: 24 },
    aNegative: { type: Number, default: 6 },
    aPositive: { type: Number, default: 18 },
    bNegative: { type: Number, default: 5 },
    bPositive: { type: Number, default: 20 },
    abNegative: { type: Number, default: 3 },
    abPositive: { type: Number, default: 12 },
    plasmaUnits: { type: Number, default: 35 },
    plateletUnits: { type: Number, default: 16 }
  },
  medicineStock: {
    oxygenCylinders: { type: Number, default: 45 },
    dialysisKits: { type: Number, default: 14 },
    antiVenomVials: { type: Number, default: 10 },
    epinephrineVials: { type: Number, default: 50 },
    ventilatorCircuits: { type: Number, default: 22 }
  },
  createdBy: {
    type: String,
    default: 'Admin-2319'
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

hospitalSchema.pre('save', function() {
  this.updatedAt = new Date();
});

const Hospital = mongoose.model('Hospital', hospitalSchema);

export default Hospital;
