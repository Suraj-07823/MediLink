const express = require('express');
const { protect } = require('../../middleware/auth');
const clinicalController = require('./controller');

const router = express.Router();

// Prescription routes (mounted at /api/clinical/prescriptions in server.js or handled here)
router.get('/prescriptions', protect, clinicalController.listPrescriptions);
router.post('/prescriptions', protect, clinicalController.createPrescription);

module.exports = router;
