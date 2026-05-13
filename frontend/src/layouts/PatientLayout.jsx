import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PatientLayout() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-blue-50">
      {/* Navigation */}
      <nav className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center shadow-lg">
        <Link to="/patient/dashboard" className="text-xl font-bold hover:text-blue-100 transition">
          MediLink Patient
        </Link>
        <div className="flex items-center gap-6">
          <Link to="/patient/dashboard" className="text-sm hover:text-blue-100 transition">Dashboard</Link>
          <Link to="/patient/doctors" className="text-sm hover:text-blue-100 transition">Find Doctors</Link>
          <Link to="/patient/appointments" className="text-sm hover:text-blue-100 transition">My Appointments</Link>
          <Link to="/patient/records" className="text-sm hover:text-blue-100 transition">Medical Records</Link>
          <Link to="/patient/prescriptions" className="text-sm hover:text-blue-100 transition">Prescriptions</Link>
          <button
            onClick={handleLogout}
            className="bg-white text-blue-600 px-4 py-1.5 rounded-full text-sm font-medium hover:bg-blue-50 transition"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}