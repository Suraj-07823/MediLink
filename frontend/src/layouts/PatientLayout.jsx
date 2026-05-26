import { Outlet } from 'react-router-dom';
import TopNav from '../components/ui/TopNav';
import Container from '../components/ui/Container';

export default function PatientLayout() {
  const links = [
    { to: '/patient/dashboard',    label: 'Dashboard' },
    { to: '/patient/doctors',      label: 'Find Doctors' },
    { to: '/patient/appointments', label: 'Appointments' },
    { to: '/patient/records',      label: 'Medical Records' },
    { to: '/patient/prescriptions',label: 'Prescriptions' }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <TopNav title="🏥 MediLink" links={links} role="patient" />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <Outlet />
      </main>
    </div>
  );
}