const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db.js");
const feedbackRoutes = require("./routers/feedbackRoutes.js");
const userRoutes = require("./routers/userRoutes.js");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

connectDB();

app.use("/api/feedbacks", feedbackRoutes);
app.use("/api/users", userRoutes);

app.get("/", (req, res) => {
  res.send("✅ API Server đang chạy...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server chạy tại cổng ${PORT}`));
