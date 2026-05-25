const express = require('express');
const { protect } = require('../middleware/auth');
const prescriptionController = require('../controllers/prescriptionController');

const router = express.Router();

router.get('/', protect, prescriptionController.list);
router.post('/', protect, prescriptionController.create);

module.exports = router;
