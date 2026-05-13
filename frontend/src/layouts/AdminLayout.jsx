import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminLayout() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-purple-50">
      {/* Navigation */}
      <nav className="bg-purple-600 text-white px-6 py-4 flex justify-between items-center shadow-lg">
        <Link to="/admin/dashboard" className="text-xl font-bold hover:text-purple-100 transition">
          MediLink Admin
        </Link>
        <div className="flex items-center gap-6">
          <Link to="/admin/dashboard" className="text-sm hover:text-purple-100 transition">Dashboard</Link>
          <Link to="/admin/doctors" className="text-sm hover:text-purple-100 transition">Manage Doctors</Link>
          <Link to="/admin/patients" className="text-sm hover:text-purple-100 transition">Manage Patients</Link>
          <Link to="/admin/appointments" className="text-sm hover:text-purple-100 transition">All Appointments</Link>
          <Link to="/admin/analytics" className="text-sm hover:text-purple-100 transition">Analytics</Link>
          <button
            onClick={handleLogout}
            className="bg-white text-purple-600 px-4 py-1.5 rounded-full text-sm font-medium hover:bg-purple-50 transition"
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