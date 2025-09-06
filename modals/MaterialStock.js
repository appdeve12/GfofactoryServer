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
    cost: { type: String, required: true },
  supplier: { type: String },
 file: [
  {
    url: { type: String, required: true },
    type: { type: String, required: true }
  }
],
purchase_unit:{type:String,required:true},
cost_unit:{type:String,required:true},
  remarks: { type: String },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
  status:{
    type:String,
    enum:["draft","done","request-pending","edit-approved","final-done","review"],
    default:"draft"
  },
  oldVersion: {  
  type: Object,
  default: null,
},
    createdByRole: {
    type: String,
    enum: ["admin", "supervisior"],
    required: true,
  },
  
  requestBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" }, // if any
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" }, // supervisor
  reviewedAt: { type: Date },
});

module.exports = mongoose.model("MaterialStock", MaterialStockSchema);
