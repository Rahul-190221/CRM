// backend/config/db.js
const mongoose = require("mongoose");

const MONGODB_URI = process.env.MONGO_URL;

if (!MONGODB_URI) {
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
      bufferCommands: false,              // Don't buffer ops if disconnected
      serverSelectionTimeoutMS: 5000,     // Fail fast after 5s (prevents 30s hangs)
      connectTimeoutMS: 10000,            // 10s max for initial connect
      maxPoolSize: 10,                    // Safe for Atlas free tier (M0 limit ~500 total)
      minPoolSize: 2,                     // Keep a small pool warm
      family: 4                           // Prefer IPv4 (helps some network issues)
    };

    cached.promise = mongoose
      .connect(MONGODB_URI, options)
      .then((mongoose) => {
        console.log("MongoDB connected successfully - cached for Vercel");
        return mongoose;
      })
      .catch((err) => {
        console.error("MongoDB connect failed:", err.message);
        cached.promise = null; // Reset to retry next time
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