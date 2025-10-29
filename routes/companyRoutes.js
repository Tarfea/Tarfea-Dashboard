// companyRoutes.js

const express = require("express");
const router = express.Router();
const Company = require("../models/Company");
const auth = require("../middleware/authMiddleware");

// GET all companies (only for logged-in user)
router.get("/", auth, async (req, res) => {
  try {
    const companies = await Company.find({ userId: req.user.id });
    res.json(companies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE company
router.post("/", auth, async (req, res) => {
  try {
    const newCompany = new Company({
      ...req.body,
      userId: req.user.id, // attach user ID
    });
    const saved = await newCompany.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single company
router.get("/:id", auth, async (req, res) => {
  try {
    const company = await Company.findOne({ _id: req.params.id, userId: req.user.id });
    if (!company) return res.status(404).json({ error: "Not found" });
    res.json(company);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE
router.put("/:id", auth, async (req, res) => {
  try {
    const updated = await Company.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE
router.delete("/:id", auth, async (req, res) => {
  try {
    const deleted = await Company.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!deleted) return res.status(404).json({ error: "Not found" });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
