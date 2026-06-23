import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// --- Layout imports ---
import PatientLayout from './layouts/PatientLayout';

// --- Page imports ---
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Doctors from './pages/Doctors';
import Booking from './pages/Booking';
import Prescription from './pages/Prescription';
import CheckIn from './pages/CheckIn';
import PatientDashboard from './pages/PatientDashboard';

// ProtectedRoute: blocks access if not authenticated or wrong role
function ProtectedRoute({ children }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Double check it's actually a patient
  if (user?.role !== 'patient') {
    return <Navigate to="/" replace />;
  }

  return children;
}

function AppContent() {
  const { sessionLoading } = useAuth();

  if (sessionLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500 text-sm">Loading MediLink Patient...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/checkin" element={<CheckIn />} />

      {/* Protected Patient routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <PatientLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<PatientDashboard />} />
        <Route path="doctors" element={<Doctors />} />
        <Route path="book/:doctorId" element={<Booking />} />
        <Route path="prescriptions" element={<Prescription />} />
        <Route path="appointments" element={<PatientDashboard />} />
      </Route>

      {/* Legacy/Utility Redirects to keep pages working similarly to unified app if called with /patient/ prefix */}
      <Route path="/patient/*" element={<Navigate to="/dashboard" replace />} />

      {/* 404 fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
