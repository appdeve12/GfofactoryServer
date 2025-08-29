const express = require("express");
const router = express.Router();
const MaterialNameController = require("../controller/materialname.controller");
const auth = require("../middleware/authmiddleware");
router.get("/all", auth,MaterialNameController.getAllMaterials);
router.get("/:id",auth, MaterialNameController.getMaterialById);
router.post("/create",auth, MaterialNameController.createMaterial);
router.put("/:id",auth, MaterialNameController.updateMaterial);
router.delete("/:id",auth, MaterialNameController.deleteMaterial);

module.exports = router;