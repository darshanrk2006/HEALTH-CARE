import mongoose from 'mongoose';
import AuditLog from '../models/AuditLog.js';
import Hospital from '../models/Hospital.js';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/titanvitals';

async function updateOldLogs() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const hospital = await Hospital.findOne({ name: /Central Apex/i }) || await Hospital.findOne();
    const hospName = hospital ? hospital.name : 'Central Apex Multi-Specialty Hospital';
    const b = hospital?.bloodInventory || { oNegative: 8, oPositive: 24, aNegative: 6, plasmaUnits: 35 };
    const m = hospital?.medicineStock || { oxygenCylinders: 45, dialysisKits: 14, epinephrineVials: 50 };

    const detailString = `Updated supplies for "${hospName}": Blood Reserves [O-: ${b.oNegative || 8}, O+: ${b.oPositive || 24}, A-: ${b.aNegative || 6}, Plasma: ${b.plasmaUnits || 35}] | Pharma Reserves [O₂ Cylinders: ${m.oxygenCylinders || 45}, Dialysis: ${m.dialysisKits || 14}, Epinephrine: ${m.epinephrineVials || 50}]`;

    const result = await AuditLog.updateMany(
      { details: /Updated blood\/medicine supplies/i },
      { $set: { details: detailString } }
    );

    console.log(`Updated ${result.modifiedCount} old audit log entries to detailed breakdown!`);
    await mongoose.disconnect();
  } catch (err) {
    console.error('Migration error:', err);
  }
}

updateOldLogs();
