const express = require("express");
const router = express.Router();

const UserController = require("../controller/user.controller");
const authMiddleware=require("../middleware/authmiddleware")
const authorizeRole =require("../middleware/authorizeRole")
// 1. Register a new user
router.post("/register",authMiddleware,authorizeRole("supervisior"), UserController.registerUser);

// 2. Login existing user
router.post("/login", UserController.loginUser);
router.get("/alladmin",authMiddleware,authorizeRole("supervisior"),UserController.viewalladminuserdta)

module.exports = router;
