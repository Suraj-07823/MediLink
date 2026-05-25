const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const RefreshToken = require('../models/RefreshToken');
const { createToken, createRefreshToken, verifyRefreshToken, refreshCookieOptions } = require('../services/authService');

// Register (patient)
async function register(req, res) {
	try {
		const { name, email, phone, password, role, dateOfBirth, gender, bloodGroup, address } = req.body;

		if (!name || !email || !phone || !password || !role) {
			return res.status(400).json({ message: 'Please provide: name, email, phone, password, role' });
		}

		if (role !== 'patient') {
			return res.status(400).json({ message: 'Only patients can register here. Use /register-doctor for doctor registration.' });
		}

		const existingUser = await User.findOne({ email });
		if (existingUser) return res.status(409).json({ message: 'Email already registered. Please use another email or login.' });

		const hashedPassword = await bcrypt.hash(password, 10);
		const newUser = new User({ name, email, phone, password: hashedPassword, role, dateOfBirth, gender, bloodGroup, address });
		await newUser.save();

		const token = createToken(newUser._id);
		res.status(201).json({ message: 'Registration successful', token, user: { id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role, phone: newUser.phone } });
	} catch (error) {
		console.error('Registration error:', error);
		res.status(500).json({ message: 'Registration failed', error: error.message });
	}
}

// Doctor registration
async function registerDoctor(req, res) {
	const session = await mongoose.startSession();
	session.startTransaction();

	try {
		const { name, email, phone, password, speciality, qualification, experience, regNumber, consultationFee, clinicName, clinicAddress, about } = req.body;

		if (!name || !email || !phone || !password || !speciality || !qualification || !regNumber) {
			await session.abortTransaction();
			session.endSession();
			return res.status(400).json({ message: 'Missing required doctor fields' });
		}

		const existingUser = await User.findOne({ email }).session(session);
		if (existingUser) {
			await session.abortTransaction();
			session.endSession();
			return res.status(409).json({ message: 'Email already registered' });
		}

		const existingDoctor = await Doctor.findOne({ regNumber }).session(session);
		if (existingDoctor) {
			await session.abortTransaction();
			session.endSession();
			return res.status(409).json({ message: 'Medical registration number already registered' });
		}

		const hashedPassword = await bcrypt.hash(password, 10);
		const newUser = new User({ name, email, phone, password: hashedPassword, role: 'doctor', speciality, qualification, experience, regNumber, consultationFee, clinicName, clinicAddress, about });
		await newUser.save({ session });

		const doctorProfile = new Doctor({ userId: newUser._id, speciality, qualification, experience, regNumber, consultationFee, clinicName, clinicAddress, about, status: 'pending' });
		await doctorProfile.save({ session });

		await session.commitTransaction();
		session.endSession();

		const token = createToken(newUser._id);
		res.status(201).json({ message: 'Doctor registration successful. Awaiting admin approval.', token, user: { id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role, doctorStatus: doctorProfile.status } });
	} catch (error) {
		await session.abortTransaction();
		session.endSession();
		console.error('Doctor registration error:', error);
		res.status(500).json({ message: 'Doctor registration failed', error: error.message });
	}
}

// Login
async function login(req, res) {
	try {
		const { email, password } = req.body;
		if (!email || !password) return res.status(400).json({ message: 'Please provide email and password' });

		const user = await User.findOne({ email });
		if (!user) return res.status(401).json({ message: 'Invalid email or password' });

		if (user.lockedUntil && user.lockedUntil > Date.now()) {
			return res.status(423).json({ message: 'Account is temporarily locked due to too many failed login attempts. Try again later.' });
		}

		const isPasswordCorrect = await bcrypt.compare(password, user.password);
		if (!isPasswordCorrect) {
			user.failedLoginCount += 1;
			if (user.failedLoginCount >= 5) user.lockedUntil = Date.now() + 15 * 60 * 1000;
			await user.save();
			return res.status(401).json({ message: 'Invalid email or password' });
		}

		user.failedLoginCount = 0; user.lockedUntil = undefined; await user.save();
		if (!user.isActive) return res.status(403).json({ message: 'Your account has been suspended. Contact support.' });

		const token = createToken(user._id);
		const refreshToken = createRefreshToken(user._id);
		await RefreshToken.create({ token: refreshToken, userId: user._id, expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) });
		res.cookie('refreshToken', refreshToken, refreshCookieOptions);

		let doctorStatus = null;
		if (user.role === 'doctor') {
			const doctorProfile = await Doctor.findOne({ userId: user._id });
			doctorStatus = doctorProfile?.status || 'pending';
		}

		res.status(200).json({ message: 'Login successful', token, refreshToken, user: { id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone, doctorStatus } });
	} catch (error) {
		console.error('Login error:', error);
		res.status(500).json({ message: 'Login failed', error: error.message });
	}
}

// Refresh token
async function refresh(req, res) {
	try {
		const incomingRefreshToken = req.body.refreshToken || req.cookies?.refreshToken;
		if (!incomingRefreshToken) return res.status(400).json({ message: 'Refresh token required' });

		const decoded = verifyRefreshToken(incomingRefreshToken);
		const storedToken = await RefreshToken.findOne({ token: incomingRefreshToken, userId: decoded.userId });
		if (!storedToken) return res.status(401).json({ message: 'Invalid refresh token' });

		await RefreshToken.findOneAndDelete({ token: incomingRefreshToken });
		const newRefreshToken = createRefreshToken(decoded.userId);
		await RefreshToken.create({ token: newRefreshToken, userId: decoded.userId, expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) });
		res.cookie('refreshToken', newRefreshToken, refreshCookieOptions);

		const newToken = createToken(decoded.userId);
		res.status(200).json({ message: 'Token refreshed', token: newToken, refreshToken: newRefreshToken });
	} catch (error) {
		console.error('Refresh error:', error);
		res.status(401).json({ message: 'Invalid refresh token' });
	}
}

// Me (protected)
async function me(req, res) {
	try {
		const user = req.user;
		if (!user) return res.status(404).json({ message: 'Authenticated user not found' });

		let doctorStatus = null;
		if (user.role === 'doctor') {
			const doctorProfile = await Doctor.findOne({ userId: user._id });
			doctorStatus = doctorProfile?.status || 'pending';
		}

		res.status(200).json({ message: 'Current user retrieved successfully', user: { id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone, isVerified: user.isVerified, isActive: user.isActive, doctorStatus } });
	} catch (error) {
		console.error('Fetch current user error:', error);
		res.status(500).json({ message: 'Unable to retrieve current user', error: error.message });
	}
}

// Logout
async function logout(req, res) {
	try {
		const incomingRefreshToken = req.body.refreshToken || req.cookies?.refreshToken;
		if (incomingRefreshToken) {
			const stored = await RefreshToken.findOne({ token: incomingRefreshToken });
			if (stored && stored.userId) await User.findByIdAndUpdate(stored.userId, { tokenInvalidBefore: new Date() });
			await RefreshToken.findOneAndDelete({ token: incomingRefreshToken });
		}

		res.clearCookie('refreshToken', refreshCookieOptions);
		res.status(200).json({ message: 'Logged out successfully' });
	} catch (error) {
		console.error('Logout error:', error);
		res.status(500).json({ message: 'Logout failed' });
	}
}

module.exports = {
	register,
	registerDoctor,
	login,
	refresh,
	me,
	logout
};
