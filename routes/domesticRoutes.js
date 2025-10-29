// domesticRoutes.js

const express = require("express");
const router = express.Router();
const Domestic = require("../models/Domestic");
const auth = require("../middleware/authMiddleware");

// GET all
router.get("/", auth, async (req, res) => {
    try {
        const list = await Domestic.find({ userId: req.user.id });
        res.json(list);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// CREATE
router.post("/", auth, async (req, res) => {
    try {
        const newDomestic = new Domestic({
            ...req.body,
            userId: req.user.id, // attach userId
        });
        console.log(newDomestic);

        const saved = await newDomestic.save();
        res.status(201).json(saved);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET single
router.get("/:id", auth, async (req, res) => {
    try {
        const domestic = await Domestic.findOne({ _id: req.params.id, userId: req.user.id });
        if (!domestic) return res.status(404).json({ error: "Not found" });
        res.json(domestic);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// UPDATE
router.put("/:id", auth, async (req, res) => {
    try {
        const updated = await Domestic.findOneAndUpdate(
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
        const deleted = await Domestic.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        if (!deleted) return res.status(404).json({ error: "Not found" });
        res.json({ message: "Deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
