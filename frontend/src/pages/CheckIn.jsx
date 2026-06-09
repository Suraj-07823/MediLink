import { useState, useEffect } from 'react';
import axios from 'axios';

export default function CheckIn() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCheckInId, setActiveCheckInId] = useState('');
  const [otpValues, setOtpValues] = useState({});
  const [inlineMessages, setInlineMessages] = useState({});

  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true);
      try {
        const response = await axios.get('/api/appointments');
        const booked = Array.isArray(response.data)
          ? response.data.filter((appointment) => appointment.status === 'booked')
          : [];
        setAppointments(booked);
      } catch (fetchError) {
        setInlineMessages({ fetch: fetchError.response?.data?.message || fetchError.message || 'Unable to load appointments.' });
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  const handleOtpChange = (appointmentId, value) => {
    setOtpValues((current) => ({ ...current, [appointmentId]: value }));
  };

  const handleCheckInClick = (appointmentId) => {
    setActiveCheckInId((current) => (current === appointmentId ? '' : appointmentId));
    setInlineMessages((current) => ({ ...current, [appointmentId]: '' }));
  };

  const handleOtpSubmit = async (event, appointment) => {
    event.preventDefault();
    const otp = otpValues[appointment._id];

    if (!otp) {
      setInlineMessages((current) => ({ ...current, [appointment._id]: 'Please enter your OTP.' }));
      return;
    }

    try {
      const response = await axios.patch(`/api/appointments/${appointment._id}/checkin`, { otp });
      setAppointments((current) =>
        current.map((item) =>
          item._id === appointment._id ? { ...item, status: 'checked-in' } : item
        )
      );
      setInlineMessages((current) => ({ ...current, [appointment._id]: `Checked in successfully.` }));
      setActiveCheckInId('');
    } catch (checkInError) {
      setInlineMessages((current) => ({
        ...current,
        [appointment._id]: checkInError.response?.data?.message || checkInError.message || 'Check-in failed.'
      }));
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString(undefined, {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4">
      <h1 className="text-3xl font-bold text-slate-900">Check In</h1>

      {loading ? (
        <div className="flex items-center justify-center rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex items-center gap-3 text-slate-700">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-t-indigo-600 border-slate-300" />
            Loading appointments...
          </div>
        </div>
      ) : appointments.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-700 shadow-sm">
          No appointments ready for check-in
        </div>
      ) : (
        <div className="space-y-6">
          {appointments.map((appointment) => {
            const doctorName = appointment.doctorId?.userId?.name || 'Doctor';
            const fee = appointment.consultationFee != null ? `₹${appointment.consultationFee}` : '₹0';
            const message = inlineMessages[appointment._id];
            const isActive = activeCheckInId === appointment._id;

            return (
              <div key={appointment._id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">{doctorName}</h2>
                    <p className="mt-1 text-sm text-slate-600">{formatDate(appointment.date)} · {appointment.timeSlot}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">{fee}</div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-indigo-50 px-3 py-1 text-sm text-indigo-700">Status: {appointment.status}</span>
                  {appointment.status === 'booked' && (
                    <button
                      type="button"
                      onClick={() => handleCheckInClick(appointment._id)}
                      className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
                    >
                      Check In
                    </button>
                  )}
                </div>

                {isActive && appointment.status === 'booked' && (
                  <form onSubmit={(event) => handleOtpSubmit(event, appointment)} className="mt-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700">Enter OTP</label>
                      <input
                        type="text"
                        value={otpValues[appointment._id] || ''}
                        onChange={(event) => handleOtpChange(appointment._id, event.target.value)}
                        className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-500"
                        placeholder="OTP"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      className="rounded-3xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
                    >
                      Submit OTP
                    </button>
                  </form>
                )}

                {message && (
                  <div className={`mt-4 rounded-3xl p-4 text-sm ${message.startsWith('Checked in successfully') ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                    {message}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {inlineMessages.fetch && !loading && (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700 shadow-sm">
          {inlineMessages.fetch}
        </div>
      )}
    </div>
  );
}
