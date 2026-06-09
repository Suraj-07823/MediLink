import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [speciality, setSpeciality] = useState('');
  const [city, setCity] = useState('');
  const navigate = useNavigate();

  const fetchDoctors = async (queryParams = {}) => {
    setLoading(true);
    setError('');

    try {
      const params = { status: 'approved' };
      if (queryParams.speciality) params.speciality = queryParams.speciality;
      if (queryParams.city) params.city = queryParams.city;

      const response = await axios.get('/api/doctors', { params });
      setDoctors(Array.isArray(response.data) ? response.data : []);
    } catch (fetchError) {
      setError(
        fetchError.response?.data?.message || fetchError.message || 'Unable to load doctors at this time.'
      );
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleSearch = async (event) => {
    event.preventDefault();
    const trimmedSpeciality = speciality.trim();
    const trimmedCity = city.trim();

    const query = {};
    if (trimmedSpeciality) query.speciality = trimmedSpeciality;
    if (trimmedCity) query.city = trimmedCity;

    await fetchDoctors(query);

    const searchParams = new URLSearchParams({ status: 'approved', ...query });
    navigate({ pathname: '/doctors', search: searchParams.toString() });
  };

  return (
    <div className="space-y-8 p-4">
      <div className="space-y-3">
        <h1 className="text-3xl font-bold text-slate-900">Find Doctors</h1>
        <form onSubmit={handleSearch} className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-end md:justify-between">
          <div className="grid w-full gap-3 md:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm text-slate-700">
              Speciality
              <input
                type="text"
                value={speciality}
                onChange={(event) => setSpeciality(event.target.value)}
                placeholder="e.g. Cardiology"
                className="rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-slate-900 outline-none transition focus:border-indigo-500"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-slate-700">
              City
              <input
                type="text"
                value={city}
                onChange={(event) => setCity(event.target.value)}
                placeholder="e.g. Mumbai"
                className="rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-slate-900 outline-none transition focus:border-indigo-500"
              />
            </label>
          </div>

          <button
            type="submit"
            className="rounded-md bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Search
          </button>
        </form>
      </div>

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-slate-700 shadow-sm">
          Loading available doctors...
        </div>
      ) : error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-center text-rose-700 shadow-sm">
          {error}
        </div>
      ) : doctors.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-slate-700 shadow-sm">
          No doctors found. Try adjusting your filters.
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {doctors.map((doctor) => {
            const rating = doctor.avgRating != null ? doctor.avgRating.toFixed(1) : '0.0';
            const experienceText = doctor.experience != null ? `${doctor.experience} yrs exp` : 'Experience not available';
            const cityText = doctor.clinicAddress?.city || 'Unknown city';
            const areaText = doctor.clinicAddress?.area || 'Unknown area';

            return (
              <div key={doctor._id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-600">{doctor.speciality}</p>
                    <h2 className="mt-2 text-2xl font-semibold text-slate-900">{doctor.userId?.name || 'Doctor'}</h2>
                    <p className="mt-1 text-sm text-slate-600">{doctor.clinicName || 'Clinic information unavailable'}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700">
                    ₹{doctor.consultationFee ?? 'N/A'}
                  </div>
                </div>

                <div className="grid gap-3 rounded-3xl bg-slate-50 p-4 text-sm text-slate-700">
                  <p>{areaText}, {cityText}</p>
                  <p>{experienceText}</p>
                  <p>{rating} ★ · {doctor.totalReviews ?? 0} reviews</p>
                </div>

                {doctor.about ? (
                  <p className="mt-4 text-sm leading-6 text-slate-600">{doctor.about}</p>
                ) : null}

                <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-sm text-slate-500">
                    {doctor.userId?.email || 'Email not available'}
                  </div>
                  <Link
                    to={`/patient/book/${doctor._id}`}
                    className="rounded-full bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
                  >
                    Book Appointment
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
