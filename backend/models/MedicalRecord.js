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
    phone: {
      type: String,
      match: [/^[6-9]\d{9}$/, 'Phone number must be a 10-digit Indian number starting with 6-9']
    },         // normalized 10-digit Indian phone number
    relation: String       // "Mother", "Brother", "Spouse"
  },

}, { timestamps: true });

// Normalize phone number before saving
medicalRecordSchema.pre('save', function(next) {
  if (this.emergencyContact && this.emergencyContact.phone) {
    const digits = this.emergencyContact.phone.replace(/\D/g, '');
    this.emergencyContact.phone = digits.slice(-10);
  }
  next();
});

medicalRecordSchema.index({ patientId: 1 });

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);
