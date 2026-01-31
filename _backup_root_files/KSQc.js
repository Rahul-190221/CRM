const express = require("express");
const Job = require("../models/Job");
const auth = require("../middleware/auth");

const router = express.Router();

/**
 * Public: list jobs
 * GET /api/jobs
 */
router.get("/", async (req, res, next) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 }).limit(200);
    res.json({ jobs });
  } catch (err) {
    next(err);
  }
});

/**
 * Protected: create job (employer)
 * POST /api/jobs
 */
router.post("/", auth, async (req, res, next) => {
  try {
    if (req.user.role !== "employer") {
      return res.status(403).json({ message: "Only employer can post jobs" });
    }

    const { title, company, location, salary, description } = req.body;

    if (!title || !company) {
      return res.status(400).json({ message: "title and company required" });
    }

    const job = await Job.create({
      title,
      company,
      location: location || "",
      salary: salary || "",
      description: description || "",
      postedBy: req.user.userId
    });

    res.status(201).json({ message: "Job created", job });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
