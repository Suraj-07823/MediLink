const mongoose = require('mongoose');

// Doctor model stores extended doctor profile information
// Links to User model via userId
const doctorSchema = new mongoose.Schema({
  // Reference to User document
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },

  // Professional details
  speciality: { 
    type: String, 
    required: true 
    // "Cardiology", "ENT", "Dermatology", etc.
  },
  qualification: { 
    type: String, 
    required: true 
    // "MBBS", "MD", "MS", etc.
  },
  experience: { 
    type: Number, 
    required: true 
    // years of experience
  },
  regNumber: { 
    type: String, 
    required: true, 
    unique: true 
    // medical council registration number
  },

  // Consultation & Clinic
  consultationFee: { 
    type: Number, 
    required: true 
    // in rupees ₹
  },
  clinicName: { 
    type: String, 
    required: true 
  },
  clinicAddress: {
    area: String,
    city: { type: String, default: 'Nagpur' },
    pincode: String
  },

  // GPS location for nearby search
  location: {
    type: { 
      type: String, 
      enum: ['Point'], 
      default: 'Point' 
    },
    coordinates: {
      type: [Number], 
      // [longitude, latitude] format for MongoDB geospatial queries
      index: '2dsphere'
    }
  },

  // Doctor bio
  about: { 
    type: String 
  },

  // Document uploads (stored as URLs)
  documents: [
    {
      name: String, // "degree", "registration", "certificate"
      url: String   // file URL (from S3 or cloud storage)
    }
  ],

  // Admin approval status
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
    // doctor profile under review by admin
  },
  rejectionReason: { 
    type: String 
    // reason if rejected
  },

  // Ratings (calculated from patient reviews)
  avgRating: { 
    type: Number, 
    default: 0 
  },
  totalReviews: { 
    type: Number, 
    default: 0 
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

// Create geospatial index for GPS-based search
doctorSchema.index({ 'location.coordinates': '2dsphere' });
doctorSchema.index({ speciality: 1, status: 1 });
doctorSchema.index({ userId: 1 });

module.exports = mongoose.model('Doctor', doctorSchema);
