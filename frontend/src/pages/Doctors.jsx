import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/doctors').then((response) => {
      setDoctors(response.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center text-slate-600">Loading doctors...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Available doctors</h2>
      <div className="grid gap-6 md:grid-cols-2">
        {doctors.map((doctor) => (
          <div key={doctor._id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">{doctor.name}</h3>
                <p className="text-slate-600">{doctor.speciality} · {doctor.location}</p>
              </div>
              <span className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-700">{doctor.rating} ★</span>
            </div>
            <p className="mt-4 text-slate-600">{doctor.description}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {doctor.slots?.slice(0, 3).map((slot) => (
                <span key={slot} className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">{slot}</span>
              ))}
            </div>
            <div className="mt-6">
              <Link to={`/booking/${doctor._id}`} className="inline-flex rounded-full bg-slate-900 px-5 py-3 text-white hover:bg-slate-700">Book slot</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
