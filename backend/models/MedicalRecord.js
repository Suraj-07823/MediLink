const mongoose = require('mongoose');

// MedicalRecord model stores patient's medical history
// Each patient has ONE medical record (one-to-one relationship)
const medicalRecordSchema = new mongoose.Schema({
  // Patient reference
  patientId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    unique: true
    // each patient has only ONE medical record
  },

  // Health conditions
  allergies: [String],
  // e.g., ["Penicillin", "Shellfish", "Peanuts"]

  chronicDiseases: [String],
  // e.g., ["Diabetes", "Hypertension", "Asthma"]

  pastSurgeries: [String],
  // e.g., ["Appendectomy 2020", "Cataract Surgery 2022"]

  currentMedicines: [String],
  // e.g., ["Metformin 500mg daily", "Lisinopril 10mg"]

  // Emergency contact
  emergencyContact: {
    name: String,
    phone: String,         // 10-digit Indian phone
    relation: String       // "Mother", "Brother", "Spouse"
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

medicalRecordSchema.index({ patientId: 1 });

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);
