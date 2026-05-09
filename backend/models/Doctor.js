const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  speciality: { type: String, required: true },
  location: { type: String, required: true },
  rating: { type: Number, default: 4.8 },
  slots: [{ type: String }],
  description: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Doctor', doctorSchema);
