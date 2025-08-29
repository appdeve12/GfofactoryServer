// models/StockOutward.js
const mongoose = require("mongoose");

const StockOutwardSchema = new mongoose.Schema({
 
  material_Name: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Material",
    required: true,
  },
  quantity_used: { type: Number, required: true },
  purpose: { type: String, required: true },
  date: { type: Date, default: Date.now },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
});

module.exports = mongoose.model("StockOutward", StockOutwardSchema);
    