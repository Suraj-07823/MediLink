import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function DoctorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.doctorStatus !== "approved") {
      navigate("/doctor/pending", { replace: true });
    }
  }, [user, navigate]);

  const actions = [
    {
      icon: "📅",
      title: "Today's Schedule",
      desc: "View and manage today's appointments",
      href: "/doctor/schedule",
    },
    {
      icon: "👥",
      title: "My Patients",
      desc: "View patient history and records",
      href: "/doctor/patients",
    },
    {
      icon: "🗓️",
      title: "Manage Schedule",
      desc: "Update your availability",
      href: "/doctor/schedule",
    },
    {
      icon: "👤",
      title: "My Profile",
      desc: "Edit profile and clinic details",
      href: "/doctor/profile",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-500 rounded-2xl p-8 text-white">
        <p className="text-sm text-green-100 mb-1">Welcome back</p>
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">
          Hi, Dr. {user?.name}! 👋
        </h1>
        <p className="text-green-100 max-w-xl">
          Manage your appointments, patients, and practice in one place.
        </p>
      </div>

      {/* Quick actions grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {actions.map(({ icon, title, desc, href }) => (
          <button
            key={title}
            onClick={() => navigate(href)}
            className="bg-white border border-slate-200 rounded-2xl p-6 hover:border-green-300 hover:shadow-md transition-all text-left group"
          >
            <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">
              {icon}
            </div>
            <h3 className="font-semibold text-slate-900 mb-1">{title}</h3>
            <p className="text-sm text-slate-500">{desc}</p>
          </button>
        ))}
      </div>

      {/* Setup reminder */}
      <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6">
        <div className="flex gap-4">
          <span className="text-2xl">⚙️</span>
          <div>
            <h3 className="font-semibold text-amber-900 mb-1">
              Complete your profile
            </h3>
            <p className="text-sm text-amber-700 mb-4">
              Add clinic details and consultation hours so patients can book
              appointments with you.
            </p>
            <button
              onClick={() => navigate("/doctor/profile")}
              className="text-sm font-semibold text-amber-700 hover:text-amber-800 underline"
            >
              Update profile →
            </button>
          </div>
        </div>
      </div>

      {/* Today's appointments */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          Today's Appointments
        </h2>
        <div className="text-center py-12">
          <p className="text-4xl mb-3">📅</p>
          <p className="text-slate-600 font-medium mb-1">
            No appointments today
          </p>
          <p className="text-sm text-slate-500">You're all set for today</p>
        </div>
      </div>
    </div>
  );
}
