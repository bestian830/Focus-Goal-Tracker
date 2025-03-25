/* Description: Controller for user authentication and registration.
 * createTempUser: Create a temporary user account, when a user clicks "Continue as Guest" it creates
   - should use local storage to store the temp user ID if visited then no need to create a new temp user
 * getCurrentUser: Get current user information by ID, when a user logs in or registers
 * registerUser: Register a new user, when a user signs up, 
   - and if a tempId is provided when they click register or google oauth, migrate data from temp user
 * loginUser: Login user, when a user logs in
 * logoutUser: Logout user, when a user logs out
*/

import User from "../models/User.js";
import TempUser from "../models/TempUser.js";
import {
  generateUserToken,
  setTokenCookie,
  clearTokenCookie,
} from "../utils/jwtUtils.js";
// The JWT_SECRET should be defined in .env file
const JWT_SECRET =
  process.env.JWT_SECRET || "your_jwt_secret_key_for_development";

/**
 * Create a temporary user account
 *
 * This function:
 * 1. Generates a random tempId for the temporary user
 * 2. Creates a new temp user document in the database
 * 3. Returns the temp user information
 *
 * The created temp user will automatically expire after 21 days
 * (as configured in the TempUser model)
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createTempUser = async (req, res) => {
  try {
    // Generate a random tempId with "temp_" prefix and random string
    const tempId = `temp_${Math.random().toString(36).substring(2, 10)}`;

    // Create a new temp user in the database
    const tempUser = await TempUser.create({
      tempId,
    });

    // Return temp user data
    res.status(201).json({
      success: true,
      data: {
        tempId: tempUser.tempId,
        createdAt: tempUser.createdAt,
        expiresAt: tempUser.expiresAt,
      },
    });
  } catch (error) {
    console.error("Error creating temporary user:", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Failed to create temporary user",
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
    // Check if the user is a registered or temporary user
    if (req.user.userType === "registered") {
      // Registered user: find user by ID
      const user = await User.findById(req.params.userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: {
            message: "User not found",
          },
        });
      }

      // Return user information
      return res.status(200).json({
        success: true,
        data: {
          id: user._id,
          username: user.username,
          email: user.email,
        },
      });
    } else if (req.user.userType === "temp") {
      // Temporary user: return guest user information
      return res.status(200).json({
        success: true,
        data: {
          id: req.user.tempId,
          username: "Guest User",
          isGuest: true,
        },
      });
    } else {
      // Invalid user type
      return res.status(400).json({
        success: false,
        error: {
          message: "Invalid user type",
        },
      });
    }
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
        error: { message: "Please provide username, email and password" },
      });
    }

    // Check if email is already in use
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: { message: "Email is already in use" },
      });
    }

    // Create new user
    const user = await User.create({
      username,
      email,
      password,
    });

    // If tempId is provided, find and migrate temp user data
    if (tempId) {
      const tempUser = await TempUser.findOne({ tempId });
      if (tempUser) {
        // Associate tempId with the new user
        user.tempId = tempId;
        await user.save();

        // In a real implementation, you would migrate goals and progress data here
        console.log(
          `Temp user data for ${tempId} will be migrated to user ${user._id}`
        );

        // 成功迁移后删除临时用户
        await TempUser.findOneAndDelete({ tempId });
        console.log(`Temp user ${tempId} has been deleted after migration`);
      }
    }

    // Generate JWT token
    const token = generateUserToken(user._id);

    // Set JWT token as HttpOnly cookie
    setTokenCookie(res, token, 30 * 24 * 60 * 60 * 1000); // 30 days

    res.status(201).json({
      success: true,
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Failed to register user",
        details: error.message,
      },
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
        error: { message: "Please provide email and password" },
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        error: { message: "Invalid credentials" },
      });
    }

    // Check if password is correct
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: { message: "Invalid credentials" },
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = generateUserToken(user._id);

    // Set JWT token as HttpOnly cookie
    setTokenCookie(res, token, 30 * 24 * 60 * 60 * 1000); // 30 days

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Failed to login",
        details: error.message,
      },
    });
  }
};

/**
 * Logout user
 *
 * This function:
 * 1. Clears the JWT token cookie
 * 2. Returns a success message
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const logoutUser = (req, res) => {
  try {
    // Clear the JWT token cookie
    clearTokenCookie(res);

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Error logging out:", error);
    res.status(500).json({
      success: false,
      error: {
        message: "Failed to logout",
        details: error.message,
      },
    });
  }
};

// Export controller functions
export {
  createTempUser,
  getCurrentUser,
  registerUser,
  loginUser,
  logoutUser,
};
