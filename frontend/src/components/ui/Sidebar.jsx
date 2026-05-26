import { Link, useLocation } from 'react-router-dom';

export default function Sidebar({ links = [], role = 'doctor' }) {
  const location = useLocation();

  const activeClasses = {
    doctor:  'bg-green-50 text-green-700 font-semibold',
    admin:   'bg-violet-50 text-violet-700 font-semibold',
    patient: 'bg-blue-50 text-blue-700 font-semibold',
  }[role] || 'bg-slate-100 text-slate-900 font-semibold';

  return (
    <aside className="w-56 shrink-0 hidden md:block">
      <nav className="bg-white rounded-2xl border border-slate-100 shadow-sm p-3 sticky top-20 space-y-0.5">
        {links.map((l) => {
          const isActive = location.pathname === l.to || location.pathname.startsWith(l.to + '/');
          return (
            <Link
              key={l.to}
              to={l.to}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-colors
                ${isActive ? activeClasses : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
            >
              {l.icon && <span className="text-base">{l.icon}</span>}
              {l.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
