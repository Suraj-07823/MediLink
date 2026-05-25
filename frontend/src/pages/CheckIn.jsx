import { useState } from 'react';
import axios from 'axios';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

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
    <Card>
      <h2 className="text-3xl font-semibold">Check in with QR/OTP</h2>
      <p className="mt-2 text-slate-600">Enter your appointment ID and OTP to complete the arrival flow.</p>
      <form onSubmit={handleCheckIn} className="mt-8 grid gap-6 md:grid-cols-2">
        <Input label="Appointment ID" value={appointmentId} onChange={(e) => setAppointmentId(e.target.value)} required />
        <Input label="OTP code" value={code} onChange={(e) => setCode(e.target.value)} required />
        <div className="md:col-span-2">
          <Button type="submit">Submit check-in</Button>
        </div>
      </form>
      {status && <div className="mt-6 rounded-2xl bg-slate-100 p-4 text-slate-700">{status}</div>}
    </Card>
  );
}
