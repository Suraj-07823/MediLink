import { useAuth } from '../../context/AuthContext';

export default function PatientDashboard() {
  const { user } = useAuth();

  return (
    <div>
      <h2 className="text-3xl font-bold text-slate-800 mb-2">
        Welcome back, {user?.name}! 👋
      </h2>
      <p className="text-slate-500 mb-8">
        Your health dashboard — manage your appointments and view your medical records.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-100">
          <div className="text-3xl mb-2">📅</div>
          <h3 className="font-semibold text-slate-800 mb-1">Book Appointment</h3>
          <p className="text-sm text-slate-500 mb-4">Schedule with your preferred doctor</p>
          <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition">
            Find Doctors
          </button>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-100">
          <div className="text-3xl mb-2">📋</div>
          <h3 className="font-semibold text-slate-800 mb-1">My Appointments</h3>
          <p className="text-sm text-slate-500 mb-4">View upcoming and past appointments</p>
          <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition">
            View Appointments
          </button>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-100">
          <div className="text-3xl mb-2">💊</div>
          <h3 className="font-semibold text-slate-800 mb-1">Prescriptions</h3>
          <p className="text-sm text-slate-500 mb-4">Access your digital prescriptions</p>
          <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition">
            View Prescriptions
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8 bg-white rounded-2xl p-6 shadow-sm border border-blue-100">
        <h3 className="font-semibold text-slate-800 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-800">Appointment with Dr. Smith</p>
              <p className="text-xs text-slate-500">Tomorrow at 10:00 AM</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
            <div className="w-2 h-2 bg-green-600 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-800">Prescription updated</p>
              <p className="text-xs text-slate-500">Blood pressure medication renewed</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}