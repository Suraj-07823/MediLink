const Prescription = require('../models/Prescription');
const Appointment = require('../models/Appointment');

async function list(req, res) {
  try {
    const filter = req.user.role === 'doctor' ? { doctor: req.user._id } : { patient: req.user._id };
    const prescriptions = await Prescription.find(filter).populate('doctor patient appointment');
    res.json(prescriptions);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch prescriptions', error: error.message });
  }
}

async function create(req, res) {
  if (req.user.role !== 'doctor') return res.status(403).json({ message: 'Only doctors may create prescriptions' });
  try {
    const { appointmentId, medicines, notes } = req.body;
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    const prescription = await Prescription.create({ appointment: appointment._id, patient: appointment.patient, doctor: req.user._id, medicines, notes });
    res.status(201).json(prescription);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create prescription', error: error.message });
  }
}

module.exports = { list, create };
