const express = require("express");
const router = express.Router();
const OrderController = require("../controller/Order.controller");
const auth = require("../middleware/authmiddleware");
// POST request to place an order
router.post("/place-order",auth, OrderController.placeOrder);
router.get('/orders-by-material/:materialId',auth, OrderController.getOrdersByMaterial);

router.get("/my-orders",auth, OrderController.getOrdersByMyMaterials);


module.exports = router;
