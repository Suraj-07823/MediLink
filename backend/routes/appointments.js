const express = require('express');
const { protect } = require('../middleware/auth');
const appointmentController = require('../controllers/appointmentController');

const router = express.Router();

router.get('/', protect, appointmentController.list);
router.post('/', protect, appointmentController.create);
router.patch('/:id/checkin', protect, appointmentController.checkin);

module.exports = router;
