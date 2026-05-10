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

  // Doctor-specific fields
  speciality: { 
    type: String 
    // "Cardiology", "ENT", "Dermatology", etc.
  },
  qualification: { 
    type: String 
    // "MBBS", "MD", "MS", etc.
  },
  experience: { 
    type: Number 
    // years of experience
  },
  regNumber: { 
    type: String 
    // medical council registration number
  },
  consultationFee: { 
    type: Number 
    // in rupees ₹
  },
  clinicName: { 
    type: String 
  },
  clinicAddress: {
    area: String,
    city: { type: String, default: 'Nagpur' },
    pincode: String
  },
  about: { 
    type: String 
    // doctor bio/introduction
  },
  documents: [
    {
      name: String, // "degree", "registration", etc.
      url: String   // uploaded file URL
    }
  ],
  doctorStatus: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
    // admin must approve before doctor can accept patients
  },
  rejectionReason: { 
    type: String 
    // reason if rejected by admin
  },
  avgRating: { 
    type: Number, 
    default: 0 
  },
  totalReviews: { 
    type: Number, 
    default: 0 
  },

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

  // Timestamps
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
}, { timestamps: true });

// Index for fast queries
userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });
userSchema.index({ role: 1 });

module.exports = mongoose.model('User', userSchema);
