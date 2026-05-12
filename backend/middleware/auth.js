const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ========== PROTECT ROUTE ==========
// Middleware to check if user has valid JWT token
// If valid, attaches user object to req.user for use in route handlers
// Usage: router.get('/path', protect, myRouteHandler)
const protect = async (req, res, next) => {
  try {
    // Get authorization header (format: "Bearer <token>")
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        message: 'Not authorized to access this route. Please login.' 
      });
    }

    // Extract token from "Bearer <token>"
    const token = authHeader.split(' ')[1];

    // Verify token signature and expiry
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user from database to ensure they still exist and are active
    req.user = await User.findById(decoded.id).select('-password');
    
    if (!req.user) {
      return res.status(401).json({ 
        message: 'User not found' 
      });
    }

    if (!req.user.isActive) {
      return res.status(403).json({ 
        message: 'Your account has been suspended' 
      });
    }

    // Attach user to request and proceed to next middleware/route
    next();
  } catch (error) {
    console.error('Token verification error:', error.message);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Token expired. Please login again.' 
      });
    }
    res.status(401).json({ 
      message: 'Token verification failed' 
    });
  }
};

// ========== AUTHORIZE BY ROLE ==========
// Middleware to check if user has required role(s)
// Usage: router.get('/path', protect, authorize('admin', 'doctor'), myRouteHandler)
// This checks if user.role matches one of the provided roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Not authorized. This route requires role: ${roles.join(' or ')}` 
      });
    }
    next();
  };
};

// ========== DOCTOR APPROVAL CHECK ==========
// Middleware specifically for doctor routes
// Ensures doctor is approved by admin before allowing access
// Usage: router.get('/path', protect, authorize('doctor'), checkDoctorApproval, myRouteHandler)
const checkDoctorApproval = async (req, res, next) => {
  try {
    const Doctor = require('../models/Doctor');
    
    // Fetch doctor profile for this user
    const doctor = await Doctor.findOne({ userId: req.user._id });
    
    if (!doctor) {
      return res.status(404).json({ 
        message: 'Doctor profile not found' 
      });
    }

    if (doctor.status !== 'approved') {
      return res.status(403).json({ 
        message: `Your doctor profile is ${doctor.status}. You cannot accept patients yet.`,
        doctorStatus: doctor.status
      });
    }

    // Attach doctor profile to request
    req.doctor = doctor;
    next();
  } catch (error) {
    console.error('Error checking doctor approval:', error.message);
    res.status(500).json({ 
      message: 'Internal server error' 
    });
  }
};

// Export middleware functions
module.exports = {
  protect,
  authorize,
  checkDoctorApproval
};
