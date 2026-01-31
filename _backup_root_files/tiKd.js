// backend/config/db.js
const mongoose = require("mongoose");

const MONGO_URL = process.env.MONGO_URL;

if (!MONGO_URL) {
  throw new Error("MONGO_URL is missing in environment variables");
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    console.log("Reusing cached MongoDB connection");
    return cached.conn;
  }

  if (!cached.promise) {
    const options = {
      bufferCommands: false,              // Fail fast on buffered ops
      serverSelectionTimeoutMS: 5000,     // Fail after 5s (critical for Vercel timeouts)
      connectTimeoutMS: 10000,            // 10s max initial connect attempt
      maxPoolSize: 10,                    // Safe limit for Atlas free tier
      minPoolSize: 2,                     // Keep minimal connections warm
      family: 4                           // Prefer IPv4 (helps some network issues)
    };

    cached.promise = mongoose
      .connect(MONGO_URL, options)
      .then((mongoose) => {
        console.log("MongoDB connected successfully (cached)");
        return mongoose;
      })
      .catch((err) => {
        console.error("MongoDB connection error:", err.message);
        cached.promise = null; // Reset to allow retry on next call
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