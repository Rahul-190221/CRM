const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
const os = require("os");

dotenv.config();

const requiredEnvVars = ["MONGO_URL", "JWT_SECRET"];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`❌ ${envVar} is missing in environment configuration`);
    process.exit(1);
  }
}

const app = express();
const PORT = process.env.PORT || 5000;

/** -------------------------
 * DB Connection (serverless-safe)
 * ------------------------- */
const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;

  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log(`✅ MongoDB Connected: ${mongoose.connection.name}`);
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    // In serverless, better to throw so request returns proper error
    throw err;
  }
};

// Ensure DB connection before handling routes (important on Vercel)
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (e) {
    next(e);
  }
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/** -------------------------
 * CORS
 * ------------------------- */
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://onyourhelp.netlify.app",
  "https://onyourhelp.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      // allow your Netlify preview URLs: https://xxxx--onyourhelp.netlify.app
      if (origin.endsWith(".netlify.app")) return callback(null, true);

      if (allowedOrigins.includes(origin)) return callback(null, true);

      return callback(
        new Error(
          `CORS blocked for origin: ${origin}. Add it to allowedOrigins.`
        ),
        false
      );
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  })
);

/** -------------------------
 * Uploads directory (Vercel-safe)
 * ------------------------- */
// On Vercel, writing to __dirname is not allowed. Use /tmp (os.tmpdir()) if needed.
const isServerless = !!process.env.VERCEL;

const uploadsDir = isServerless
  ? path.join(os.tmpdir(), "uploads")
  : path.join(__dirname, "uploads");

try {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log("📁 Created uploads directory:", uploadsDir);
  }
} catch (e) {
  console.warn(
    "⚠️ Could not create uploads directory (safe to ignore if you do not upload files):",
    e.message
  );
}

// Static files (note: serverless file serving is limited; for production use S3/Cloudinary)
app.use("/uploads", express.static(uploadsDir));

/** -------------------------
 * Routes
 * ------------------------- */
app.get("/", (req, res) => {
  res
    .status(200)
    .json({ status: "success", message: "Job Portal API is active" });
});

app.use("/api/auth", require("./routes/auth"));
app.use("/api/jobs", require("./routes/jobs"));

// 404
app.use((req, res) => {
  res
    .status(404)
    .json({ error: "Not Found", message: "The requested route does not exist" });
});

// Global Error Handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  console.error(`❌ [${new Date().toISOString()}] Error:`, err.stack || err.message);

  res.status(statusCode).json({
    error: "Internal Server Error",
    message:
      process.env.NODE_ENV === "production"
        ? "Something went wrong"
        : err.message,
  });
});

// Local run only
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(
      `🚀 Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`
    );
  });
}

module.exports = app;
