import { Outlet } from 'react-router-dom';
import TopNav from '../components/ui/TopNav';
import Sidebar from '../components/ui/Sidebar';

export default function AdminLayout() {
  const sidebarLinks = [
    { to: '/admin/dashboard',    label: 'Dashboard',    icon: '🏠' },
    { to: '/admin/doctors',      label: 'Manage Doctors', icon: '👨‍⚕️' },
    { to: '/admin/patients',     label: 'Patients',     icon: '👥' },
    { to: '/admin/appointments', label: 'Appointments', icon: '📅' },
    { to: '/admin/analytics',    label: 'Analytics',    icon: '📊' }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <TopNav title="MediLink Admin" links={[]} role="admin" />
      <div className="flex max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 gap-6">
        <Sidebar links={sidebarLinks} role="admin" />
        <div className="flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
}