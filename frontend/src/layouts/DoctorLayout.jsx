import { Outlet } from 'react-router-dom';
import TopNav from '../components/ui/TopNav';
import Sidebar from '../components/ui/Sidebar';
import Container from '../components/ui/Container';

export default function DoctorLayout() {
  const sidebarLinks = [
    { to: '/doctor/dashboard', label: 'Dashboard' },
    { to: '/doctor/appointments', label: 'Appointments' },
    { to: '/doctor/patients', label: 'My Patients' },
    { to: '/doctor/schedule', label: 'Schedule' },
    { to: '/doctor/profile', label: 'Profile' }
  ];

  return (
    <div className="min-h-screen bg-green-50">
      <TopNav title="MediLink Doctor" links={[]} role="doctor" />
      <div className="flex max-w-7xl mx-auto px-6 py-8 gap-6">
        <Sidebar links={sidebarLinks} role="doctor" />
        <div className="flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
}