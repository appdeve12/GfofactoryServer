// models/MaterialStock.js
const mongoose = require("mongoose");

const MaterialStockSchema = new mongoose.Schema({
 material_Name: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Material",
    required: true,
  },
  purchase_quantity: { type: Number, required: true },
  purchase_date: { type: Date, required: true },
  supplier: { type: String },
 file: [
  {
    url: { type: String, required: true },
    type: { type: String, required: true }
  }
],
  remarks: { type: String },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
});

module.exports = mongoose.model("MaterialStock", MaterialStockSchema);
