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
    required: true,
    match: [/^([01]\d|2[0-3]):[0-5]\d$/, 'Time slot must be in HH:MM format (24-hour)']
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
    required: true,
    min: [0, 'Fee must be greater than or equal to 0']
    // consultation fee in rupees ₹ (captured at booking time)
  },

  // OTP for check-in (QR generated on-demand, not stored)
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
  }
}, { timestamps: true });

appointmentSchema.index({ patientId: 1, date: -1 });
appointmentSchema.index({ doctorId: 1, date: -1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ otp: 1, otpExpiry: 1 });
// Prevent double-booking: unique combination of doctor, date, and timeSlot for active appointments only
appointmentSchema.index({ doctorId: 1, date: 1, timeSlot: 1 }, { unique: true, partialFilterExpression: { status: { $ne: 'cancelled' } } });

module.exports = mongoose.model('Appointment', appointmentSchema);
