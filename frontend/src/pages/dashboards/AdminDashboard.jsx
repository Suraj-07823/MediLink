import { useAuth } from '../../context/AuthContext';

export default function AdminDashboard() {
  const { user } = useAuth();

  return (
    <div>
      <h2 className="text-3xl font-bold text-slate-800 mb-2">
        Welcome back, {user?.name}! 👋
      </h2>
      <p className="text-slate-500 mb-8">
        Admin dashboard — manage doctors, patients, and system analytics.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* System Overview */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-purple-100">
          <div className="text-3xl mb-2">👨‍⚕️</div>
          <h3 className="font-semibold text-slate-800 mb-1">Doctors</h3>
          <p className="text-sm text-slate-500 mb-4">Manage doctor registrations and approvals</p>
          <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition">
            Manage Doctors
          </button>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-purple-100">
          <div className="text-3xl mb-2">👥</div>
          <h3 className="font-semibold text-slate-800 mb-1">Patients</h3>
          <p className="text-sm text-slate-500 mb-4">View and manage patient accounts</p>
          <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition">
            Manage Patients
          </button>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-purple-100">
          <div className="text-3xl mb-2">📊</div>
          <h3 className="font-semibold text-slate-800 mb-1">Analytics</h3>
          <p className="text-sm text-slate-500 mb-4">System usage and performance metrics</p>
          <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition">
            View Analytics
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8 bg-white rounded-2xl p-6 shadow-sm border border-purple-100">
        <h3 className="font-semibold text-slate-800 mb-4">Recent Activity</h3>
        <div className="text-center py-8">
          <div className="text-4xl mb-3">📊</div>
          <p className="text-slate-500 text-sm">No recent activity.</p>
          <p className="text-slate-400 text-xs mt-1">Doctor registrations and bookings will appear here.</p>
        </div>
      </div>
    </div>
  );
}