const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const authController = require("../controllers/authController");
const { verifyToken } = require("../middleware/authMiddleware");

// Route to get all users
router.get("/users", verifyToken, adminController.getUsers);

// Route to update user role
router.put("/users/:id/role", verifyToken, adminController.updateRole);

// Admin creates a new user
router.post("/users", verifyToken, authController.adminCreateUser);

// Admin deletes a user
router.delete("/users/:id", verifyToken, authController.deleteUser);

// Admin updates user settings
router.put("/users/:id", verifyToken, authController.adminUpdateUser);

// IMPORTANT: Export the router
module.exports = router;
