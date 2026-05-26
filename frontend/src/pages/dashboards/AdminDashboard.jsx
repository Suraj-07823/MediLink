import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const actions = [
    { icon: '👨‍⚕️', title: 'Manage Doctors', desc: 'Review and approve doctor registrations', href: '/admin/doctors', badge: 'Action needed' },
    { icon: '👥', title: 'Patients', desc: 'View and manage all patient accounts', href: '/admin/patients', badge: null },
    { icon: '📅', title: 'Appointments', desc: 'Monitor all system appointments', href: '/admin/appointments', badge: null },
    { icon: '📊', title: 'Analytics', desc: 'System metrics and usage reports', href: '/admin/analytics', badge: null },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-violet-500 rounded-2xl p-8 text-white">
        <p className="text-sm text-violet-100 mb-1">Welcome back</p>
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">Hi, {user?.name}! 👋</h1>
        <p className="text-violet-100 max-w-xl">Manage doctors, patients, and oversee the entire MediLink platform.</p>
      </div>

      {/* Quick actions grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {actions.map(({ icon, title, desc, href, badge }) => (
          <button
            key={title}
            onClick={() => navigate(href)}
            className="relative bg-white border border-slate-200 rounded-2xl p-6 hover:border-violet-300 hover:shadow-md transition-all text-left group"
          >
            {badge && (
              <div className="absolute top-3 right-3 bg-red-100 text-red-700 text-xs font-semibold px-2 py-1 rounded-full">
                {badge}
              </div>
            )}
            <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">{icon}</div>
            <h3 className="font-semibold text-slate-900 mb-1">{title}</h3>
            <p className="text-sm text-slate-500">{desc}</p>
          </button>
        ))}
      </div>

      {/* System status */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Doctors', value: '0', wrapper: 'bg-emerald-50 border-emerald-200', labelText: 'text-emerald-700', valueText: 'text-emerald-600' },
          { label: 'Total Patients', value: '0', wrapper: 'bg-sky-50 border-sky-200', labelText: 'text-sky-700', valueText: 'text-sky-600' },
          { label: 'Today\'s Appointments', value: '0', wrapper: 'bg-amber-50 border-amber-200', labelText: 'text-amber-700', valueText: 'text-amber-600' },
        ].map(({ label, value, wrapper, labelText, valueText }) => (
          <div key={label} className={`${wrapper} rounded-2xl p-6`}>
            <p className={`text-sm ${labelText} font-medium`}>{label}</p>
            <p className={`text-3xl font-bold ${valueText} mt-2`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Recent registrations */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Pending Doctor Approvals</h2>
        <div className="text-center py-12">
          <p className="text-4xl mb-3">👨‍⚕️</p>
          <p className="text-slate-600 font-medium mb-1">No pending registrations</p>
          <p className="text-sm text-slate-500">All doctors have been reviewed</p>
          <button
            onClick={() => navigate('/admin/doctors')}
            className="mt-4 inline-flex items-center gap-2 text-violet-600 hover:text-violet-700 font-semibold text-sm"
          >
            View all doctors →
          </button>
        </div>
      </div>
    </div>
  );
}