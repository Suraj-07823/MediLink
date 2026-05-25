import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user, isAuthenticated, sessionLoading } = useAuth();
  const navigate = useNavigate();

  const dashboardPath = user?.role === 'doctor'
    ? '/doctor/dashboard'
    : user?.role === 'admin'
      ? '/admin/dashboard'
      : '/patient/dashboard';

  if (sessionLoading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-full border-4 border-slate-300 border-t-slate-900 animate-spin"></div>
          <p className="mt-4 text-sm text-slate-500">Checking your session...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <section className="rounded-[2rem] bg-white p-8 shadow-xl ring-1 ring-slate-200 sm:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-sky-600">MediLink</p>
            <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              Care management with a simple, modern start.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              Sign in or create an account to manage bookings, prescriptions, and secure check-in with a clean welcome screen.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={() => navigate(dashboardPath)}
                  className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-slate-700"
                >
                  Continue to dashboard
                </button>
              ) : (
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-slate-700"
                >
                  Login to your account
                </Link>
              )}
              <Link
                to="/register"
                className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3 text-base font-semibold text-slate-900 transition hover:border-slate-400 hover:bg-slate-50"
              >
                Register now
              </Link>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-slate-50 p-5">
                <h2 className="text-base font-semibold text-slate-900">Patient account</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">Book doctors, view prescriptions, and track appointments in one place.</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-5">
                <h2 className="text-base font-semibold text-slate-900">Doctor account</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">Manage availability, accept bookings, and review patient visits.</p>
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-[2rem] bg-slate-900 p-8 text-white shadow-2xl sm:p-10">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Get started</p>
              <h2 className="mt-4 text-3xl font-bold">Next step flow</h2>
              <p className="mt-4 text-slate-300">Start at login or registration, then go straight to your dashboard with the right role-based experience.</p>

              <ol className="mt-8 space-y-4 text-slate-200">
                <li className="flex gap-4">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-800 text-lg font-semibold text-sky-300">1</span>
                  <div>
                    <p className="font-semibold">Login or register</p>
                    <p className="text-sm text-slate-400">Choose your account type and authenticate securely.</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-800 text-lg font-semibold text-sky-300">2</span>
                  <div>
                    <p className="font-semibold">Go to your dashboard</p>
                    <p className="text-sm text-slate-400">Patients land on the patient dashboard and doctors land on the doctor dashboard.</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-800 text-lg font-semibold text-sky-300">3</span>
                  <div>
                    <p className="font-semibold">Use secure check-in</p>
                    <p className="text-sm text-slate-400">Use secure attendance verification and finish your visit confidently.</p>
                  </div>
                </li>
              </ol>
            </div>

            <div className="rounded-[2rem] bg-white p-8 shadow-xl ring-1 ring-slate-200">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Quick access</p>
              <div className="mt-6 space-y-3">
                {isAuthenticated ? (
                  <button
                    type="button"
                    onClick={() => navigate(dashboardPath)}
                    className="block w-full rounded-2xl bg-slate-900 px-5 py-4 text-base font-medium text-white hover:bg-slate-800"
                  >
                    Continue to dashboard
                  </button>
                ) : (
                  <>
                    <Link to="/login" className="block rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-base font-medium text-slate-900 hover:bg-slate-100">
                      Already registered? Login
                    </Link>
                    <Link to="/register" className="block rounded-2xl bg-slate-900 px-5 py-4 text-base font-medium text-white hover:bg-slate-800">
                      New to MediLink? Create account
                    </Link>
                  </>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
