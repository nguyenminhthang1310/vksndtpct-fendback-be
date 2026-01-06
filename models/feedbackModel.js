// models/feedbackModel.js
const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    username: { type: String, required: false },
    email: { type: String, required: false },
    phone: { type: String, required: false },
    message: { type: String, required: true },
    answer: { type: String, default: "" },
    visible: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Feedback", feedbackSchema);
