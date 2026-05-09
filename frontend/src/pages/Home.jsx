import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <section className="rounded-3xl bg-white p-8 shadow-xl">
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <span className="inline-flex rounded-full bg-indigo-100 px-3 py-1 text-sm font-semibold text-indigo-700">Healthcare simplified</span>
          <h1 className="mt-6 text-4xl font-bold text-slate-900 sm:text-5xl">Book appointments, check in, and view digital prescriptions in one app.</h1>
          <p className="mt-4 text-slate-600">MediLink helps patients connect with doctors, manage bookings, and complete check-in with QR/OTP convenience.</p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/doctors" className="rounded-full bg-slate-900 px-6 py-3 text-white hover:bg-slate-700">Find Doctors</Link>
            <Link to="/checkin" className="rounded-full border border-slate-300 px-6 py-3 text-slate-900 hover:bg-slate-50">Check In</Link>
          </div>
        </div>
        <div className="rounded-3xl bg-slate-50 p-6">
          <div className="space-y-4">
            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold">Doctor listing</h2>
              <p className="mt-2 text-slate-600">Browse specialties, slots, and availability before booking.</p>
            </div>
            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold">Patient dashboard</h2>
              <p className="mt-2 text-slate-600">View appointments, prescriptions, and status at a glance.</p>
            </div>
            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold">Secure check-in</h2>
              <p className="mt-2 text-slate-600">Use OTP or QR data to confirm arrival quickly.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
