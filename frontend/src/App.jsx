import { Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Doctors from './pages/Doctors';
import Dashboard from './pages/Dashboard';
import Booking from './pages/Booking';
import CheckIn from './pages/CheckIn';
import Prescription from './pages/Prescription';

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('medilink_token'));

  useEffect(() => {
    if (token) {
      setUser(JSON.parse(localStorage.getItem('medilink_user')));
      axios.defaults.headers.common.Authorization = `Bearer ${token}`;
    }
  }, [token]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar user={user} setUser={setUser} setToken={setToken} />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/doctors" element={<Doctors />} />
          <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/" />} />
          <Route path="/booking/:doctorId" element={user ? <Booking /> : <Navigate to="/" />} />
          <Route path="/checkin" element={user ? <CheckIn /> : <Navigate to="/" />} />
          <Route path="/prescription" element={user ? <Prescription /> : <Navigate to="/" />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
