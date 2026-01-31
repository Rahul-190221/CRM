const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

/**
 * Helper: sign JWT
 */
function signToken(user) {
  return jwt.sign(
    { userId: user._id.toString(), role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

/**
 * Local Register
 * POST /api/auth/register
 */
router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "name, email, password required" });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashed,
      role: role === "employer" ? "employer" : "seeker",
      provider: "local"
    });

    const token = signToken(user);

    res.status(201).json({
      message: "Registered",
      token,
      userId: user._id,
      role: user.role,
      name: user.name,
      email: user.email
    });
  } catch (err) {
    console.error("❌ /register error:", err);
    next(err);
  }
});

/**
 * Local Login
 * POST /api/auth/login
 */
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "email and password required" });
    }

    const user = await User.findOne({ email });
    if (!user || !user.password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = signToken(user);

    res.status(200).json({
      message: "Login success",
      token,
      userId: user._id,
      role: user.role,
      name: user.name,
      email: user.email
    });
  } catch (err) {
    console.error("❌ /login error:", err);
    next(err);
  }
});

/**
 * Google Login
 * POST /api/auth/google
 *
 * Body example from frontend:
 * { name, email, role, uid, photoURL }
 */
router.post("/google", async (req, res, next) => {
  try {
    const { name, email, role, uid, photoURL } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const safeRole = role === "employer" ? "employer" : "seeker";

    // ✅ upsert prevents duplicate email crashes + no password needed
    const user = await User.findOneAndUpdate(
      { email },
      {
        $set: {
          name: name || "Google User",
          role: safeRole,
          provider: "google",
          googleUid: uid || null,
          photoURL: photoURL || null
        }
      },
      { new: true, upsert: true }
    );

    const token = signToken(user);

    res.status(200).json({
      message: "Google login success",
      token,
      userId: user._id,
      role: user.role,
      name: user.name,
      email: user.email
    });
  } catch (err) {
    console.error("❌ /google error:", err);
    next(err);
  }
});

module.exports = router;
