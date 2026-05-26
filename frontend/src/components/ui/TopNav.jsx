import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function TopNav({ title, links = [], role = 'patient' }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const accent = {
    patient: 'border-blue-600',
    doctor:  'border-green-600',
    admin:   'border-violet-600',
  }[role] || 'border-slate-900';

  const activeColor = {
    patient: 'text-blue-600',
    doctor:  'text-green-600',
    admin:   'text-violet-600',
  }[role] || 'text-slate-900';

  return (
    <header className={`bg-white border-b-2 ${accent} sticky top-0 z-40 shadow-sm`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Brand */}
        <Link to={`/${role}/dashboard`} className="text-base font-bold text-slate-900 tracking-tight shrink-0">
          {title}
        </Link>

        {/* Nav links (hidden on mobile) */}
        {links.length > 0 && (
          <nav className="hidden md:flex items-center gap-1">
            {links.map((l) => {
              const isActive = location.pathname === l.to;
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                    ${isActive ? `${activeColor} bg-slate-50` : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>
        )}

        {/* Right side */}
        <div className="flex items-center gap-3 shrink-0">
          {user && (
            <span className="hidden sm:block text-xs text-slate-500 font-medium truncate max-w-[140px]">
              {user.name}
            </span>
          )}
          <button
            onClick={logout}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-300 px-3 py-1.5 rounded-lg transition-colors bg-white"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
