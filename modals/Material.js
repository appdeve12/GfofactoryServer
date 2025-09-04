// models/Material.js
const mongoose = require("mongoose");

const MaterialSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  type:{type:String,required:true, enum: ["raw material", "ready material"],},
  description: { type: String }, // optional
    limit: { type: Number }, 
  created_At: { type: Date, default: Date.now },
    isOrdered: { type: Boolean, default: false },  // This will track order status
      createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },

});

module.exports = mongoose.model("Material", MaterialSchema);
