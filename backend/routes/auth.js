const express = require('express');
const rateLimit = require('express-rate-limit');
const { protect } = require('../middleware/auth');
const authController = require('../controllers/authController');

const router = express.Router();

const RATE_LIMIT_WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 3600000;
const RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_MAX, 10) || 60;

const authLimiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: RATE_LIMIT_MAX,
  message: 'Too many authentication requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth routes delegate to controller (non-breaking)
router.post('/register', authLimiter, authController.register);
router.post('/register-doctor', authController.registerDoctor);
router.post('/login', authLimiter, authController.login);
router.post('/refresh', authLimiter, authController.refresh);
router.get('/me', protect, authController.me);
router.post('/logout', authController.logout);

module.exports = router;
