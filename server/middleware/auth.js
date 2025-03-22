/**
 * Authentication middleware for protecting routes
 */
const { verifyToken } = require('../utils/jwtUtils');
const User = require('../models/User');
const TempUser = require('../models/TempUser');

/**
 * Middleware to authenticate any user (registered or temporary)
 * Sets req.user with user information if authentication is successful
 */
const requireAuth = async (req, res, next) => {
  try {
    // Get token from cookies
    const token = req.cookies.token;
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: { message: 'Authentication required. Please log in.' }
      });
    }
    
    // Verify token
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({
        success: false,
        error: { message: 'Invalid or expired token. Please log in again.' }
      });
    }
    
    // Check user type and set req.user accordingly
    if (decoded.userType === 'registered') {
      // For registered users, fetch from database to ensure they still exist
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return res.status(401).json({
          success: false,
          error: { message: 'User not found. Please log in again.' }
        });
      }
      
      req.user = {
        id: user._id,
        userType: 'registered',
        // Add other user data as needed
        email: user.email,
        username: user.username
      };
    } else if (decoded.userType === 'temp') {
      // For temporary users, check if they exist
      const tempUser = await TempUser.findOne({ tempId: decoded.tempId });
      
      if (!tempUser) {
        return res.status(401).json({
          success: false,
          error: { message: 'Temporary user not found or expired. Please create a new session.' }
        });
      }
      
      req.user = {
        tempId: decoded.tempId,
        userType: 'temp'
      };
    } else {
      return res.status(401).json({
        success: false,
        error: { message: 'Invalid user type in token.' }
      });
    }
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Authentication error', details: error.message }
    });
  }
};

/**
 * Middleware to authenticate registered users only
 */
const requireRegisteredUser = (req, res, next) => {
  requireAuth(req, res, () => {
    // Check if the user is a registered user
    if (req.user && req.user.userType === 'registered') {
      next();
    } else {
      res.status(403).json({
        success: false,
        error: { message: 'Access denied. Registered users only.' }
      });
    }
  });
};

/**
 * Middleware to ensure a user can only access their own data
 * Should be used after requireAuth
 * 
 * @param {Function} getResourceUserId - Function to extract owner ID from request
 */
const requireOwnership = (getResourceUserId) => {
  return async (req, res, next) => {
    try {
      // First ensure the user is authenticated
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: { message: 'Authentication required.' }
        });
      }
      
      // Get the resource owner ID using the provided function
      const resourceUserId = await getResourceUserId(req);
      
      // Check if the authenticated user is the owner
      if (req.user.userType === 'registered' && req.user.id.toString() === resourceUserId.toString()) {
        next();
      } else if (req.user.userType === 'temp' && req.user.tempId === resourceUserId) {
        next();
      } else {
        res.status(403).json({
          success: false,
          error: { message: 'Access denied. You can only access your own data.' }
        });
      }
    } catch (error) {
      console.error('Ownership verification error:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Error verifying resource ownership', details: error.message }
      });
    }
  };
};

module.exports = {
  requireAuth,
  requireRegisteredUser,
  requireOwnership
}; 