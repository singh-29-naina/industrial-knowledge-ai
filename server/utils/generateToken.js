import jwt from "jsonwebtoken";

/**
 * Generate Access Token
 * Short-lived token used to access protected APIs
 */
export const generateAccessToken = (user) => {
  return jwt.sign(
    {
      userId: user._id,
      email: user.email,
      role: user.role,
    },
    process.env.ACCESS_TOKEN_SECRET || 'your_default_access_secret_change_me',
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRE || '15m',
    }
  );
};

/**
 * Generate Refresh Token
 * Long-lived token used to generate a new Access Token
 */
export const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      userId: user._id,
    },
    process.env.REFRESH_TOKEN_SECRET || 'your_default_refresh_secret_change_me',
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRE || '7d',
    }
  );
};