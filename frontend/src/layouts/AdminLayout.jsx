import { Outlet } from 'react-router-dom';
import TopNav from '../components/ui/TopNav';
import Sidebar from '../components/ui/Sidebar';

export default function AdminLayout() {
  const sidebarLinks = [
    { to: '/admin/dashboard', label: 'Dashboard' },
    { to: '/admin/doctors', label: 'Manage Doctors' },
    { to: '/admin/patients', label: 'Manage Patients' },
    { to: '/admin/appointments', label: 'All Appointments' },
    { to: '/admin/analytics', label: 'Analytics' }
  ];

  return (
    <div className="min-h-screen bg-purple-50">
      <TopNav title="MediLink Admin" links={[]} role="admin" />
      <div className="flex max-w-7xl mx-auto px-6 py-8 gap-6">
        <Sidebar links={sidebarLinks} role="admin" />
        <div className="flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
}