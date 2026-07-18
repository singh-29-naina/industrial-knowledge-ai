import jwt from 'jsonwebtoken';

/**
 * Middleware to verify short-lived Access Tokens for protected routes
 */
export const authenticateJWT = (req, res, next) => {
  // Capture authorization header (format: Bearer <token>)
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      message: 'Access Denied: Missing Access Token.' 
    });
  }

  try {
    // Verify the short-lived access token using your secret key
    const decoded = jwt.verify(
      token, 
      process.env.ACCESS_TOKEN_SECRET || 'your_default_access_secret_change_me'
    );
    
    // Attach the exact payload from your generateAccessToken utility to the request object
    // Contains: req.user.userId, req.user.email, req.user.role, req.user.department
    req.user = decoded; 
    
    next();
  } catch (error) {
    // Catch expired or tampered tokens explicitly
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Access token expired. Please refresh your session.', 
        code: 'TOKEN_EXPIRED' 
      });
    }
    return res.status(403).json({ 
      message: 'Authentication failed: Invalid or altered token.' 
    });
  }
};

/**
 * Role-Based Access Control (RBAC) Guard
 * Blocks unauthorized departments or operations staff from administrative tools
 * Usage: authorizeRoles('Admin', 'Manager')
 */
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    // Ensure user payload exists and check permissions against the whitelist
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Access Denied: You do not possess the required clearance level for this action.' 
      });
    }
    next();
  };
};