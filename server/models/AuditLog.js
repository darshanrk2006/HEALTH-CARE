import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['Bed Telemetry', 'Hospital Management', 'Patient Transfer', 'Emergency Broadcast', 'Admin Auth', 'Supply Inventory'],
    default: 'Bed Telemetry'
  },
  details: {
    type: String,
    required: true
  },
  adminId: {
    type: String,
    required: true
  },
  adminName: {
    type: String,
    default: 'Administrator'
  },
  targetResource: {
    type: String,
    default: 'System'
  },
  ipAddress: {
    type: String,
    default: '127.0.0.1'
  }
}, {
  timestamps: true
});

const AuditLog = mongoose.model('AuditLog', auditLogSchema);
export default AuditLog;
