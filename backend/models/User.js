const mongoose = require('mongoose');

// User schema covers Patients, Doctors, and Admin
// Each user has a 'role' field to determine their permissions
const userSchema = new mongoose.Schema({
  // Basic info required for all users
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true 
  },
  phone: { 
    type: String, 
    required: true 
  },
  password: { 
    type: String, 
    required: true 
    // Will be bcrypt hashed before saving
  },
  
  // Role-based access: 'patient' | 'doctor' | 'admin'
  role: { 
    type: String, 
    enum: ['patient', 'doctor', 'admin'], 
    default: 'patient' 
  },

  // Patient-specific fields
  dateOfBirth: { 
    type: Date 
  },
  gender: { 
    type: String, 
    enum: ['male', 'female', 'other'] 
  },
  bloodGroup: { 
    type: String, 
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] 
  },
  address: {
    area: String,
    city: { type: String, default: 'Nagpur' },
    pincode: String,
    state: String
  },
  profilePhoto: { 
    type: String 
    // URL to photo (stored in cloud)
  },

  // Patient-specific fields (keep only patient fields here).
  // Doctor-specific profile data lives in backend/models/Doctor.js

  // Account verification & security
  isVerified: { 
    type: Boolean, 
    default: false 
    // email verified flag
  },
  isActive: { 
    type: Boolean, 
    default: true 
    // account active or suspended
  },
  failedLoginCount: {
    type: Number,
    default: 0
  },
  lockedUntil: {
    type: Date
  }
  ,
  // Used to revoke previously issued access tokens: tokens issued before this timestamp are invalid
  tokenInvalidBefore: {
    type: Date
  },
  verificationToken: {
    type: String
  },
  verificationTokenExpiry: {
    type: Date
  }
}, { timestamps: true });

// Index for fast queries
userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });
userSchema.index({ role: 1 });

module.exports = mongoose.model('User', userSchema);
