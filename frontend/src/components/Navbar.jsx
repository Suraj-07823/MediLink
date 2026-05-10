import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="border-b bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <span className="text-indigo-600">+</span> MediLink
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-6 text-slate-700">
          <Link to="/doctors" className="hover:text-slate-900 font-medium transition">
            Find Doctors
          </Link>

          {isAuthenticated && (
            <>
              {/* Patient navigation */}
              {user?.role === 'patient' && (
                <>
                  <Link to="/patient/dashboard" className="hover:text-slate-900 font-medium transition">
                    Dashboard
                  </Link>
                  <Link to="/prescription" className="hover:text-slate-900 font-medium transition">
                    Prescriptions
                  </Link>
                </>
              )}

              {/* Doctor navigation */}
              {user?.role === 'doctor' && (
                <>
                  <Link to="/doctor/dashboard" className="hover:text-slate-900 font-medium transition">
                    Dashboard
                  </Link>
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                    {user.doctorStatus === 'approved' ? '✓ Approved' : '⏳ ' + user.doctorStatus}
                  </span>
                </>
              )}

              {/* Admin navigation */}
              {user?.role === 'admin' && (
                <>
                  <Link to="/admin/dashboard" className="hover:text-slate-900 font-medium transition">
                    Admin Panel
                  </Link>
                </>
              )}

              <Link to="/checkin" className="hover:text-slate-900 font-medium transition">
                Check-in
              </Link>
            </>
          )}

          {/* Auth buttons */}
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-slate-900">
                {user?.name}
              </span>
              <button
                onClick={handleLogout}
                className="rounded-full bg-slate-900 px-6 py-2 text-white hover:bg-slate-700 transition font-medium"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex gap-3">
              <Link
                to="/login"
                className="rounded-full border-2 border-slate-900 px-6 py-2 text-slate-900 hover:bg-slate-50 transition font-medium"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="rounded-full bg-slate-900 px-6 py-2 text-white hover:bg-slate-700 transition font-medium"
              >
                Sign up
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
