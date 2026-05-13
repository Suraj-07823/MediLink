import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// --- Layout imports ---
import PatientLayout from './layouts/PatientLayout';
import DoctorLayout from './layouts/DoctorLayout';
import AdminLayout from './layouts/AdminLayout';

// --- Page imports ---
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';

// --- Dashboard imports ---
import PatientDashboard from './pages/dashboards/PatientDashboard';
import DoctorDashboard from './pages/dashboards/DoctorDashboard';
import DoctorPending from './pages/dashboards/DoctorPending';
import AdminDashboard from './pages/dashboards/AdminDashboard';

// ProtectedRoute: blocks access if not authenticated or wrong role
function ProtectedRoute({ children, requiredRole = null }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    const redirectPath = user?.role === 'patient'
      ? '/patient'
      : user?.role === 'doctor'
        ? '/doctor'
        : user?.role === 'admin'
          ? '/admin'
          : '/';

    return <Navigate to={redirectPath} replace />;
  }

  return children;
}

function AppContent() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Patient routes */}
      <Route
        path="/patient"
        element={
          <ProtectedRoute requiredRole="patient">
            <PatientLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<PatientDashboard />} />
      </Route>

      {/* Doctor routes */}
      <Route
        path="/doctor"
        element={
          <ProtectedRoute requiredRole="doctor">
            <DoctorLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DoctorDashboard />} />
        <Route path="pending" element={<DoctorPending />} />
      </Route>

      {/* Admin routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
      </Route>

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
