import { Outlet } from 'react-router-dom';
import TopNav from '../components/ui/TopNav';
import Container from '../components/ui/Container';

export default function PatientLayout() {
  const links = [
    { to: '/dashboard',    label: 'Dashboard' },
    { to: '/dashboard/doctors',      label: 'Find Doctors' },
    { to: '/dashboard/appointments', label: 'Appointments' },
    { to: '/dashboard/prescriptions',label: 'Prescriptions' }
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