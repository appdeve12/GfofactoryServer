// models/StockOutward.js
const mongoose = require("mongoose");

const StockOutwardSchema = new mongoose.Schema({
  material_Name: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Material",
    required: true,
  },
  quantity_used: {
    type: Number,
    required: true,
  },
  file: {
    url: { type: String, required: true },
    type: { type: String, required: true },
  },
  purpose: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  status: {
    type: String,
    enum: ["pending", "approved", "done","pending-approved"],  // aap chahe toh aur bhi states add kar sakte hain
    default: "pending",
  },
});

module.exports = mongoose.model("StockOutward", StockOutwardSchema);
