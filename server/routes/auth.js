const express = require("express");
const router = express.Router();
const {
  createTempUser,
  getCurrentUser,
  registerUser,
  loginUser,
  logoutUser,
  // linkTempUser
} = require("../controllers/authController");
const { requireAuth, requireRegisteredUser } = require('../middleware/auth');

/**
 * Auth Routes
 * Base path: /api/auth
 *
 * These routes handle user authentication operations:
 * - Temporary user creation
 * - User registration (email/password)
 * - User login
 * - Retrieving user information
 * - Linking temporary user data
 */

// POST /api/auth/temp-user - Create a temporary user account
// Used when a user clicks "Enter as Guest" button
router.post("/temp-user", createTempUser);

// GET /api/auth/me/:userId - Get current user information
// Used to fetch user details after login
router.get("/me/:userId", requireRegisteredUser, getCurrentUser);

// POST /api/auth/register - Register a new user
// Used for email/password registration
router.post("/register", registerUser);

// POST /api/auth/login - Login with email/password
// Used for traditional login
router.post("/login", loginUser);

// POST /api/auth/logout - Logout user
// Used to logout the current user
router.post("/logout", logoutUser);

// // POST /api/auth/link-temp - Link temporary user data to existing user
// // Used to migrate guest data to registered account
// router.post("/link-temp", linkTempUser);

module.exports = router;
