
import mongoose from 'mongoose';
import { log } from './vite';

const connectionString = process.env.MONGODB_URL;

if (!connectionString) {
  throw new Error('MONGODB_URL environment variable is not set');
}

export const connectDB = async () => {
  try {
    await mongoose.connect(connectionString);
    log('MongoDB connection initialized', 'mongodb');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};
