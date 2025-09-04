const express = require("express");
const router = express.Router();
const StockOutwardController = require("../controller/stockoutward.controller");
const auth = require("../middleware/authmiddleware");

// Create new stock outward entry (Stock Out / Consumption)
router.post("/create", auth, StockOutwardController.createStockOutward);

// Get all stock outward entries
router.get("/all", auth, StockOutwardController.getAllStockOutward);
router.get("/alladmin", auth, StockOutwardController.getAllStockperaDMINOutward);


module.exports = router;
