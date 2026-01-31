const mongoose = require("mongoose");

let cached = global.mongoose;
if (!cached) cached = global.mongoose = { conn: null, promise: null };

async function connectDB(mongoUrl) {
  // Use MONGO_URL from Vercel or fall back to MONGODB_URI
  const url = mongoUrl || process.env.MONGO_URL || process.env.MONGODB_URI;
  
  if (!url) {
    throw new Error("MONGO_URL or MONGODB_URI environment variable is missing");
  }

  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(url, {
        bufferCommands: false,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        connectTimeoutMS: 10000,
      })
      .then((m) => {
        console.log("MongoDB Connected Successfully");
        return m;
      })
      .catch((error) => {
        console.error("MongoDB Connection Error:", error.message);
        throw error;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

module.exports = connectDB;
