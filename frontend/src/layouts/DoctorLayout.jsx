import { Outlet } from 'react-router-dom';
import TopNav from '../components/ui/TopNav';
import Sidebar from '../components/ui/Sidebar';

export default function DoctorLayout() {
  const sidebarLinks = [
    { to: '/doctor/dashboard',    label: 'Dashboard',    icon: '🏠' },
    { to: '/doctor/appointments', label: 'Appointments', icon: '📅' },
    { to: '/doctor/patients',     label: 'My Patients',  icon: '👥' },
    { to: '/doctor/schedule',     label: 'Schedule',     icon: '🗓️' },
    { to: '/doctor/profile',      label: 'Profile',      icon: '👤' }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <TopNav title="MediLink Clinic" links={[]} role="doctor" />
      <div className="flex max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 gap-6">
        <Sidebar links={sidebarLinks} role="doctor" />
        <div className="flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
}