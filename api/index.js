import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from '../server/config/db.js';
import authRoutes from '../server/routes/auth.js';
import recordRoutes from '../server/routes/records.js';
import adminRoutes from '../server/routes/admin.js';
import hospitalRoutes from '../server/routes/hospitals.js';

dotenv.config();

const app = express();

app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

// Ensure database connection before API processing
app.use(async (req, res, next) => {
  try {
    await connectDB();
  } catch (err) {
    console.warn('DB connect notice:', err.message);
  }
  next();
});

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/hospitals', hospitalRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'TitanVitals Serverless API',
    timestamp: new Date().toISOString()
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('API Error:', err.stack || err.message);
  res.status(500).json({ success: false, message: err.message || 'Internal Server Error' });
});

export default app;
