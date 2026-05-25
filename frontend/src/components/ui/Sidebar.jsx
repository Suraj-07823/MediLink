import { Link } from 'react-router-dom';

export default function Sidebar({ links = [], role = 'doctor' }) {
  return (
    <aside className="w-64 sticky top-0 h-screen px-4 py-6 bg-white border-r border-slate-100">
      <nav className="space-y-3">
        {links.map((l) => (
          <Link key={l.to} to={l.to} className="block rounded-md px-3 py-2 text-slate-700 hover:bg-slate-50">{l.label}</Link>
        ))}
      </nav>
    </aside>
  );
}
