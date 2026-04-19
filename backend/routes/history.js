const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middleware/auth");
const History = require("../models/History");

// @GET /api/history  — user's own history
router.get("/", protect, async (req, res) => {
  try {
    const history = await History.find({ user: req.user._id })
      .sort("-createdAt")
      .limit(50);
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @DELETE /api/history/:id
router.delete("/:id", protect, async (req, res) => {
  try {
    const entry = await History.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!entry) return res.status(404).json({ message: "Not found" });
    await entry.deleteOne();
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @GET /api/history/all  — admin only
router.get("/all", protect, adminOnly, async (req, res) => {
  try {
    const history = await History.find()
      .populate("user", "name email")
      .sort("-createdAt")
      .limit(200);
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
