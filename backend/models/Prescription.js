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
      name: { type: String, required: true },
      dosage: { type: String, required: true },
      frequency: { type: String, required: true },
      duration: String,
      instructions: String
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
  }
}, { timestamps: true });

prescriptionSchema.index({ patientId: 1, createdAt: -1 });
prescriptionSchema.index({ appointmentId: 1 });

module.exports = mongoose.model('Prescription', prescriptionSchema);
