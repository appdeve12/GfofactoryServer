// models/Material.js
const mongoose = require("mongoose");

const MaterialSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String }, // optional
  created_At: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Material", MaterialSchema);
