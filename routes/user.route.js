const express = require("express");
const router = express.Router();

const UserController = require("../controller/user.controller"); // Ensure correct path
const authMiddleware = require("../middleware/authmiddleware");
const authorizeRole = require("../middleware/authorizeRole");

// 1. Register a new user
router.post("/register",UserController.registerUser);  // Ensure 'registerUser' is a valid function

// 2. Login existing user
router.post("/login", UserController.loginUser);  // Ensure 'loginUser' is a valid function
router.get("/checkblockedstatus",authMiddleware,UserController.checkuserblockedornot)
// 3. View all admin users (for supervisor only)
router.get("/alladmin", authMiddleware,  UserController.viewAllAdminUsers);  // Ensure 'viewalladminuserdta' is a valid function

// 4. Reset an admin user's password (for supervisor only)
router.post("/reset-password", authMiddleware, authorizeRole("supervisor"), UserController.resetAdminPassword);  // Ensure 'resetAdminPassword' is a valid function

// 5. Toggle block/unblock admin user (for supervisor only)
router.post("/toggle-block/:adminId", authMiddleware, authorizeRole("supervisor"), UserController.toggleBlockAdmin);  // Ensure 'toggleBlockUnblock' is a valid function

router.put(
  "/admin/permissions",
  authMiddleware, // must include user in req.user
  UserController.adminUpdateAndManagePermission
);
module.exports = router;
