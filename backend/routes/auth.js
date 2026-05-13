const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const RefreshToken = require('../models/RefreshToken');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Helper function to generate JWT token
// Takes user ID and returns a signed JWT valid for 1 hour
const createToken = (id) => {
  return jwt.sign(
    { id }, 
    process.env.JWT_SECRET, 
    { expiresIn: '1h' }
  );
};

// Helper function to generate refresh token
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

// Rate limiter for login attempts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per windowMs
  message: 'Too many login attempts from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// ========== REGISTER ==========
// POST /api/auth/register
// Body: { name, email, phone, password, role, ...roleSpecificFields }
// Returns: { token, user }
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password, role, dateOfBirth, gender, bloodGroup, address } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !password || !role) {
      return res.status(400).json({ 
        message: 'Please provide: name, email, phone, password, role' 
      });
    }

    // Validate role - only patient and admin can register here
    if (!['patient', 'admin'].includes(role)) {
      return res.status(400).json({ 
        message: 'Invalid role. Use /register-doctor for doctor registration.' 
      });
    }

    // Check if user already exists with this email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ 
        message: 'Email already registered. Please use another email or login.' 
      });
    }

    // Hash password with bcryptjs (10 salt rounds = high security)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user document
    const newUser = new User({
      name,
      email,
      phone,
      password: hashedPassword,
      role,
      dateOfBirth,
      gender,
      bloodGroup,
      address
    });

    // Save user to database
    await newUser.save();

    // Generate JWT token
    const token = createToken(newUser._id);

    // Return token and user info (NOT password)
    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        phone: newUser.phone
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      message: 'Registration failed', 
      error: error.message 
    });
  }
});

// ========== DOCTOR REGISTRATION ==========
// POST /api/auth/register-doctor
// Body: { name, email, phone, password, speciality, qualification, experience, regNumber, consultationFee, clinicName, clinicAddress, about }
// Returns: { token, user, doctorProfile }
router.post('/register-doctor', async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { 
      name, email, phone, password, 
      speciality, qualification, experience, regNumber, 
      consultationFee, clinicName, clinicAddress, about 
    } = req.body;

    // Validate required doctor fields
    if (!name || !email || !phone || !password || !speciality || !qualification || !regNumber) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ 
        message: 'Missing required doctor fields' 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email }).session(session);
    if (existingUser) {
      await session.abortTransaction();
      session.endSession();
      return res.status(409).json({ 
        message: 'Email already registered' 
      });
    }

    // Check if registration number already used
    const existingDoctor = await Doctor.findOne({ regNumber }).session(session);
    if (existingDoctor) {
      await session.abortTransaction();
      session.endSession();
      return res.status(409).json({ 
        message: 'Medical registration number already registered' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with 'doctor' role
    const newUser = new User({
      name,
      email,
      phone,
      password: hashedPassword,
      role: 'doctor',
      speciality,
      qualification,
      experience,
      regNumber,
      consultationFee,
      clinicName,
      clinicAddress,
      about
    });

    await newUser.save({ session });

    // Create doctor profile (linked to user)
    const doctorProfile = new Doctor({
      userId: newUser._id,
      speciality,
      qualification,
      experience,
      regNumber,
      consultationFee,
      clinicName,
      clinicAddress,
      about,
      status: 'pending'  // awaiting admin approval
    });

    await doctorProfile.save({ session });

    // Commit transaction
    await session.commitTransaction();
    session.endSession();

    // Generate token
    const token = createToken(newUser._id);

    res.status(201).json({
      message: 'Doctor registration successful. Awaiting admin approval.',
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        doctorStatus: doctorProfile.status
      }
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Doctor registration error:', error);
    res.status(500).json({ 
      message: 'Doctor registration failed', 
      error: error.message 
    });
  }
});

// ========== LOGIN ==========
// POST /api/auth/login
// Body: { email, password }
// Returns: { token, user } (works for all roles: patient, doctor, admin)
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate inputs
    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Please provide email and password' 
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ 
        message: 'Invalid email or password' 
      });
    }

    // Check if account is locked
    if (user.lockedUntil && user.lockedUntil > Date.now()) {
      return res.status(423).json({
        message: 'Account is temporarily locked due to too many failed login attempts. Try again later.'
      });
    }

    // Compare provided password with stored hashed password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      // Increment failed login count
      user.failedLoginCount += 1;
      if (user.failedLoginCount >= 5) {
        user.lockedUntil = Date.now() + 15 * 60 * 1000; // 15 minutes
      }
      await user.save();
      return res.status(401).json({ 
        message: 'Invalid email or password' 
      });
    }

    // Reset failed login count on success
    user.failedLoginCount = 0;
    user.lockedUntil = undefined;
    await user.save();

    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({ 
        message: 'Your account has been suspended. Contact support.' 
      });
    }

    // Generate JWT token
    const token = createToken(user._id);

    // Generate and store refresh token
    const refreshToken = createRefreshToken(user._id);
    await RefreshToken.create({
      token: refreshToken,
      userId: user._id,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    });

    // Set refresh token cookie for secure session renewal
    res.cookie('refreshToken', refreshToken, refreshCookieOptions);

    // Get doctor status if user is a doctor
    let doctorStatus = null;
    if (user.role === 'doctor') {
      const doctorProfile = await Doctor.findOne({ userId: user._id });
      doctorStatus = doctorProfile?.status || 'pending';
    }

    // Return token and user info
    res.status(200).json({
      message: 'Login successful',
      token,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        doctorStatus: doctorStatus
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'Login failed', 
      error: error.message 
    });
  }
});

