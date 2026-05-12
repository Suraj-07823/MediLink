import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// --- Page imports ---
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';

// ProtectedRoute: blocks access if not logged in or wrong role
function ProtectedRoute({ children, requiredRole = null }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

// --- Patient Dashboard ---
function PatientDashboard() {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen bg-blue-50">
      <nav className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">MediLink Patient</h1>
        <div className="flex items-center gap-6">
          <span className="text-sm">Find Doctors</span>
          <span className="text-sm">My Appointments</span>
          <span className="text-sm">Prescriptions</span>
          <button
            onClick={() => { logout(); window.location.href = '/login'; }}
            className="bg-white text-blue-600 px-4 py-1.5 rounded-full text-sm font-medium"
          >
            Logout
          </button>
        </div>
      </nav>
      <main className="max-w-4xl mx-auto px-6 py-12">
        <h2 className="text-3xl font-bold text-slate-800 mb-2">
          Welcome, {user?.name}! 👋
        </h2>
        <p className="text-slate-500 mb-8">
          Your health dashboard — appointments and prescriptions will appear here.
        </p>
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-100">
            <div className="text-3xl mb-2">📅</div>
            <div className="font-semibold text-slate-700">Appointments</div>
            <div className="text-slate-400 text-sm mt-1">No upcoming appointments</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-100">
            <div className="text-3xl mb-2">💊</div>
            <div className="font-semibold text-slate-700">Prescriptions</div>
            <div className="text-slate-400 text-sm mt-1">No prescriptions yet</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-100">
            <div className="text-3xl mb-2">🩺</div>
            <div className="font-semibold text-slate-700">Find Doctors</div>
            <div className="text-slate-400 text-sm mt-1">Search nearby doctors</div>
          </div>
        </div>
      </main>
    </div>
  );
}

// --- Doctor Dashboard ---
function DoctorDashboard() {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen bg-green-50">
      <nav className="bg-green-600 text-white px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">MediLink Doctor</h1>
        <div className="flex items-center gap-6">
          <span className="text-sm">My Schedule</span>
          <span className="text-sm">Appointments</span>
          <button
            onClick={() => { logout(); window.location.href = '/login'; }}
            className="bg-white text-green-600 px-4 py-1.5 rounded-full text-sm font-medium"
          >
            Logout
          </button>
        </div>
      </nav>
      <main className="max-w-4xl mx-auto px-6 py-12">
        <h2 className="text-3xl font-bold text-slate-800 mb-2">
          Welcome, Dr. {user?.name}! 👨‍⚕️
        </h2>
        <p className="text-slate-500 mb-8">
          Manage your schedule and patients from here.
        </p>
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-green-100">
            <div className="text-3xl mb-2">👥</div>
            <div className="font-semibold text-slate-700">Today's Patients</div>
            <div className="text-slate-400 text-sm mt-1">No appointments today</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-green-100">
            <div className="text-3xl mb-2">🗓️</div>
            <div className="font-semibold text-slate-700">My Schedule</div>
            <div className="text-slate-400 text-sm mt-1">Set your available slots</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-green-100">
            <div className="text-3xl mb-2">📋</div>
            <div className="font-semibold text-slate-700">Prescriptions</div>
            <div className="text-slate-400 text-sm mt-1">Write digital prescriptions</div>
          </div>
        </div>
      </main>
    </div>
  );
}

// --- Doctor Pending Approval ---
function DoctorPending() {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen bg-yellow-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-lg p-10 max-w-md text-center">
        <div className="text-6xl mb-4">⏳</div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Application Under Review</h2>
        <p className="text-slate-500 mb-6">
          Hi Dr. {user?.name}, your profile is being verified by our admin team.
          You'll receive an email once approved. This usually takes 24-48 hours.
        </p>
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 text-sm text-yellow-800 mb-6">
          📧 We'll notify you at <strong>{user?.email}</strong>
        </div>
        <button
          onClick={() => { logout(); window.location.href = '/login'; }}
          className="text-slate-500 text-sm underline"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

// --- Admin Dashboard ---
function AdminDashboard() {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen bg-slate-900">
      <nav className="bg-slate-800 text-white px-6 py-4 flex justify-between items-center border-b border-slate-700">
        <h1 className="text-xl font-bold">MediLink Admin</h1>
        <div className="flex items-center gap-6">
          <span className="text-slate-300 text-sm">Doctor Applications</span>
          <span className="text-slate-300 text-sm">All Users</span>
          <span className="text-slate-300 text-sm">Analytics</span>
          <button
            onClick={() => { logout(); window.location.href = '/login'; }}
            className="bg-red-600 text-white px-4 py-1.5 rounded-full text-sm font-medium"
          >
            Logout
          </button>
        </div>
      </nav>
      <main className="max-w-5xl mx-auto px-6 py-12">
        <h2 className="text-3xl font-bold text-white mb-2">
          Admin Panel 🛡️
        </h2>
        <p className="text-slate-400 mb-8">
          Welcome {user?.name}. Monitor and manage everything from here.
        </p>
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
            <div className="text-3xl mb-2">👨‍⚕️</div>
            <div className="font-semibold text-white">Doctor Applications</div>
            <div className="text-slate-400 text-sm mt-1">Review and approve doctors</div>
          </div>
          <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
            <div className="text-3xl mb-2">👥</div>
            <div className="font-semibold text-white">All Patients</div>
            <div className="text-slate-400 text-sm mt-1">View registered patients</div>
          </div>
          <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
            <div className="text-3xl mb-2">📊</div>
            <div className="font-semibold text-white">Analytics</div>
            <div className="text-slate-400 text-sm mt-1">Platform statistics</div>
          </div>
        </div>
      </main>
    </div>
  );
}

// --- Main App ---
function AppContent() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Patient routes */}
      <Route path="/patient/dashboard" element={
        <ProtectedRoute requiredRole="patient">
          <PatientDashboard />
        </ProtectedRoute>
      } />

      {/* Doctor routes */}
      <Route path="/doctor/dashboard" element={
        <ProtectedRoute requiredRole="doctor">
          <DoctorDashboard />
        </ProtectedRoute>
      } />
      <Route path="/doctor/pending" element={
        <ProtectedRoute requiredRole="doctor">
          <DoctorPending />
        </ProtectedRoute>
      } />

      {/* Admin routes */}
      <Route path="/admin/dashboard" element={
        <ProtectedRoute requiredRole="admin">
          <AdminDashboard />
        </ProtectedRoute>
      } />

      {/* 404 fallback */}
      <Route path="*" element={<Navigate to="/" />} />
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