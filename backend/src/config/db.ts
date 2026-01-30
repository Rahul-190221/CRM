import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/crm_luminedge';

    const maskedURI = mongoURI.replace(/:([^@]+)@/, ':****@');
    console.log(`Connecting to MongoDB: ${maskedURI}`);

    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
      family: 4,
    });

    console.log('MongoDB Connected Successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    console.error('Failed to connect to MongoDB. Server will not start.');
    process.exit(1);
  }
};

export default connectDB;
