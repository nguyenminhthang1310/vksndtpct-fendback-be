const express = require("express");
const router = express.Router();
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { authMiddleware, adminOnly } = require("../middleware/auth");


// Lấy tất cả user (chỉ admin)
router.get("/", authMiddleware, adminOnly, async (req, res) => {
  try {
    const users = await User.find({}, "-password"); // không trả password
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ----------------- Đăng ký user bình thường -----------------
router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ message: "Username và password bắt buộc" });

    const existing = await User.findOne({ username });
    if (existing) return res.status(400).json({ message: "User đã tồn tại" });

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashed, role: "user" });
    await user.save();

    res.json({ message: "Tạo tài khoản thành công", user: { id: user._id, username: user.username } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ----------------- Đăng nhập user/admin -----------------
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) return res.status(401).json({ message: "Sai tài khoản" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Sai mật khẩu" });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.json({ message: "Đăng nhập thành công", token, role: user.role });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ----------------- Reset mật khẩu self -----------------
router.post("/reset-password", authMiddleware, async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 8)
      return res.status(400).json({ message: "Password phải >= 8 ký tự." });

    req.user.password = await bcrypt.hash(newPassword, 10);
    await req.user.save();
    res.json({ message: "Reset mật khẩu thành công" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ----------------- Admin: Thêm user -----------------
router.post("/admin/add-user", authMiddleware, adminOnly, async (req, res) => {
  try {
    const { username, password, role } = req.body;
    if (!username || !password)
      return res.status(400).json({ message: "Username và password bắt buộc" });

    const existing = await User.findOne({ username });
    if (existing) return res.status(400).json({ message: "User đã tồn tại" });

    const hashed = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashed, role: role || "user" });
    await newUser.save();

    res.json({ message: "Tạo user thành công", user: { id: newUser._id, username: newUser.username, role: newUser.role } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ----------------- Admin: Sửa user -----------------
router.put("/admin/edit-user/:id", authMiddleware, adminOnly, async (req, res) => {
  try {
    const { username, password, role } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User không tồn tại" });

    if (username) user.username = username;
    if (password) user.password = await bcrypt.hash(password, 10);
    if (role) user.role = role;

    await user.save();
    res.json({ message: "Cập nhật user thành công", user: { id: user._id, username: user.username, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ----------------- Admin: Xóa user -----------------
router.delete("/admin/delete-user/:id", authMiddleware, adminOnly, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User không tồn tại" });

    res.json({ message: "Xóa user thành công", user: { id: user._id, username: user.username } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ----------------- Admin: Reset mật khẩu bất kỳ user -----------------
router.post("/admin/reset-password/:id", authMiddleware, adminOnly, async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 8)
      return res.status(400).json({ message: "Password phải >= 8 ký tự." });

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User không tồn tại" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: `Reset mật khẩu cho user ${user.username} thành công.` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
