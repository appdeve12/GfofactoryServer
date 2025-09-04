const express = require("express");
const router = express.Router();
const MaterialController = require("../controller/material.controller");
const auth = require("../middleware/authmiddleware");

// Create new material stock entry (Stock In)
router.post("/create", auth, MaterialController.createMaterialEntry);

// Get all materials
router.get("/all", auth, MaterialController.getAllMaterials);
router.get("/alldonematerial", auth, MaterialController.getDoneMaterialsByUserRole);

router.get("/allforsupervisior", auth, MaterialController.getMaterialsForSupervisor);

// Get material by ID
router.get("/:id", auth, MaterialController.getMaterialById);

// Update material by ID
router.put("/:id", auth, MaterialController.updateMaterialById);

// Delete material by ID
router.delete("/:id", auth, MaterialController.deleteMaterialById);

// Mark as Done (Admin)
router.put("/done/:id", auth, MaterialController.markAsDone);

// Make Edit Request (Admin if mistake found)
router.put("/request-edit/:id", auth, MaterialController.makeEditRequest);

// Supervisor approves edit request
router.put("/approve-edit/:id", auth, MaterialController.approveEditRequest);

// Supervisor gives final approval after edit
router.put("/final-approve/:id", auth, MaterialController.finalReviewDone);
router.put("/review/:id", auth, MaterialController.ReviewDone);
router.get("/history/:materialId", MaterialController.getMaterialHistory);



module.exports = router;
