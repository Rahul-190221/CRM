const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const path = require("path");
const fs = require("fs");

const app = express();

/**
 * Load .env ONLY locally.
 */
if (process.env.NODE_ENV !== "production") {
  dotenv.config({ path: path.join(__dirname, ".env") });
}

// Required env checks
const requiredEnvVars = ["MONGO_URL", "JWT_SECRET"];
for (const k of requiredEnvVars) {
  if (!process.env[k]) {
    console.error(`❌ CRITICAL: Missing env variable: ${k}`);
    if (process.env.NODE_ENV === "production") {
      process.exit(1); // Exit in production if critical vars missing
    }
  }
}

// Middleware
app.use(express.json({ limit: "10mb" })); // Add size limit
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Ensure uploads directory exists
const uploadPath = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
  console.log("📁 Created uploads directory");
}

app.use("/uploads", express.static("uploads"));

// CORS Configuration
const allowedOrigins = new Set([
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  "https://onyourhelp.netlify.app",
  "https://onyourhelp.vercel.app",
]);

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (
        origin.endsWith(".netlify.app") ||
        origin.endsWith(".vercel.app") ||
        origin.startsWith("http://localhost") ||
        origin.startsWith("http://127.0.0.1") ||
        allowedOrigins.has(origin)
      ) {
        return cb(null, true);
      }
      return cb(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  })
);

// API routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/jobs", require("./routes/jobs"));

// Health check route
app.get("/", (req, res) => {
  res.status(200).json({ 
    status: "success", 
    message: "OnYourHelp API is active",
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: "Not Found", 
    message: "Route does not exist" 
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("❌ BACKEND ERROR:", err?.stack || err?.message || err);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
    error: process.env.NODE_ENV === "production" ? {} : err
  });
});

// Server Initialization
const startServer = async () => {
  try {
    const mongoUrl = process.env.MONGO_URL;
    if (!mongoUrl) {
      throw new Error("MONGO_URL environment variable is missing");
    }

    console.log("🔄 Connecting to MongoDB...");
    await connectDB(mongoUrl);
    console.log("✅ Database Connected Successfully");

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📝 Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (error) {
    console.error("❌ Critical Startup Error:", error.message);
    process.exit(1);
  }
};
  
if (require.main === module) {
  startServer();
}

module.exports = app;
