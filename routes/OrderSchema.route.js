const express = require("express");
const router = express.Router();
const OrderSchema=require("../controller/Order.controller")

// POST request to place an order
router.post("/place-order", OrderSchema.placeOrder);

router.get("/material/:materialId", OrderSchema.getOrdersByMaterial);

module.exports = router;
