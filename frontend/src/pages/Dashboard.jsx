import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Dashboard() {
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);

  useEffect(() => {
    axios.get('/api/appointments').then((response) => setAppointments(response.data)).catch(console.error);
    axios.get('/api/prescriptions').then((response) => setPrescriptions(response.data)).catch(console.error);
  }, []);

  return (
    <div className="space-y-8">
      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold">Patient dashboard</h2>
        <p className="mt-2 text-slate-600">Review upcoming appointments and prescription history.</p>
      </div>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <h3 className="text-xl font-semibold">Upcoming appointments</h3>
          {appointments.length === 0 ? (
            <p className="mt-4 text-slate-600">No upcoming appointments yet.</p>
          ) : (
            <ul className="mt-4 space-y-4">
              {appointments.map((item) => (
                <li key={item._id} className="rounded-2xl border border-slate-200 p-4">
                  <p className="font-medium text-slate-900">{item.doctor?.name || 'Doctor'} • {item.date}</p>
                  <p className="text-slate-600">Slot: {item.slot} · Status: {item.status}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <h3 className="text-xl font-semibold">Prescription history</h3>
          {prescriptions.length === 0 ? (
            <p className="mt-4 text-slate-600">No prescriptions available yet.</p>
          ) : (
            <ul className="mt-4 space-y-4">
              {prescriptions.map((item) => (
                <li key={item._id} className="rounded-2xl border border-slate-200 p-4">
                  <p className="font-medium text-slate-900">{item.doctor?.name || 'Doctor'}</p>
                  <p className="text-slate-600">Ordered {item.medicines.length} medicines</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
