const express = require("express");
const router = express.Router();
const MaterialController = require("../controller/material.controller");
const auth = require("../middleware/authmiddleware");

// Create new material stock entry (Stock In)
router.post("/create", auth, MaterialController.createMaterialEntry);

// Get all materials
router.get("/all", auth, MaterialController.getAllMaterials);

// Get material by ID
router.get("/:id", auth, MaterialController.getMaterialById);

// Update material by ID
router.put("/:id", auth, MaterialController.updateMaterialById);

// Delete material by ID
router.delete("/:id", auth, MaterialController.deleteMaterialById);

module.exports = router;
