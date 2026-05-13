import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function DoctorPending() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.doctorStatus === 'approved') {
      navigate('/doctor/dashboard', { replace: true });
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-yellow-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-lg p-10 max-w-md text-center">
        <div className="text-6xl mb-4">⏳</div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Application Under Review</h2>
        <p className="text-slate-500 mb-6">
          Hi Dr. {user?.name}, your profile is being verified by our admin team.
          You'll receive an update once approved.
        </p>
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 text-sm text-yellow-800 mb-6">
          📧 We'll notify you at <strong>{user?.email}</strong>
        </div>
        <button
          onClick={() => { logout(); navigate('/login'); }}
          className="text-slate-500 text-sm underline"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
