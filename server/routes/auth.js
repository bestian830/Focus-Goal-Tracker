const express = require("express");
const router = express.Router();
const { createGuestUser, getCurrentUser } = require("../controllers/authController");

/**
 * Auth Routes
 * Base path: /api/auth
 * 
 * These routes handle user authentication operations:
 * - Guest user creation
 * - Retrieving user information
 */

// POST /api/auth/guest - Create a guest user account
// Used when a user clicks "Enter as Guest" button
router.post("/guest", createGuestUser);

// GET /api/auth/me/:userId - Get current user information
// Used to fetch user details after login
router.get("/me/:userId", getCurrentUser);

module.exports = router; 