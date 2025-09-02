// models/User.js
const mongoose = require("mongoose");

const PermissionSchema = new mongoose.Schema({
  //MaterialName
  canAddMaterial: { type: Boolean, default: false },
  canEditMaterial: { type: Boolean, default: false },
  canDeleteMaterial: { type: Boolean, default: false },
  canViewMaterial:{type:Boolean,default:false},
  //Stock IN WARD
  canAddStockIn:{type:Boolean,default:false},
  canViewStockInData:{type:Boolean,default:false},
  canEditStockInData:{type:Boolean,default:false},
  canDeleteStockInData:{type:Boolean,default:false},
  //Stock Out Ward
  canAddStockOut:{type:Boolean,default:false},
  canViewStockOut:{type:Boolean,default:false},
  //Auto Stock
    canViewAutoStock: { type: Boolean, default: false },
  
});

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["admin", "supervisior"],
    default: "admin",
  },
  isBlocked: { type: Boolean, default: false },
  permissions: { type: PermissionSchema, default: () => ({}) }, // ✅ assign permissions
  created_At: { type: Date, default: Date.now },
});

module.exports = mongoose.model("user", UserSchema);
