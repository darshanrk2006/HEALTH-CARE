import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true
  },
  otp: {
    type: String,
    required: true
  },
  userData: {
    name: { type: String, default: 'Alex Mercer' },
    password: { type: String }, // Optional for password resets
    bloodGroup: { type: String, default: 'O+' },
    phone: { type: String, default: '' },
    role: { type: String, default: 'Patient / Health Member' },
    type: { type: String, default: 'signup' }
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600 // Auto-deletes from MongoDB after 10 minutes
  }
});

const Otp = mongoose.model('Otp', otpSchema);
export default Otp;
