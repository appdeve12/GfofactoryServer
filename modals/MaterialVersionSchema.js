const mongoose = require("mongoose");

const MaterialVersionSchema = new mongoose.Schema({
  materialId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MaterialStock",
    required: true,
  },
  data: { type: Object, required: true }, // Stores old version snapshot
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("MaterialVersion", MaterialVersionSchema);
