import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import recordRoutes from './routes/records.js';
import adminRoutes from './routes/admin.js';
import hospitalRoutes from './routes/hospitals.js';
import Admin from './models/Admin.js';
import Hospital from './models/Hospital.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Connect to MongoDB
connectDB().then(async () => {
  try {
    // 1. Seed Master Admin: Admin ID: 2319 / Password: admin@123
    const masterAdmin = await Admin.findOne({ adminId: '2319' });
    if (!masterAdmin) {
      const admin = new Admin({
        adminId: '2319',
        name: 'Chief Medical Administrator',
        email: 'admin2319@titanvitals.ai',
        password: 'admin@123',
        role: 'Master Admin',
        isMaster: true,
        department: 'Emergency Healthcare Operations & Bed Command'
      });
      await admin.save();
      console.log('👑 Master Admin seeded in MongoDB: Admin ID [2319] | Password [admin@123]');
    }

    // 2. Seed Initial Hospitals if collection is empty
    const hospitalCount = await Hospital.countDocuments();
    if (hospitalCount === 0) {
      const initialHospitals = [
        {
          name: 'Central Apex Multi-Specialty Hospital',
          address: '742 Healthcare Blvd, Metro Medical District',
          city: 'Metro Medical District',
          phone: '+1 (800) 555-0192',
          distanceKm: 2.4,
          etaMin: 7,
          icuBeds: 6,
          oxygenBeds: 18,
          generalBeds: 34,
          ventilators: 4,
          departments: ['Emergency / Trauma', 'Cardiology', 'Pulmonology', 'Neurology'],
          emergencyStatus: 'Open - Rapid Triage Active'
        },
        {
          name: 'St. Jude University Trauma & Heart Center',
          address: '108 University Ave, East Health Campus',
          city: 'East Health Campus',
          phone: '+1 (800) 555-0348',
          distanceKm: 4.8,
          etaMin: 12,
          icuBeds: 2,
          oxygenBeds: 9,
          generalBeds: 15,
          ventilators: 2,
          departments: ['Emergency / Trauma', 'Cardiology', 'Pediatrics'],
          emergencyStatus: 'Limited ICU Capacity'
        },
        {
          name: 'Metropolitan Pediatric & Maternity Institute',
          address: '320 Greenfield Parkway',
          city: 'Greenfield Suburb',
          phone: '+1 (800) 555-0782',
          distanceKm: 6.1,
          etaMin: 15,
          icuBeds: 8,
          oxygenBeds: 22,
          generalBeds: 45,
          ventilators: 5,
          departments: ['Pediatrics', 'Maternity / OB-GYN', 'Neonatal ICU'],
          emergencyStatus: 'Open - Normal Operations'
        },
        {
          name: 'Memorial Neurological & Critical Care Hospital',
          address: '950 West Highlands Expressway',
          city: 'West Highlands',
          phone: '+1 (800) 555-0911',
          distanceKm: 8.7,
          etaMin: 22,
          icuBeds: 0,
          oxygenBeds: 4,
          generalBeds: 8,
          ventilators: 1,
          departments: ['Neurology', 'Critical Care / Stroke Unit'],
          emergencyStatus: 'ICU Critical - Diversion Protocol'
        }
      ];
      await Hospital.insertMany(initialHospitals);
      console.log('🏥 Initial Hospital & Bed facilities seeded into MongoDB.');
    }
  } catch (seedErr) {
    console.warn('Admin/Hospital Seed Notice:', seedErr.message);
  }
});

// Middleware - Allow all origins (Local, Mobile Wi-Fi, Pinggy tunnels, and Render cloud)
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

// Ensure Database is connected before API handlers on Serverless/Vercel
app.use(async (req, res, next) => {
  if (req.path.startsWith('/api')) {
    try {
      await connectDB();
    } catch (dbErr) {
      console.warn('Database connect notice:', dbErr.message);
    }
  }
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/hospitals', hospitalRoutes);

// Serve static frontend in production (Single Web Service Deployment)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, '../dist');

app.use(express.static(distPath));

// Health Check Route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'TitanVitals Fullstack Platform',
    timestamp: new Date().toISOString()
  });
});

// Universal SPA Fallback for React Router
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  if (req.method !== 'GET') return next();
  res.sendFile(path.join(distPath, 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({ success: false, message: err.message || 'Internal Server Error' });
});

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 TitanVitals Real-Time Backend running on http://localhost:${PORT}`);
    console.log(`🗄️ Connected to MongoDB: ${process.env.MONGODB_URI || 'mongodb://localhost:27017/titanvitals'}`);
  });
}

export default app;
