import mongoose from 'mongoose';

const HealthRecordSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
      default: 'guest_user'
    },
    type: {
      type: String,
      required: true,
      enum: ['bp', 'report', 'prescription', 'general'],
      index: true
    },
    title: {
      type: String,
      required: true
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    summary: {
      type: String,
      default: ''
    },
    notes: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Compound index for querying user records by type ordered by date
HealthRecordSchema.index({ userId: 1, type: 1, createdAt: -1 });

const HealthRecord = mongoose.models.HealthRecord || mongoose.model('HealthRecord', HealthRecordSchema);

export default HealthRecord;
