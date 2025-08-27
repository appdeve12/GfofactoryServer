// models/StockOutward.js
const mongoose = require("mongoose");

const StockOutwardSchema = new mongoose.Schema({
  material_Name: {
    type: String,
    enum: [
      "MAP 90 Ammonium Phosphate",   
      "HDPE Plastic",
      "Separation Tube",
      "Sensor",
      "Packing & Wrapping Box",
      "Stand",
      "Screw",
      "Wall Plack",
    ],
    required: true,
  },
  quantity_used: { type: Number, required: true },
  purpose: { type: String, required: true },
  date: { type: Date, default: Date.now },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
});

module.exports = mongoose.model("StockOutward", StockOutwardSchema);
    