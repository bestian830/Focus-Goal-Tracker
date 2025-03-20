const User = require("../models/User");

/**
 * Create a guest user account
 * 
 * This function:
 * 1. Generates a random username for the guest
 * 2. Creates a new user document in the database
 * 3. Returns the user information
 * 
 * The created guest account will automatically expire after 14 days
 * (as configured in the User model)
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createGuestUser = async (req, res) => {
  try {
    // Generate a random username with "guest_" prefix and random string
    const username = `guest_${Math.random().toString(36).substring(2, 10)}`;
    
    // Create a new user in the database
    const user = await User.create({
      username,
      isGuest: true,
    });

    // Return user data
    res.status(201).json({
      success: true,
      data: {
        id: user._id,
        username: user.username,
        isGuest: user.isGuest,
      },
    });
  } catch (error) {
    console.error("Error creating guest user:", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Failed to create guest user",
        details: error.message,
      },
    });
  }
};

/**
 * Get current user information by ID
 * 
 * This function:
 * 1. Finds a user by the provided ID
 * 2. Returns the user information
 * 
 * @param {Object} req - Express request object (containing userId in params)
 * @param {Object} res - Express response object
 */
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          message: "User not found",
        },
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        username: user.username,
        isGuest: user.isGuest,
      },
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Failed to fetch user information",
        details: error.message,
      },
    });
  }
};

module.exports = {
  createGuestUser,
  getCurrentUser,
}; 