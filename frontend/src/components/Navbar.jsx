import { Link } from 'react-router-dom';

export default function Navbar({ user, setUser, setToken }) {
  const handleLogout = () => {
    localStorage.removeItem('medilink_token');
    localStorage.removeItem('medilink_user');
    setToken(null);
    setUser(null);
  };

  return (
    <header className="border-b bg-white shadow-sm">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <Link to="/" className="text-xl font-semibold text-slate-900">MediLink</Link>
        <nav className="flex items-center gap-4 text-slate-700">
          <Link to="/doctors" className="hover:text-slate-900">Doctors</Link>
          {user && <Link to="/dashboard" className="hover:text-slate-900">Dashboard</Link>}
          <Link to="/checkin" className="hover:text-slate-900">Check-in</Link>
          {user ? (
            <button onClick={handleLogout} className="rounded-md bg-slate-900 px-4 py-2 text-white hover:bg-slate-700">Logout</button>
          ) : (
            <Link to="/" className="rounded-md bg-slate-900 px-4 py-2 text-white hover:bg-slate-700">Sign in</Link>
          )}
        </nav>
      </div>
    </header>
  );
}
