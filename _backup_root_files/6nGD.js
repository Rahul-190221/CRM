// backend/config/db.js
const mongoose = require('mongoose');

const MONGO_URL = process.env.MONGO_URL;

if (!MONGO_URL) {
  throw new Error('MONGO_URL is missing in environment variables');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    console.log('[DB] Reusing existing connection');
    return cached.conn;
  }

  if (!cached.promise) {
    const options = {
      bufferCommands: false,              // No buffering → fail fast if not connected
      serverSelectionTimeoutMS: 5000,     // Fail after 5s (prevents long hangs)
      connectTimeoutMS: 10000,
      socketTimeoutMS: 20000,
      maxPoolSize: 10,
      minPoolSize: 2,
      family: 4
    };

    console.log('[DB] Starting new MongoDB connection...');

    cached.promise = mongoose.connect(MONGO_URL, options)
      .then(mongoose => {
        console.log('[DB] Connected successfully');
        return mongoose;
      })
      .catch(err => {
        console.error('[DB] Connection failed:', err.message);
        cached.promise = null;
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    throw err;
  }

  return cached.conn;
}

module.exports = connectDB;