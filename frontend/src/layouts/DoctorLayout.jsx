import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function DoctorLayout() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-green-50">
      {/* Navigation */}
      <nav className="bg-green-600 text-white px-6 py-4 flex justify-between items-center shadow-lg">
        <Link to="/doctor/dashboard" className="text-xl font-bold hover:text-green-100 transition">
          MediLink Doctor
        </Link>
        <div className="flex items-center gap-6">
          <Link to="/doctor/dashboard" className="text-sm hover:text-green-100 transition">Dashboard</Link>
          <Link to="/doctor/appointments" className="text-sm hover:text-green-100 transition">Appointments</Link>
          <Link to="/doctor/patients" className="text-sm hover:text-green-100 transition">My Patients</Link>
          <Link to="/doctor/schedule" className="text-sm hover:text-green-100 transition">Schedule</Link>
          <Link to="/doctor/profile" className="text-sm hover:text-green-100 transition">Profile</Link>
          <button
            onClick={handleLogout}
            className="bg-white text-green-600 px-4 py-1.5 rounded-full text-sm font-medium hover:bg-green-50 transition"
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