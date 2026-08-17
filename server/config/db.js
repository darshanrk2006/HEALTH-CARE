import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://admin:Darshanshero21@cluster0.fevperh.mongodb.net/titanvitals?retryWrites=true&w=majority';

  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 8000,
    };
    cached.promise = mongoose.connect(mongoURI, opts).then((mongooseInstance) => {
      console.log(`✅ MongoDB Connected to: ${mongooseInstance.connection.host}`);
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error('⚠️ MongoDB connection error:', e.message);
    // fallback attempt
    try {
      cached.conn = await mongoose.connect(mongoURI, { serverSelectionTimeoutMS: 8000 });
    } catch (fallbackErr) {
      console.error('Fallback connection error:', fallbackErr.message);
    }
  }

  return cached.conn;
};

export default connectDB;
