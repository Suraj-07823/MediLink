const mongoose = require('mongoose');

// Slot model stores doctor's weekly availability
// Doctor defines multiple slots (e.g., Monday 9-10 AM, Tuesday 2-3 PM, etc.)
const slotSchema = new mongoose.Schema({
  // Reference to Doctor
  doctorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Doctor', 
    required: true 
  },

  // Slot timing
  dayOfWeek: { 
    type: String, 
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    required: true 
  },
  startTime: { 
    type: String, 
    required: true 
    // format: "09:00" (24-hour)
  },
  endTime: { 
    type: String, 
    required: true 
    // format: "10:00"
  },

  // Capacity
  maxPatients: { 
    type: Number, 
    required: true 
    // how many patients in this slot
  },

  // Active flag
  isActive: { 
    type: Boolean, 
    default: true 
    // doctor can turn slot on/off
  },

  // Timestamps
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
}, { timestamps: true });

slotSchema.index({ doctorId: 1, dayOfWeek: 1 });

module.exports = mongoose.model('Slot', slotSchema);
