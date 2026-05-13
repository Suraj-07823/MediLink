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
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
            <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-800">New doctor registration</p>
              <p className="text-xs text-slate-500">Dr. Sarah Johnson awaiting approval</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-800">Appointment booked</p>
              <p className="text-xs text-slate-500">Patient John Doe with Dr. Smith</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
            <div className="w-2 h-2 bg-green-600 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-800">System backup completed</p>
              <p className="text-xs text-slate-500">Daily backup finished successfully</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}