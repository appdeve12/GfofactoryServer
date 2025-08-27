const express = require("express");
const router = express.Router();
const StockController = require("../controller/dashboardstats.controller");
const auth = require("../middleware/authmiddleware");

router.get("/autostock", auth, StockController.getAutoStockCalculation);

module.exports = router;
