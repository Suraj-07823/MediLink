import { Outlet } from 'react-router-dom';
import TopNav from '../components/ui/TopNav';
import Container from '../components/ui/Container';

export default function PatientLayout() {
  const links = [
    { to: '/patient/dashboard', label: 'Dashboard' },
    { to: '/patient/doctors', label: 'Find Doctors' },
    { to: '/patient/appointments', label: 'My Appointments' },
    { to: '/patient/records', label: 'Medical Records' },
    { to: '/patient/prescriptions', label: 'Prescriptions' }
  ];

  return (
    <div className="min-h-screen bg-blue-50">
      <TopNav title="MediLink Patient" links={links} role="patient" />
      <Container>
        <Outlet />
      </Container>
    </div>
  );
}