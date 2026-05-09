const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  date: { type: String, required: true },
  slot: { type: String, required: true },
  status: { type: String, enum: ['booked', 'checked_in', 'completed', 'cancelled'], default: 'booked' },
  checkInCode: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
