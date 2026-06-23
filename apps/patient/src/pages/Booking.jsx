import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Booking() {
  const { doctorId } = useParams();
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [successOtp, setSuccessOtp] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const getTodayString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const fetchDoctorDetails = async () => {
    setLoading(true);
    setError('');

    try {
      // TODO: use single doctor endpoint if available
      const response = await axios.get(`/api/doctors/${doctorId}`);
      setDoctor(response.data);
    } catch (singleError) {
      try {
        const listResponse = await axios.get('/api/doctors', { params: { status: 'approved' } });
        const foundDoctor = Array.isArray(listResponse.data)
          ? listResponse.data.find((item) => item._id === doctorId)
          : null;

        if (!foundDoctor) {
          setError('Doctor not found.');
        } else {
          setDoctor(foundDoctor);
        }
      } catch (listError) {
        setError(listError.response?.data?.message || listError.message || 'Unable to load doctor details.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchSlots = async (date) => {
    if (!date) {
      setAvailableSlots([]);
      return;
    }

    try {
      setError('');
      const response = await axios.get(`/api/doctors/${doctorId}/slots`, { params: { date } });
      setAvailableSlots(response.data?.slots || []);
    } catch (slotError) {
      setAvailableSlots([]);
      setError(slotError.response?.data?.message || slotError.message || 'Unable to load available slots.');
    }
  };

  useEffect(() => {
    fetchDoctorDetails();
  }, [doctorId]);

  useEffect(() => {
    setSelectedTimeSlot('');
    if (selectedDate) {
      fetchSlots(selectedDate);
    } else {
      setAvailableSlots([]);
    }
  }, [doctorId, selectedDate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    if (!selectedDate || !selectedTimeSlot) {
      setError('Please select a date and time slot.');
      return;
    }

    setSubmitting(true);

    try {
      const response = await axios.post('/api/appointments', {
        doctorId,
        date: selectedDate,
        timeSlot: selectedTimeSlot,
        symptoms
      });

      const otp = response.data?.appointment?.otp || 'N/A';
      setSuccessOtp(otp);
      setMessage('Appointment booked successfully!');

      setTimeout(() => {
        navigate('/dashboard');
      }, 8000);
    } catch (submitError) {
      setError(submitError.response?.data?.message || submitError.message || 'Failed to book appointment.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyOtp = () => {
    if (successOtp) {
      navigator.clipboard.writeText(successOtp);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const renderSlotOption = (slot) => {
    if (typeof slot === 'string') {
      return {
        value: slot,
        label: slot,
        disabled: false
      };
    }

    const label = `${slot.startTime}–${slot.endTime}${slot.isAvailable === false ? ' (Full)' : ''}`;
    return {
      value: slot.startTime,
      label,
      disabled: slot.isAvailable === false
    };
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4">
      <h1 className="text-3xl font-bold text-slate-900">Book Appointment</h1>

      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center text-slate-700 shadow-sm">
          Loading doctor details...
        </div>
      ) : error && !doctor ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-center text-rose-700 shadow-sm">
          {error}
        </div>
      ) : doctor ? (
        <div className="space-y-6">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-900">{doctor.userId?.name || 'Doctor'}</h2>
            <p className="mt-2 text-sm text-slate-600">{doctor.speciality || 'Speciality unavailable'}</p>
            <p className="mt-3 text-sm text-slate-700">{doctor.clinicName || 'Clinic information unavailable'}</p>
            <p className="mt-3 text-lg font-semibold text-slate-900">Consultation fee: ₹{doctor.consultationFee ?? 'N/A'}</p>
          </section>

          <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="grid gap-6 md:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                Appointment date
                <input
                  type="date"
                  value={selectedDate}
                  min={getTodayString()}
                  onChange={(event) => setSelectedDate(event.target.value)}
                  className="rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-500"
                  required
                />
              </label>

              <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                Time slot
                <select
                  value={selectedTimeSlot}
                  onChange={(event) => setSelectedTimeSlot(event.target.value)}
                  disabled={!selectedDate || availableSlots.length === 0}
                  className="rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-500"
                  required
                >
                  <option value="">Select a slot</option>
                  {availableSlots.map((slotItem, index) => {
                    const option = renderSlotOption(slotItem);
                    return (
                      <option key={`${option.value}-${index}`} value={option.value} disabled={option.disabled}>
                        {option.label}
                      </option>
                    );
                  })}
                </select>
              </label>
            </div>

            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              Symptoms (optional)
              <textarea
                value={symptoms}
                onChange={(event) => setSymptoms(event.target.value)}
                placeholder="Describe how you are feeling..."
                className="min-h-[120px] rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-500"
              />
            </label>

            <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-3xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-400 md:w-auto"
              >
                {submitting ? 'Booking...' : 'Confirm Appointment'}
              </button>

              {message && (
                <div className="flex w-full flex-col gap-4 rounded-3xl border border-emerald-200 bg-emerald-50 p-6 shadow-sm">
                  <div className="text-lg font-bold text-emerald-800">{message}</div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-emerald-700">
                      Your OTP: <span className="font-mono text-lg font-bold">{successOtp}</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyOtp}
                      className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-emerald-700"
                    >
                      {copied ? 'Copied!' : 'Copy OTP'}
                    </button>
                  </div>
                  
                  <p className="text-xs text-emerald-600">
                    Save this OTP — you'll need it to check in at the clinic.
                  </p>
                  
                  <div className="flex flex-col gap-3">
                    <button
                      type="button"
                      onClick={() => navigate('/dashboard')}
                      className="rounded-3xl bg-indigo-600 px-6 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
                    >
                      Go to Dashboard
                    </button>
                    <p className="text-center text-[10px] text-emerald-600">
                      Redirecting in 8 seconds...
                    </p>
                  </div>
                </div>
              )}

              {error && (
                <div className="rounded-3xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                  {error}
                </div>
              )}
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
