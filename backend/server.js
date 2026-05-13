const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const connectDatabase = require('./config/db');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
// Will import more routes as we build them
// const patientRoutes = require('./routes/patient');
// const doctorRoutes = require('./routes/doctor');
// const adminRoutes = require('./routes/admin');

// Import models (ensures they're registered with MongoDB)
const User = require('./models/User');
const Doctor = require('./models/Doctor');
const Slot = require('./models/Slot');
const Appointment = require('./models/Appointment');
const Prescription = require('./models/Prescription');
const MedicalRecord = require('./models/MedicalRecord');

// Initialize Express app
const app = express();

// Middleware
app.use(cors({ origin: true, credentials: true })); // Enable cross-origin requests for frontend
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse form data
app.use(cookieParser()); // Parse cookies for refresh token support

// Connect to MongoDB database
connectDatabase();

// ========== ROUTES ==========
app.use('/api/auth', authRoutes);
// app.use('/api/patient', patientRoutes);
// app.use('/api/doctor', doctorRoutes);
// app.use('/api/admin', adminRoutes);

// ========== HEALTH CHECK ==========
// Simple endpoint to verify backend is running
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'MediLink Backend',
    timestamp: new Date().toISOString()
  });
});

// ========== 404 HANDLER ==========
// Catch all undefined routes
app.use('*', (req, res) => {
  res.status(404).json({ 
    message: 'Route not found',
    requestedPath: req.originalUrl
  });
});

// ========== ERROR HANDLER ==========
// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ========== START SERVER ==========
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════╗
  ║   MediLink Backend Server Running    ║
  ║   Port: ${PORT}                          ║
  ║   Environment: ${process.env.NODE_ENV || 'development'}              ║
  ║   MongoDB: Connected                 ║
  ╚══════════════════════════════════════╝
  `);
});
