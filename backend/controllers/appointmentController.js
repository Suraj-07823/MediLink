const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');

async function list(req, res) {
  try {
    const filter = req.user.role === 'patient' ? { patient: req.user._id } : {};
    const appointments = await Appointment.find(filter).populate('doctor patient');
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch appointments', error: error.message });
  }
}

async function create(req, res) {
  const { doctorId, date, slot } = req.body;
  try {
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    const appointment = await Appointment.create({ patient: req.user._id, doctor: doctor._id, date, slot, checkInCode: `${Math.floor(100000 + Math.random() * 900000)}` });
    res.status(201).json(appointment);
  } catch (error) {
    res.status(500).json({ message: 'Failed to schedule appointment', error: error.message });
  }
}

async function checkin(req, res) {
  const { code } = req.body;
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    if (appointment.checkInCode !== code) return res.status(400).json({ message: 'Invalid check-in code' });
    appointment.status = 'checked_in';
    await appointment.save();
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: 'Check-in failed', error: error.message });
  }
}

module.exports = { list, create, checkin };
// Placeholder appointment controller
// TODO: implement controller functions in Phase 3
module.exports = {};
