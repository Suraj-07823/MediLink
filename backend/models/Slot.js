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
    required: true,
    match: [/^([01]\d|2[0-3]):[0-5]\d$/, 'Start time must be in HH:MM format (24-hour)']
    // format: "09:00" (24-hour)
  },
  endTime: { 
    type: String, 
    required: true,
    match: [/^([01]\d|2[0-3]):[0-5]\d$/, 'End time must be in HH:MM format (24-hour)']
    // format: "10:00"
  },

  // Capacity
  maxPatients: { 
    type: Number, 
    required: true,
    min: [1, 'Maximum patients must be at least 1']
    // how many patients in this slot
  },

  // Active flag
  isActive: { 
    type: Boolean, 
    default: true 
    // doctor can turn slot on/off
  }
}, { timestamps: true });

// Validate that endTime is after startTime
slotSchema.pre('validate', function(next) {
  if (this.startTime && this.endTime) {
    const start = this.startTime.split(':').map(Number);
    const end = this.endTime.split(':').map(Number);
    const startMinutes = start[0] * 60 + start[1];
    const endMinutes = end[0] * 60 + end[1];
    
    if (endMinutes <= startMinutes) {
      this.invalidate('endTime', 'End time must be after start time');
    }
  }
  next();
});

slotSchema.index({ doctorId: 1, dayOfWeek: 1 });

module.exports = mongoose.model('Slot', slotSchema);