// ========== REFRESH TOKEN ==========
// POST /api/auth/refresh
// Body: { refreshToken }
// Returns: { token }
router.post('/refresh', async (req, res) => {
  try {
    const incomingRefreshToken = req.body.refreshToken || req.cookies?.refreshToken;
    if (!incomingRefreshToken) {
      return res.status(400).json({ message: 'Refresh token required' });
    }

    // Verify refresh token and stored record
    const decoded = verifyRefreshToken(incomingRefreshToken);
    const storedToken = await RefreshToken.findOne({ token: incomingRefreshToken, userId: decoded.userId });
    if (!storedToken) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    // Rotate refresh token
    await RefreshToken.findOneAndDelete({ token: incomingRefreshToken });
    const newRefreshToken = createRefreshToken(decoded.userId);
    await RefreshToken.create({
      token: newRefreshToken,
      userId: decoded.userId,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });

    // Set the new refresh token cookie
    res.cookie('refreshToken', newRefreshToken, refreshCookieOptions);

    // Generate new access token
    const newToken = createToken(decoded.userId);

    res.status(200).json({
      message: 'Token refreshed',
      token: newToken,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    console.error('Refresh error:', error);
    res.status(401).json({ message: 'Invalid refresh token' });
  }
});

// ========== GET CURRENT USER ==========
// GET /api/auth/me
// Protected route that returns the current authenticated user
router.get('/me', protect, async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(404).json({
        message: 'Authenticated user not found'
      });
    }

    let doctorStatus = null;
    if (user.role === 'doctor') {
      const doctorProfile = await Doctor.findOne({ userId: user._id });
      doctorStatus = doctorProfile?.status || 'pending';
    }

    res.status(200).json({
      message: 'Current user retrieved successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        isVerified: user.isVerified,
        isActive: user.isActive,
        doctorStatus: doctorStatus
      }
    });
  } catch (error) {
    console.error('Fetch current user error:', error);
    res.status(500).json({
      message: 'Unable to retrieve current user',
      error: error.message
    });
  }
});

// ========== LOGOUT ==========
// POST /api/auth/logout
// Body: { refreshToken }
// Blacklists the refresh token
router.post('/logout', async (req, res) => {
  try {
    const incomingRefreshToken = req.body.refreshToken || req.cookies?.refreshToken;
    if (incomingRefreshToken) {
      await RefreshToken.findOneAndDelete({ token: incomingRefreshToken });
    }

    res.clearCookie('refreshToken', refreshCookieOptions);
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Logout failed' });
  }
});

module.exports = router;
