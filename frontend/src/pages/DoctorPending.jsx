import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';

export default function DoctorPending() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (user?.role !== 'doctor') {
    return null;
  }

  const isRejected = user?.doctorStatus === 'rejected';
  const isPending = user?.doctorStatus === 'pending';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4 py-8">
      <div className="max-w-xl w-full">
        
        {/* Pending state */}
        {isPending && (
          <div className="bg-white rounded-3xl border border-amber-200 shadow-xl p-8 text-center space-y-6">
            <div className="text-5xl">⏳</div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Under Review</h1>
              <p className="text-slate-600 mt-2">Your doctor registration is being reviewed by our admin team.</p>
            </div>

            {/* Timeline */}
            <div className="bg-amber-50 rounded-2xl p-6 text-left space-y-4">
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-sm">✓</div>
                  <div className="w-0.5 h-12 bg-amber-300 my-2"></div>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Account Created</p>
                  <p className="text-xs text-slate-500 mt-0.5">Registration received and verified</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center text-white font-bold text-sm animate-pulse">2</div>
                  <div className="w-0.5 h-12 bg-slate-300 my-2"></div>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Admin Review</p>
                  <p className="text-xs text-slate-500 mt-0.5">Currently being reviewed (1-2 days)</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-slate-300 flex items-center justify-center text-slate-600 font-bold text-sm">3</div>
                </div>
                <div>
                  <p className="font-semibold text-slate-700">Activation</p>
                  <p className="text-xs text-slate-500 mt-0.5">You'll receive an email when approved</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-slate-600">
                <strong>Dr. {user?.name}</strong> • Registered {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'recently'}
              </p>
              <p className="text-xs text-slate-500">
                {user?.doctorProfile?.speciality && `Speciality: ${user.doctorProfile.speciality}`}
              </p>
            </div>

            <div className="pt-4 space-y-3">
              <button
                onClick={() => logout()}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 rounded-xl transition-colors"
              >
                Logout
              </button>
              <p className="text-xs text-slate-500">
                Questions? Contact support at support@medilink.in
              </p>
            </div>
          </div>
        )}

        {/* Rejected state */}
        {isRejected && (
          <div className="bg-white rounded-3xl border border-red-200 shadow-xl p-8 text-center space-y-6">
            <div className="text-5xl">❌</div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Registration Not Approved</h1>
              <p className="text-slate-600 mt-2">Your doctor registration has been reviewed and rejected by our admin team.</p>
            </div>

            {/* Rejection reason */}
            {user?.doctorProfile?.rejectionReason && (
              <div className="bg-red-50 rounded-2xl p-6 text-left border border-red-200">
                <p className="text-xs font-semibold text-red-700 uppercase tracking-wide mb-2">Reason for rejection</p>
                <p className="text-sm text-red-800">{user.doctorProfile.rejectionReason}</p>
              </div>
            )}

            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                You can update your information and reapply for registration.
              </p>
              <button
                onClick={() => navigate('/register')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors"
              >
                Reapply Now
              </button>
            </div>

            <div className="pt-4 space-y-3">
              <button
                onClick={() => logout()}
                className="w-full bg-slate-200 hover:bg-slate-300 text-slate-900 font-semibold py-3 rounded-xl transition-colors"
              >
                Logout
              </button>
              <p className="text-xs text-slate-500">
                Need help? Email support@medilink.in
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
