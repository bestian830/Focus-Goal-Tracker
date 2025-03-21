const User = require("../models/User");
const TempUser = require("../models/TempUser");
const jwt = require("jsonwebtoken");
// The JWT_SECRET should be defined in .env file
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key_for_development";

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

    // Update response to include email if it exists
    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
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

/**
 * Register a new user
 * 
 * This function:
 * 1. Validates registration data
 * 2. Checks if the email is already in use
 * 3. Creates a new user
 * 4. If a tempId is provided, migrates data from temp user
 * 5. Returns user info with JWT token
 * 
 * @param {Object} req - Express request object with registration data
 * @param {Object} res - Express response object
 */
const registerUser = async (req, res) => {
  try {
    const { username, email, password, tempId } = req.body;
    
    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        error: { message: "Please provide username, email and password" }
      });
    }
    
    // Check if email is already in use
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: { message: "Email is already in use" }
      });
    }
    
    // Create new user
    const user = await User.create({
      username,
      email,
      password,
      isGuest: false,
    });
    
    // If tempId is provided, find and migrate temp user data
    if (tempId) {
      const tempUser = await TempUser.findOne({ tempId });
      if (tempUser) {
        // Associate tempId with the new user
        user.tempId = tempId;
        await user.save();
        
        // In a real implementation, you would migrate goals and progress data here
        console.log(`Temp user data for ${tempId} will be migrated to user ${user._id}`);
        
        // Note: We're not deleting the temp user here to allow for data migration
        // The temp user will eventually be deleted by the TTL index
      }
    }
    
    // Generate JWT token
    const token = generateToken(user._id);
    
    res.status(201).json({
      success: true,
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        isGuest: user.isGuest,
        token
      }
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Failed to register user",
        details: error.message
      }
    });
  }
};

/**
 * Login user
 * 
 * This function:
 * 1. Finds a user by email
 * 2. Validates password
 * 3. Returns user info with JWT token
 * 
 * @param {Object} req - Express request object with login credentials
 * @param {Object} res - Express response object
 */
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: { message: "Please provide email and password" }
      });
    }
    
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        error: { message: "Invalid credentials" }
      });
    }
    
    // Check if user is a guest (should use regular registration)
    if (user.isGuest) {
      return res.status(400).json({
        success: false,
        error: { message: "Guest accounts cannot login. Please register." }
      });
    }
    
    // Validate password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: { message: "Invalid credentials" }
      });
    }
    
    // Generate JWT token
    const token = generateToken(user._id);
    
    // Update last login time
    user.lastLogin = Date.now();
    await user.save();
    
    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        isGuest: user.isGuest,
        token
      }
    });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Failed to login",
        details: error.message
      }
    });
  }
};

/**
 * Link temporary user data to existing user
 * 
 * This function:
 * 1. Finds existing user and temp user
 * 2. Associates tempId with user
 * 3. Returns success message
 * 
 * @param {Object} req - Express request object with userId and tempId
 * @param {Object} res - Express response object
 */
const linkTempUser = async (req, res) => {
  try {
    const { userId, tempId } = req.body;
    
    // Validate input
    if (!userId || !tempId) {
      return res.status(400).json({
        success: false,
        error: { message: "Please provide userId and tempId" }
      });
    }
    
    // Find user and temp user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: "User not found" }
      });
    }
    
    const tempUser = await TempUser.findOne({ tempId });
    if (!tempUser) {
      return res.status(404).json({
        success: false,
        error: { message: "Temporary user not found" }
      });
    }
    
    // Associate tempId with user for later data migration
    user.tempId = tempId;
    await user.save();
    
    // In a real implementation, you would migrate goals and progress data here
    
    res.status(200).json({
      success: true,
      data: {
        message: "Temporary user data has been linked to your account",
        userId: user._id
      }
    });
  } catch (error) {
    console.error("Error linking temp user:", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Failed to link temporary user data",
        details: error.message
      }
    });
  }
};

/**
 * Generate JWT token for a user
 * 
 * @param {String} userId - User ID to include in token payload
 * @returns {String} JWT token
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '30d' });
};

module.exports = {
  createGuestUser,
  getCurrentUser,
  registerUser,
  loginUser,
  linkTempUser
}; 