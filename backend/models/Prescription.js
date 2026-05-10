const mongoose = require('mongoose');

// Prescription model stores doctor's digital prescriptions
const prescriptionSchema = new mongoose.Schema({
  // Link to appointment
  appointmentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Appointment', 
    required: true 
  },

  // Patient receiving prescription
  patientId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },

  // Doctor writing prescription
  doctorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Doctor', 
    required: true 
  },

  // Diagnosis
  diagnosis: { 
    type: String, 
    required: true 
    // doctor's clinical diagnosis
  },

  // Medicines prescribed
  medicines: [
    {
      name: String,          // "Aspirin", "Antibiotics"
      dosage: String,        // "500mg"
      frequency: String,     // "twice a day"
      duration: String,      // "7 days"
      instructions: String   // "after meals", "with water"
    }
  ],

  // Doctor's notes
  notes: { 
    type: String 
    // additional advice, lifestyle changes, etc.
  },

  // Follow-up
  followUpDate: { 
    type: Date 
    // when patient should return for follow-up
  },

  // Timestamps
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
}, { timestamps: true });

prescriptionSchema.index({ patientId: 1, createdAt: -1 });
prescriptionSchema.index({ appointmentId: 1 });

module.exports = mongoose.model('Prescription', prescriptionSchema);
