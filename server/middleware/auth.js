/**
 * Authentication middleware for protecting routes
 */
import { verifyToken } from '../utils/jwtUtils.js';
import User from '../models/User.js';
import TempUser from '../models/TempUser.js';

/**
 * Middleware to authenticate any user (registered or temporary)
 * Sets req.user with user information if authentication is successful
 */
const requireAuth = async (req, res, next) => {
  try {
    // Get token from cookies
    const token = req.cookies.token;
    
    // 记录认证请求信息
    console.log(`Auth check for ${req.method} ${req.originalUrl}`, {
      hasCookie: !!token,
      method: req.method,
      url: req.originalUrl,
      isGoalsAPI: req.originalUrl.includes('/api/goals')
    });
    
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
    
    // 输出token解码信息用于调试
    console.log("JWT token decoded:", {
      userType: decoded.userType,
      userId: decoded.id || 'none',
      tempId: decoded.tempId || 'none',
      exp: decoded.exp ? new Date(decoded.exp * 1000).toISOString() : 'none'
    });
    
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
        username: user.username,
        role: user.role || 'regular'
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
        userType: 'temp',
        role: 'regular'
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
 * Middleware to check if user has the required role
 * 
 * @param {String|Array} roles - Required role(s) to access the route
 */
const requireRole = (roles) => {
  return (req, res, next) => {
    requireAuth(req, res, () => {
      // Convert single role to array for consistent handling
      const requiredRoles = Array.isArray(roles) ? roles : [roles];
      
      // Check if user has one of the required roles
      if (req.user && requiredRoles.includes(req.user.role)) {
        next();
      } else {
        res.status(403).json({
          success: false,
          error: { message: 'Access denied. Insufficient permissions.' }
        });
      }
    });
  };
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
      
      // Admin users can access any resource (bypass ownership check)
      if (req.user.role === 'admin') {
        return next();
      }
      
      // Get the resource owner ID using the provided function
      const resourceUserId = await getResourceUserId(req);
      
      // 添加日志以帮助调试
      console.log("权限验证:", {
        操作: req.method + ' ' + req.originalUrl,
        认证用户类型: req.user.userType,
        认证用户ID: req.user.userType === 'registered' ? req.user.id : req.user.tempId,
        资源拥有者ID: resourceUserId,
        临时用户检测: typeof resourceUserId === 'string' && resourceUserId.startsWith('temp_')
      });
      
      // 检查是否为临时用户ID
      const isTempId = typeof resourceUserId === 'string' && resourceUserId.startsWith('temp_');
      
      // Check if the authenticated user is the owner
      if (req.user.userType === 'registered' && req.user.id.toString() === resourceUserId.toString()) {
        next();
      } else if (req.user.userType === 'temp' && req.user.tempId === resourceUserId) {
        next();
      } else if (isTempId && req.user.userType === 'temp' && req.user.tempId === resourceUserId) {
        // 添加额外检查临时用户ID的条件
        next();
      } else {
        // 日志详细的访问拒绝原因
        console.log("访问拒绝:", {
          用户类型: req.user.userType,
          用户ID: req.user.userType === 'registered' ? req.user.id : req.user.tempId,
          资源ID: resourceUserId,
          原因: "用户不是资源拥有者"
        });
        
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

export {
  requireAuth,
  requireRegisteredUser,
  requireRole,
  requireOwnership
}; 