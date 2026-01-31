const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const path = require("path");

const app = express();

/**
 * Load .env ONLY locally.
 * On Vercel, environment variables come from Project Settings → Environment Variables.
 */
if (process.env.NODE_ENV !== "production") {
  dotenv.config({ path: path.join(__dirname, ".env") });
}

// Required env checks (warn only)
const requiredEnvVars = ["MONGO_URL", "JWT_SECRET"];
for (const k of requiredEnvVars) {
  if (!process.env[k]) console.warn(`⚠️ Missing env: ${k}`);
}

// Body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static uploads (note: Vercel is not good for persistent uploads)
app.use("/uploads", express.static("uploads"));

// CORS
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

      console.log("Incoming Request Origin:", origin);

      // Trust Netlify previews and local dev
      if (
        origin.endsWith(".netlify.app") ||
        origin.startsWith("http://localhost") ||
        origin.startsWith("http://127.0.0.1")
      ) {
        return cb(null, true);
      }

      if (allowedOrigins.has(origin)) return cb(null, true);

      // In production, better to block unknown origins
      if (process.env.NODE_ENV === "production") {
        return cb(new Error("Not allowed by CORS"));
      }

      // In dev, allow but warn
      console.warn("Unknown origin allowed (dev):", origin);
      return cb(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  })
);

/**
 * Connect DB lazily (only when a request comes in).
 * Your connectDB should internally avoid reconnecting if already connected.
 */
let dbReady = false;
app.use(async (req, res, next) => {
  try {
    if (!dbReady) {
      if (!process.env.MONGO_URL) {
        throw new Error("MONGO_URL is not defined in environment variables");
      }
      await connectDB(process.env.MONGO_URL);
      dbReady = true;
      console.log("✅ DB ready");
    }
    next();
  } catch (err) {
    console.error("❌ DB connect failed:", err.message);
    res
      .status(500)
      .json({ error: "Database Connection Error", message: err.message });
  }
});

// Health routes
app.get("/", (req, res) => {
  res.status(200).json({ status: "success", message: "Job Portal API is active" });
});

// Optional (useful when vercel.json routes only /api/*)
app.get("/api", (req, res) => {
  res.status(200).json({ status: "success", message: "Job Portal API is active" });
});

// API routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/jobs", require("./routes/jobs"));

// 404
app.use((req, res) => {
  res.status(404).json({ error: "Not Found", message: "Route does not exist" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("❌ Server error:", err?.stack || err?.message || err);
  res.status(500).json({
    error: "Internal Server Error",
    message:
      process.env.NODE_ENV === "production"
        ? "Something went wrong"
        : err.message || "Error",
  });
});

// Local run only
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
}

module.exports = app;
