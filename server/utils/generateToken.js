import jwt from "jsonwebtoken";

export const generateAccessToken = (user, sessionMinutesOverride) => {
  const expiresIn = sessionMinutesOverride
    ? `${sessionMinutesOverride}m`
    : (process.env.ACCESS_TOKEN_EXPIRE || '15m');

  return jwt.sign(
    {
      userId: user._id,
      email: user.email,
      role: user.role,
    },
    process.env.ACCESS_TOKEN_SECRET || 'your_default_access_secret_change_me',
    { expiresIn }
  );
};

export const generateRefreshToken = (user) => {
  return jwt.sign(
    { userId: user._id },
    process.env.REFRESH_TOKEN_SECRET || 'your_default_refresh_secret_change_me',
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRE || '7d' }
  );
};