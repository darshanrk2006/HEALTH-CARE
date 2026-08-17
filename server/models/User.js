import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide an email address'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email address'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: true
  },
  role: {
    type: String,
    default: 'Patient / Health Member'
  },
  healthId: {
    type: String,
    unique: true,
    default: () => `TV-${Math.floor(1000 + Math.random() * 9000)}-AI`
  },
  bloodGroup: {
    type: String,
    default: 'O+'
  },
  phone: {
    type: String,
    default: '+1 (555) 234-8901'
  },
  age: {
    type: Number,
    default: 32
  },
  emergencyContactName: {
    type: String,
    default: 'Dr. Evelyn Mercer'
  },
  emergencyContactPhone: {
    type: String,
    default: '+1 (555) 987-6543'
  },
  hospitalPreference: {
    type: String,
    default: 'Titan Memorial Hospital (Zone 4)'
  },
  allergies: {
    type: String,
    default: 'Penicillin, Peanuts (Mild)'
  },
  settings: {
    appearance: {
      themeMode: { type: String, default: 'dark' },
      accentColor: { type: String, default: '#00d4ff' },
      accentName: { type: String, default: 'Cyan Glow' },
      fontSize: { type: String, default: 'normal' },
      reducedMotion: { type: Boolean, default: false }
    },
    vitals: {
      bpUnit: { type: String, default: 'mmHg' },
      tempUnit: { type: String, default: 'C' },
      weightUnit: { type: String, default: 'kg' },
      heightUnit: { type: String, default: 'cm' },
      hrAlertMin: { type: Number, default: 55 },
      hrAlertMax: { type: Number, default: 105 },
      autoSyncInterval: { type: String, default: '30s' }
    },
    ai: {
      defaultLanguage: { type: String, default: 'English' },
      clinicalDepth: { type: String, default: 'standard' },
      voiceAutoSpeak: { type: Boolean, default: false },
      autoScanReports: { type: Boolean, default: true }
    },
    notifications: {
      emergencyAlerts: { type: Boolean, default: true },
      criticalVitalSound: { type: Boolean, default: true },
      localEpidemicAlerts: { type: Boolean, default: true },
      medicationReminders: { type: Boolean, default: true },
      dailyCheckupPrompt: { type: Boolean, default: true }
    }
  },
  avatar: {
    type: String,
    default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
  },
  vitals: [
    {
      heartRate: Number,
      systolic: Number,
      diastolic: Number,
      spo2: Number,
      timestamp: {
        type: Date,
        default: Date.now
      }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save password hash
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
