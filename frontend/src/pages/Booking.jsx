import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

export default function Booking() {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [slot, setSlot] = useState('');
  const [date, setDate] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    axios.get('/api/doctors').then((response) => {
      const found = response.data.find((item) => item._id === doctorId);
      setDoctor(found);
      setSlot(found?.slots?.[0] || '');
    }).catch(console.error);
  }, [doctorId]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await axios.post('/api/appointments', { doctorId, date, slot });
      setMessage('Appointment booked successfully. Check your dashboard for details.');
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to book appointment');
    }
  };

  if (!doctor) return <div className="text-slate-600">Loading doctor details...</div>;

  return (
    <Card>
      <h2 className="text-3xl font-semibold">Book an appointment with {doctor.name}</h2>
      <p className="mt-2 text-slate-600">Speciality: {doctor.speciality} · Location: {doctor.location}</p>
      <form onSubmit={handleSubmit} className="mt-8 grid gap-6 md:grid-cols-2">
        <Input label="Appointment date" type="date" required value={date} onChange={(e) => setDate(e.target.value)} />
        <label className="block">
          <span className="text-sm font-medium text-slate-700 mb-2 block">Select slot</span>
          <select required value={slot} onChange={(e) => setSlot(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 p-3">
            {doctor.slots.map((slotOption) => (
              <option key={slotOption} value={slotOption}>{slotOption}</option>
            ))}
          </select>
        </label>
        <div className="md:col-span-2">
          <Button type="submit">Confirm booking</Button>
        </div>
      </form>
      {message && <p className="mt-6 rounded-2xl bg-slate-100 p-4 text-slate-700">{message}</p>}
    </Card>
  );
}
