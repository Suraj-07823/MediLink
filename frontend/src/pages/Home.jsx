import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user, isAuthenticated, sessionLoading } = useAuth();
  const navigate = useNavigate();

  const dashboardPath =
    user?.role === 'doctor' ? '/doctor/dashboard' :
    user?.role === 'admin'  ? '/admin/dashboard'  : '/patient/dashboard';

  if (sessionLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-[3px] border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-500">Loading MediLink...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Minimal nav */}
      <header className="bg-white border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <span className="text-base font-bold text-slate-900">🏥 MediLink</span>
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <button
                onClick={() => navigate(dashboardPath)}
                className="text-sm font-semibold text-blue-600 hover:text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
              >
                Go to Dashboard →
              </button>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors">
                  Login
                </Link>
                <Link to="/register" className="text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Left — text */}
          <div>
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-full px-3 py-1 mb-6">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <span className="text-xs font-semibold text-blue-700 tracking-wide">Now live in Nagpur</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 leading-tight tracking-tight">
              Book a doctor.<br />
              <span className="text-blue-600">Skip the wait.</span>
            </h1>
            <p className="mt-5 text-lg text-slate-500 leading-relaxed max-w-md">
              Find doctors near you, book appointments in seconds, and receive digital prescriptions — all in one place.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              {isAuthenticated ? (
                <button
                  onClick={() => navigate(dashboardPath)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm"
                >
                  Continue to Dashboard →
                </button>
              ) : (
                <>
                  <Link to="/register" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm">
                    Create free account
                  </Link>
                  <Link to="/login" className="bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-semibold px-6 py-3 rounded-xl transition-colors text-sm">
                    Sign in
                  </Link>
                </>
              )}
            </div>

            {/* Trust line */}
            <p className="mt-6 text-xs text-slate-400">
              Free for patients · Doctors approved by admin · Nagpur, Maharashtra
            </p>
          </div>

          {/* Right — feature cards */}
          <div className="space-y-4">
            {[
              { icon: '📅', color: 'blue',   title: 'Book appointments',    desc: 'Search by speciality or area. See real-time slot availability.' },
              { icon: '📱', color: 'green',  title: 'QR check-in',          desc: 'Receive a QR code on WhatsApp. Scan at the clinic — no queue.' },
              { icon: '💊', color: 'purple', title: 'Digital prescriptions', desc: 'Doctor writes your prescription digitally. Access it anytime.' },
            ].map(({ icon, color, title, desc }) => (
              <div key={title} className={`bg-white border border-${color}-100 rounded-2xl p-5 flex gap-4 shadow-sm`}>
                <div className={`w-10 h-10 bg-${color}-50 rounded-xl flex items-center justify-center text-lg shrink-0`}>
                  {icon}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{title}</p>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
