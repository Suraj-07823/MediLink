const express = require('express');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const protect = require('../config/auth');

const router = express.Router();

router.get('/', protect, async (req, res) => {
  try {
    const filter = req.user.role === 'patient' ? { patient: req.user._id } : {};
    const appointments = await Appointment.find(filter).populate('doctor patient');
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch appointments', error: error.message });
  }
});

router.post('/', protect, async (req, res) => {
  const { doctorId, date, slot } = req.body;
  try {
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    const appointment = await Appointment.create({
      patient: req.user._id,
      doctor: doctor._id,
      date,
      slot,
      checkInCode: `${Math.floor(100000 + Math.random() * 900000)}`
    });
    res.status(201).json(appointment);
  } catch (error) {
    res.status(500).json({ message: 'Failed to schedule appointment', error: error.message });
  }
});

router.patch('/:id/checkin', protect, async (req, res) => {
  const { code } = req.body;
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    if (appointment.checkInCode !== code) {
      return res.status(400).json({ message: 'Invalid check-in code' });
    }
    appointment.status = 'checked_in';
    await appointment.save();
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: 'Check-in failed', error: error.message });
  }
});

module.exports = router;
