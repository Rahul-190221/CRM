const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

dotenv.config();

const app = express();

// Required env checks
const requiredEnvVars = ["MONGO_URL", "JWT_SECRET"];
for (const k of requiredEnvVars) {
  if (!process.env[k]) {
    console.error(`❌ Missing env: ${k}`);
  }
}

// Body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS (Netlify + localhost + netlify previews)
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://onyourhelp.netlify.app",
  "https://onyourhelp.vercel.app"
];

app.use(
  cors({
    origin: function (origin, cb) {
      if (!origin) return cb(null, true);

      // allow any Netlify preview like https://xxxx--onyourhelp.netlify.app
      if (origin.endsWith(".netlify.app")) return cb(null, true);

      if (allowedOrigins.includes(origin)) return cb(null, true);

      return cb(new Error(`CORS blocked: ${origin}`), false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
  })
);

// Connect DB per request (serverless)
app.use(async (req, res, next) => {
  try {
    await connectDB(process.env.MONGO_URL);
    next();
  } catch (err) {
    console.error("❌ DB connect failed:", err);
    next(err);
  }
});

// Routes
app.get("/", (req, res) => {
  res.status(200).json({ status: "success", message: "Job Portal API is active" });
});

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
    message: process.env.NODE_ENV === "production" ? "Something went wrong" : (err.message || "Error")
  });
});

// Local run only
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
}

module.exports = app;
