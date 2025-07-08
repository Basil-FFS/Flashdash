const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// Signup disabled - only admins can create users
// router.post("/signup", authController.signup);
router.post("/login", authController.login);

// Add this route for getting current user info from token
router.get("/me", authController.me);

module.exports = router;