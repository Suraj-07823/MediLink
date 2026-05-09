const express = require('express');
const Doctor = require('../models/Doctor');
const protect = require('../config/auth');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const doctors = await Doctor.find();
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch doctors', error: error.message });
  }
});

router.post('/', protect, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized' });
  }
  try {
    const doctor = await Doctor.create(req.body);
    res.status(201).json(doctor);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create doctor', error: error.message });
  }
});

module.exports = router;
