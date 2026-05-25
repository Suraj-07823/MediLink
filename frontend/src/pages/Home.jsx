import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="rounded-[2rem] bg-white p-10 shadow-xl ring-1 ring-slate-200 sm:p-12">
            <span className="inline-flex rounded-full bg-sky-100 px-4 py-2 text-sm font-semibold text-sky-700">Healthcare made easy</span>
            <h1 className="mt-8 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              Book appointments, manage care, and check in faster.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              MediLink gives patients and doctors a clean experience from the first screen. Sign in to your account, browse providers, and complete secure check-in with one app.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
              <Link
                to="/login"
                className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-base font-semibold text-white transition hover:bg-slate-700"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3 text-base font-semibold text-slate-900 transition hover:border-slate-400 hover:bg-slate-50"
              >
                Create Account
              </Link>
            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <h2 className="text-base font-semibold text-slate-900">For patients</h2>
                <p className="mt-2 text-sm text-slate-600">View appointments, prescriptions, and book care without the paperwork.</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <h2 className="text-base font-semibold text-slate-900">For doctors</h2>
                <p className="mt-2 text-sm text-slate-600">Manage your schedule, review patient visits, and approve consultations.</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <h2 className="text-base font-semibold text-slate-900">Secure check-in</h2>
                <p className="mt-2 text-sm text-slate-600">Use OTP or QR-based arrival confirmation for every booking.</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <h2 className="text-base font-semibold text-slate-900">Unified dashboard</h2>
                <p className="mt-2 text-sm text-slate-600">Access your care details from one central account screen.</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[2rem] bg-slate-900 p-8 text-white shadow-2xl sm:p-10">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Welcome to MediLink</p>
              <h2 className="mt-4 text-3xl font-bold">Quick access to the features you need</h2>
              <ul className="mt-6 space-y-4 text-slate-200">
                <li className="flex gap-3">
                  <span className="mt-1 inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-800 text-sky-300">1</span>
                  <span>Sign in to your patient or doctor account.</span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-1 inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-800 text-sky-300">2</span>
                  <span>Find doctors, book appointments, and view your schedule.</span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-1 inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-800 text-sky-300">3</span>
                  <span>Use secure check-in and complete visits with peace of mind.</span>
                </li>
              </ul>
            </div>

            <div className="rounded-[2rem] bg-white p-8 shadow-xl ring-1 ring-slate-200">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Get started</p>
              <div className="mt-6 space-y-4">
                <Link to="/login" className="block rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-base font-medium text-slate-900 hover:bg-slate-100">
                  Already have an account? Sign in
                </Link>
                <Link to="/register" className="block rounded-2xl bg-slate-900 px-5 py-4 text-base font-medium text-white hover:bg-slate-800">
                  Register as a patient or doctor
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
