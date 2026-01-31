const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Detect serverless (Vercel)
const IS_VERCEL = !!process.env.VERCEL;
const IS_PROD = process.env.NODE_ENV === "production";

// Validate required environment variables (do NOT hard-exit on Vercel)
const requiredEnvVars = ["MONGO_URL", "JWT_SECRET"];
const missing = requiredEnvVars.filter((k) => !process.env[k]);

if (missing.length) {
  console.error(`❌ Missing env vars: ${missing.join(", ")}`);

  // Locally it’s fine to stop. On Vercel, avoid process.exit() during import.
  if (!IS_VERCEL) {
    process.exit(1);
  }
}

// MongoDB Connection (cached across warm invocations)
const connectDB = async () => {
  // 1 = connected, 2 = connecting
  if (mongoose.connection.readyState === 1) return;
  if (mongoose.connection.readyState === 2) return;

  try {
    await mongoose.connect(process.env.MONGO_URL, {
      // recommended options can be omitted in newer mongoose, but harmless
      // keep it simple
    });

    console.log(`✅ MongoDB Connected: ${mongoose.connection.name}`);
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    throw err; // important: bubble up so routes return 500 instead of random failures
  }
};

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---- CORS (Netlify frontend + local) ----
const allowedOrigins = new Set([
  "http://localhost:5173",
  "http://localhost:5174",
  "https://onyourhelp.netlify.app",
]);

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (curl, server-to-server)
      if (!origin) return callback(null, true);

      // allow any Netlify preview URL too
      const isNetlifyPreview =
        origin.endsWith(".netlify.app") || origin.includes("--");

      if (allowedOrigins.has(origin) || isNetlifyPreview) {
        return callback(null, true);
      }

      return callback(
        new Error(
          `CORS blocked. Origin not allowed: ${origin}. Allowed: ${[
            ...allowedOrigins,
          ].join(", ")}`
        ),
        false
      );
    },
    credentials: true,
  })
);

// ---- Uploads directory (Vercel: only /tmp is writable) ----
const uploadsDir = IS_VERCEL
  ? path.join("/tmp", "uploads")
  : path.join(__dirname, "uploads");

try {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log(`📁 Created uploads directory: ${uploadsDir}`);
  }
} catch (e) {
  // Do NOT crash the app on Vercel due to FS restrictions
  console.error("⚠️ Could not create uploads directory:", e.message);
}

// Static (note: in serverless this is ephemeral; fine for temporary uploads)
app.use("/uploads", express.static(uploadsDir));

// Ensure DB connection before handling API routes (serverless-safe)
app.use(async (req, res, next) => {
  // Health route should not require DB
  if (req.path === "/") return next();

  try {
    await connectDB();
    next();
  } catch (err) {
    next(err);
  }
});

// Routes
app.get("/", (req, res) => {
  res
    .status(200)
    .json({ status: "success", message: "Job Portal API is active" });
});

app.use("/api/auth", require("./routes/auth"));
app.use("/api/jobs", require("./routes/jobs"));

// 404 Handler
app.use((req, res) => {
  res
    .status(404)
    .json({ error: "Not Found", message: "The requested route does not exist" });
});

// Global Error Handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  console.error(`❌ [${new Date().toISOString()}] Error:`, err.stack || err);

  res.status(statusCode).json({
    error: "Internal Server Error",
    message: IS_PROD ? "Something went wrong" : err.message,
  });
});

// Local dev only (Vercel serverless does not need listen)
if (!IS_VERCEL && require.main === module) {
  app.listen(PORT, () => {
    console.log(
      `🚀 Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`
    );
  });
}

module.exports = app;
