const mongoose = require('mongoose');

// Appointment model stores booking information
const appointmentSchema = new mongoose.Schema({
  // Patient booking
  patientId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },

  // Doctor being visited
  doctorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Doctor', 
    required: true 
  },

  // Appointment details
  date: { 
    type: Date, 
    required: true 
  },
  timeSlot: { 
    type: String, 
    required: true 
    // "09:00"
  },
  symptoms: { 
    type: String 
    // patient's complaint/reason for visit
  },

  // Status tracking
  status: { 
    type: String, 
    enum: ['booked', 'checked-in', 'completed', 'cancelled'],
    default: 'booked' 
  },

  // Payment/Fees
  fee: { 
    type: Number, 
    required: true 
    // consultation fee in rupees ₹ (captured at booking time)
  },

  // QR Code & OTP for check-in
  qrCode: { 
    type: String 
    // base64 encoded QR image data
  },
  otp: { 
    type: String 
    // 6-digit one-time password
  },
  otpExpiry: { 
    type: Date 
    // OTP valid for 24 hours from booking
  },

  // Check-in tracking
  checkedInAt: { 
    type: Date 
    // timestamp when patient checked in (receptionist scanned QR)
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

appointmentSchema.index({ patientId: 1, date: -1 });
appointmentSchema.index({ doctorId: 1, date: -1 });
appointmentSchema.index({ status: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
