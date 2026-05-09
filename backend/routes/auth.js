const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

const createToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '12h' });

router.post('/register', async (req, res) => {
  const { name, email, password, role, phone } = req.body;
  try {
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(409).json({ message: 'User already exists' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, role: role || 'patient', phone });
    res.status(201).json({ token: createToken(user._id), user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    res.json({ token: createToken(user._id), user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

module.exports = router;
