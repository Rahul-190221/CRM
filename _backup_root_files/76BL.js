const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    // ✅ Must be optional for Google login
    password: { type: String, default: null },

    role: { type: String, enum: ["seeker", "employer"], default: "seeker" },

    provider: { type: String, enum: ["local", "google"], default: "local" },
    googleUid: { type: String, default: null },
    photoURL: { type: String, default: null }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
