import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PatientDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const actions = [
    { icon: '🔍', title: 'Find Doctor', desc: 'Search by speciality or location', href: '/dashboard/doctors' },
    { icon: '📅', title: 'My Appointments', desc: 'View and manage bookings', href: '/dashboard/appointments' },
    { icon: '💊', title: 'Prescriptions', desc: 'Access digital prescriptions', href: '/dashboard/prescriptions' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl p-8 text-white">
        <p className="text-sm text-blue-100 mb-1">Welcome back</p>
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">Hi, {user?.name}! 👋</h1>
        <p className="text-blue-100 max-w-xl">Manage your health, appointments, and medical records in one place.</p>
      </div>

      {/* Quick actions grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {actions.map(({ icon, title, desc, href }) => (
          <button
            key={title}
            onClick={() => navigate(href)}
            className="bg-white border border-slate-200 rounded-2xl p-6 hover:border-blue-300 hover:shadow-md transition-all text-left group"
          >
            <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">{icon}</div>
            <h3 className="font-semibold text-slate-900 mb-1">{title}</h3>
            <p className="text-sm text-slate-500">{desc}</p>
          </button>
        ))}
      </div>

      {/* Recent appointments */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Upcoming Appointments</h2>
        <div className="text-center py-12">
          <p className="text-4xl mb-3">📅</p>
          <p className="text-slate-600 font-medium mb-1">No upcoming appointments</p>
          <p className="text-sm text-slate-500">Start by finding and booking a doctor</p>
          <button
            onClick={() => navigate('/dashboard/doctors')}
            className="mt-4 inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold text-sm"
          >
            Find Doctor →
          </button>
        </div>
      </div>
    </div>
  );
}