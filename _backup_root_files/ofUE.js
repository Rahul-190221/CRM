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
  if (!process.env[k]) console.warn(`⚠️ Missing env: ${k}`);
}

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// Standard Health route
app.get("/", (req, res) => {
  res.status(200).json({ status: "success", message: "OnYourHelp API is active" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Not Found", message: "Route does not exist" });
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
    if (!mongoUrl) throw new Error("MONGO_URL is missing");

    await connectDB(mongoUrl);
    console.log("✅ Database Connected");

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  } catch (error) {
    console.error("Critical Startup Error:", error.message);
    process.exit(1);
  }
};
  
if (require.main === module) {
  startServer();
}

module.exports = app;
