const express = require("express");
const router = express.Router();
const { 
  createGuestUser, 
  getCurrentUser,
  registerUser,
  loginUser,
  // linkTempUser
} = require("../controllers/authController");

/**
 * Auth Routes
 * Base path: /api/auth
 * 
 * These routes handle user authentication operations:
 * - Guest user creation
 * - User registration (email/password)
 * - User login
 * - Retrieving user information
 * - Linking temporary user data
 */

// POST /api/auth/guest - Create a guest user account
// Used when a user clicks "Enter as Guest" button
router.post("/guest", createGuestUser);

// GET /api/auth/me/:userId - Get current user information
// Used to fetch user details after login
router.get("/me/:userId", getCurrentUser);

// POST /api/auth/register - Register a new user
// Used for email/password registration
router.post("/register", registerUser);

// POST /api/auth/login - Login with email/password
// Used for traditional login
router.post("/login", loginUser);

// // POST /api/auth/link-temp - Link temporary user data to existing user
// // Used to migrate guest data to registered account
// router.post("/link-temp", linkTempUser);

module.exports = router; 