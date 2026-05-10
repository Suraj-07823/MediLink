const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Doctor = require('../models/Doctor');

const router = express.Router();

// Helper function to generate JWT token
// Takes user ID and returns a signed JWT valid for 12 hours
const createToken = (id) => {
  return jwt.sign(
    { id }, 
    process.env.JWT_SECRET, 
    { expiresIn: '12h' }
  );
};

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
  try {
    const { 
      name, email, phone, password, 
      speciality, qualification, experience, regNumber, 
      consultationFee, clinicName, clinicAddress, about 
    } = req.body;

    // Validate required doctor fields
    if (!name || !email || !phone || !password || !speciality || !qualification || !regNumber) {
      return res.status(400).json({ 
        message: 'Missing required doctor fields' 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ 
        message: 'Email already registered' 
      });
    }

    // Check if registration number already used
    const existingDoctor = await Doctor.findOne({ regNumber });
    if (existingDoctor) {
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

    await newUser.save();

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

    await doctorProfile.save();

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
router.post('/login', async (req, res) => {
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

    // Compare provided password with stored hashed password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ 
        message: 'Invalid email or password' 
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({ 
        message: 'Your account has been suspended. Contact support.' 
      });
    }

    // Generate JWT token
    const token = createToken(user._id);

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

module.exports = router;
