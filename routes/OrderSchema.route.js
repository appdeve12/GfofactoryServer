const express = require("express");
const router = express.Router();
const OrderController = require("../controller/Order.controller");

// POST request to place an order
router.post("/place-order", OrderController.placeOrder);
router.get('/orders-by-material/:materialId', OrderController.getOrdersByMaterial);



module.exports = router;
