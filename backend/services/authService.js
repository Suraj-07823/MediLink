const jwt = require('jsonwebtoken');

const createToken = (id, expiresIn = process.env.ACCESS_TOKEN_EXPIRES_IN || '1h') => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn });
};

const createRefreshToken = (userId) => {
  const refreshToken = jwt.sign(
    { userId },
    process.env.REFRESH_SECRET || process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
  return refreshToken;
};

const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.REFRESH_SECRET || process.env.JWT_SECRET);
};

const refreshCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 30 * 24 * 60 * 60 * 1000,
  path: '/'
};

module.exports = {
  createToken,
  createRefreshToken,
  verifyRefreshToken,
  refreshCookieOptions
};
// Placeholder auth service
// Business logic will live here in Phase 3

