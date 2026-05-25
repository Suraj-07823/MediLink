import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function TopNav({ title, links = [], role = 'patient' }) {
  const { logout } = useAuth();

  const roleColors = {
    patient: 'bg-blue-600 hover:bg-blue-700',
    doctor: 'bg-green-600 hover:bg-green-700',
    admin: 'bg-purple-600 hover:bg-purple-700'
  };

  return (
    <nav className={`px-6 py-4 flex items-center justify-between text-white ${roleColors[role] || roleColors.patient}`}>
      <div className="flex items-center gap-4">
        <Link to={`/${role}/dashboard`} className="text-xl font-bold hover:opacity-90">{title}</Link>
      </div>

      <div className="flex items-center gap-4">
        {links.map((l) => (
          <Link key={l.to} to={l.to} className="text-sm hover:underline">{l.label}</Link>
        ))}
        <button onClick={logout} className="ml-4 bg-white text-current px-4 py-1.5 rounded-full text-sm font-medium">Logout</button>
      </div>
    </nav>
  );
}
