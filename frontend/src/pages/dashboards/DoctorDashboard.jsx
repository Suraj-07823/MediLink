import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function DoctorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.doctorStatus !== 'approved') {
      navigate('/doctor/pending', { replace: true });
    }
  }, [user, navigate]);

  return (
    <div>
      <h2 className="text-3xl font-bold text-slate-800 mb-2">
        Welcome back, Dr. {user?.name}! 👋
      </h2>
      <p className="text-slate-500 mb-8">
        Manage your appointments and patient care from your dashboard.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Today's Appointments */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-green-100">
          <div className="text-3xl mb-2">📅</div>
          <h3 className="font-semibold text-slate-800 mb-1">Today's Appointments</h3>
          <p className="text-sm text-slate-500 mb-4">5 appointments scheduled</p>
          <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition">
            View Schedule
          </button>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-green-100">
          <div className="text-3xl mb-2">👥</div>
          <h3 className="font-semibold text-slate-800 mb-1">My Patients</h3>
          <p className="text-sm text-slate-500 mb-4">Manage patient records and history</p>
          <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition">
            View Patients
          </button>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-green-100">
          <div className="text-3xl mb-2">📊</div>
          <h3 className="font-semibold text-slate-800 mb-1">Analytics</h3>
          <p className="text-sm text-slate-500 mb-4">View your practice statistics</p>
          <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition">
            View Reports
          </button>
        </div>
      </div>

      {/* Upcoming Appointments */}
      <div className="mt-8 bg-white rounded-2xl p-6 shadow-sm border border-green-100">
        <h3 className="font-semibold text-slate-800 mb-4">Upcoming Appointments</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-slate-800">John Doe</p>
              <p className="text-xs text-slate-500">Today at 10:00 AM</p>
            </div>
            <button className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition">
              Start
            </button>
          </div>
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-slate-800">Jane Smith</p>
              <p className="text-xs text-slate-500">Today at 11:30 AM</p>
            </div>
            <button className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition">
              Start
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}