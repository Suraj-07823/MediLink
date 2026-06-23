const express = require('express');
const { protect, authorize } = require('../../middleware/auth');
const adminController = require('./controller');

const router = express.Router();

// Protect all admin routes and require admin role
router.use(protect, authorize('admin'));

// Admin doctor management
router.get('/doctors/pending', adminController.getPendingDoctors);
router.get('/doctors', adminController.getDoctors);
router.put('/doctors/:id/approve', adminController.approveDoctor);
router.put('/doctors/:id/reject', adminController.rejectDoctor);

module.exports = router;
