const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
  appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  medicines: [{ name: String, dosage: String, frequency: String }],
  notes: String
}, { timestamps: true });

module.exports = mongoose.model('Prescription', prescriptionSchema);
