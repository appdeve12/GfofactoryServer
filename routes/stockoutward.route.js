const express = require("express");
const router = express.Router();
const StockOutwardController = require("../controller/stockoutward.controller");
const auth = require("../middleware/authmiddleware");

// Create new stock outward entry
router.post("/create", auth, StockOutwardController.createStockOutward);

// Get all stock outward entries
router.get("/all", auth, StockOutwardController.getAllStockOutward);

// Get all stock outward entries for logged-in admin
router.get("/alladmin", auth, StockOutwardController.getAllStockperaDMINOutward);

// ✅ Update (Edit) stock outward entry
router.put("/edit/:id", auth, StockOutwardController.updateStockOutward);
router.get("/stock-outward/:id", auth, StockOutwardController.getStockOutwardById);
router.patch("/mark-done/:id", auth, StockOutwardController.markStockOutwardDone);
// Send request for edit (Only when status is 'done')
router.patch("/request-edit/:id", auth, StockOutwardController.requestEditStockOutward);

// Supervisor approves the edit request (Only when status is 'pending-approved')
router.patch("/approve-edit-request/:id", auth, StockOutwardController.requestEditStockOutwardApproved);
router.delete("/:id", auth, StockOutwardController.deleteStockOutward);
module.exports = router;
