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
const { rateLimiter } = require('../middleware/rateLimiter');

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

// Apply rate limiter to all auth routes
router.use(rateLimiter({ maxRequests: 100, windowMs: 15 * 60 * 1000 }));

// Apply stricter rate limits for sensitive operations
const authLimiter = rateLimiter({ maxRequests: 35, windowMs: 15 * 60 * 1000 });

// POST /api/auth/temp-user - Create a temporary user account
// Used when a user clicks "Enter as Guest" button
router.post("/temp-user", createTempUser);

// GET /api/auth/me/:userId - Get current user information
// Used to fetch user details after login
router.get("/me/:userId", requireAuth, getCurrentUser);

// POST /api/auth/register - Register a new user
// Used for email/password registration
router.post("/register", authLimiter, registerUser);

// POST /api/auth/login - Login with email/password
// Used for traditional login
router.post("/login", authLimiter, loginUser);

// POST /api/auth/logout - Logout user
// Used to logout the current user
router.post("/logout", requireAuth, logoutUser);

// // POST /api/auth/link-temp - Link temporary user data to existing user
// // Used to migrate guest data to registered account
// router.post("/link-temp", linkTempUser);

module.exports = router;
