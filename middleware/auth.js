const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

// Middleware xác thực JWT
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Thiếu token xác thực" });
    }

    const token = authHeader.split(" ")[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(payload.id);
    if (!user) return res.status(401).json({ success: false, message: "User không tồn tại" });

    req.user = user; // lưu thông tin user vào request
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Token không hợp lệ hoặc hết hạn" });
  }
};

// Middleware phân quyền admin
const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Chỉ admin mới thực hiện được" });
  }
  next();
};

module.exports = { authMiddleware, adminOnly };
