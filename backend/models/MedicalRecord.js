const mongoose = require('mongoose');

// MedicalRecord model stores patient's medical history
// Each patient has ONE medical record (one-to-one relationship)
// Utility: normalize phone numbers to digits; preserve Indian country code 91 when present
function normalizePhone(phone) {
  if (!phone) return phone;
  const digits = String(phone).replace(/\D/g, '');
  const last10 = digits.slice(-10);
  if (digits.length === 10) return last10;
  if (digits.length > 10 && digits.startsWith('91')) return '91' + last10;
  return last10;
}
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
      validate: {
        validator: function(v) {
          if (!v) return true;
          const norm = normalizePhone(v);
          return /^(?:\d{10}|91\d{10})$/.test(norm);
        },
        message: 'Phone number must be a 10-digit Indian number, optionally prefixed with country code 91'
      }
    },         // normalized 10-digit Indian phone number or 91-prefixed
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

// Normalize phone number before saving
medicalRecordSchema.pre('save', function(next) {
  if (this.emergencyContact && this.emergencyContact.phone) {
    this.emergencyContact.phone = normalizePhone(this.emergencyContact.phone);
  }
  next();
});

medicalRecordSchema.index({ patientId: 1 });

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);
