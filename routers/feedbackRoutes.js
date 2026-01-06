const express = require("express");
const router = express.Router();
const Feedback = require("../models/feedbackModel.js");
const { authMiddleware, adminOnly } = require("../middleware/auth");

// ----------------- Lấy tất cả phản hồi -----------------
router.get("/", async (req, res) => {
  try {
    const data = await Feedback.find().sort({ createdAt: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ----------------- Gửi phản hồi mới -----------------
router.post("/", async (req, res) => {
  try {
    const feedback = new Feedback(req.body);
    await feedback.save();
    res.json({ success: true, message: "Gửi phản hồi thành công" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ----------------- Admin: Cập nhật phản hồi -----------------
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const updated = await Feedback.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: "Không tìm thấy phản hồi" });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ----------------- Admin: Xóa phản hồi -----------------
router.delete("/:id", authMiddleware, adminOnly, async (req, res) => {
  try {
    const deleted = await Feedback.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: "Không tìm thấy phản hồi" });
    res.json({ success: true, message: "Đã xóa phản hồi" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
