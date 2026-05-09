import { useState } from 'react';
import axios from 'axios';

export default function CheckIn() {
  const [appointmentId, setAppointmentId] = useState('');
  const [code, setCode] = useState('');
  const [status, setStatus] = useState('');

  const handleCheckIn = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.patch(`/api/appointments/${appointmentId}/checkin`, { code });
      setStatus(`Checked in successfully: ${response.data.status}`);
    } catch (error) {
      setStatus(error.response?.data?.message || 'Check-in failed.');
    }
  };

  return (
    <div className="rounded-3xl bg-white p-8 shadow-sm">
      <h2 className="text-3xl font-semibold">Check in with QR/OTP</h2>
      <p className="mt-2 text-slate-600">Enter your appointment ID and OTP to complete the arrival flow.</p>
      <form onSubmit={handleCheckIn} className="mt-8 grid gap-6 md:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Appointment ID</span>
          <input value={appointmentId} onChange={(e) => setAppointmentId(e.target.value)} required className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 p-3" />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">OTP code</span>
          <input value={code} onChange={(e) => setCode(e.target.value)} required className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 p-3" />
        </label>
        <div className="md:col-span-2">
          <button className="rounded-full bg-slate-900 px-6 py-3 text-white hover:bg-slate-700">Submit check-in</button>
        </div>
      </form>
      {status && <div className="mt-6 rounded-2xl bg-slate-100 p-4 text-slate-700">{status}</div>}
    </div>
  );
}
