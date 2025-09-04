const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  material: { type: mongoose.Schema.Types.ObjectId, ref: "Material", required: true },
  materialName: { type: String },
  materialType: { type: String },
  supplierName: { type: String },
  supplierEmail: { type: String },
  supplierPhone: { type: String },
  billingAddress: { type: String },
  shippingAddress: { type: String },
  quantity: { type: Number },
  cost: { type: String },
  gstNumber: { type: String },
  remarks: { type: String },
  createdAt: { type: Date, default: Date.now },
  orderSaved: { type: Boolean, default: false },    // DB में save flag
  emailSent: { type: Boolean, default: false },     // Email sent flag
});

module.exports = mongoose.model("Order", OrderSchema);
