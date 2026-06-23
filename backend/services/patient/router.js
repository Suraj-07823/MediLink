const express = require('express');
const { protect } = require('../../middleware/auth');
const patientController = require('./controller');

const router = express.Router();

// Doctor discovery (accessible to patients)
router.get('/doctors', patientController.getDoctors);
router.get('/doctors/:id', patientController.getDoctor);
router.get('/doctors/:id/slots', patientController.getSlots);

// Admin-level doctor creation (legacy route)
router.post('/doctors', protect, patientController.createDoctor);

module.exports = router;
