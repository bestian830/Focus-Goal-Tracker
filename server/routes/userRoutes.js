const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { requireAuth, requireRegisteredUser } = require('../middleware/auth');
const { rateLimiter } = require('../middleware/rateLimiter');

/**
 * User Routes
 * Base path: /api/users
 * 
 * These routes handle user profile operations:
 * - Get user profile
 * - Update user profile
 * - Delete user account
 */

// Apply rate limiter to all user routes
router.use(rateLimiter({ maxRequests: 100, windowMs: 15 * 60 * 1000 }));

/**
 * @route   GET /api/users/profile
 * @desc    Get user profile information
 * @access  Private (registered users only)
 */
router.get("/profile", requireRegisteredUser, async (req, res) => {
  try {
    // Get user from database (excluding password)
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: "User not found" }
      });
    }
    
    // Return user data
    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        email: user.email,
        username: user.username,
        role: user.role,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({
      success: false,
      error: { message: "Server error", details: error.message }
    });
  }
});

/**
 * @route   PUT /api/users/profile
 * @desc    Update user profile information
 * @access  Private (registered users only)
 */
router.put("/profile", requireRegisteredUser, async (req, res) => {
  try {
    const { username, email } = req.body;
    
    // Build update object
    const updateFields = {};
    if (username) updateFields.username = username;
    if (email) updateFields.email = email.toLowerCase();
    
    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateFields },
      { new: true }
    ).select('-password');
    
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        error: { message: "User not found" }
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        id: updatedUser._id,
        email: updatedUser.email,
        username: updatedUser.username,
        role: updatedUser.role,
        createdAt: updatedUser.createdAt,
        lastLogin: updatedUser.lastLogin
      },
      message: "Profile updated successfully"
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    
    // Check for duplicate email error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: { message: "Email already in use" }
      });
    }
    
    res.status(500).json({
      success: false,
      error: { message: "Server error", details: error.message }
    });
  }
});

/**
 * @route   DELETE /api/users/account
 * @desc    Delete user account
 * @access  Private (registered users only)
 */
router.delete("/account", requireRegisteredUser, async (req, res) => {
  try {
    // Delete user from database
    const deletedUser = await User.findByIdAndDelete(req.user.id);
    
    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        error: { message: "User not found" }
      });
    }
    
    // Clear authentication cookie
    res.clearCookie('token');
    
    res.status(200).json({
      success: true,
      message: "Account deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting user account:", error);
    res.status(500).json({
      success: false,
      error: { message: "Server error", details: error.message }
    });
  }
});

/**
 * @route   PUT /api/users/password
 * @desc    Change user password
 * @access  Private (registered users only)
 */
router.put("/password", requireRegisteredUser, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: { message: "Current password and new password are required" }
      });
    }
    
    // Get user with password
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: "User not found" }
      });
    }
    
    // Check if current password is correct
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        error: { message: "Current password is incorrect" }
      });
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    res.status(200).json({
      success: true,
      message: "Password updated successfully"
    });
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).json({
      success: false,
      error: { message: "Server error", details: error.message }
    });
  }
});

module.exports = router; 