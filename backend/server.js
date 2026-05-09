const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDatabase = require('./config/db');
const authRoutes = require('./routes/auth');
const doctorRoutes = require('./routes/doctors');
const appointmentRoutes = require('./routes/appointments');
const prescriptionRoutes = require('./routes/prescriptions');

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

connectDatabase();

const Doctor = require('./models/Doctor');

const seedDoctors = async () => {
  const count = await Doctor.countDocuments();
  if (count === 0) {
    await Doctor.create([
      { name: 'Dr. Maya Khan', speciality: 'Cardiology', location: 'Central Clinic', slots: ['09:00', '10:00', '14:00'], description: 'Expert in cardiovascular health.' },
      { name: 'Dr. Raj Patel', speciality: 'Orthopedics', location: 'Westside Hospital', slots: ['11:00', '13:00', '16:00'], description: 'Bone and joint specialist.' },
      { name: 'Dr. Aisha Ahmed', speciality: 'Dermatology', location: 'Sunshine Medical', slots: ['08:30', '12:00', '15:30'], description: 'Skin and cosmetic care.' }
    ]);
    console.log('Seeded initial doctors');
  }
};

seedDoctors().catch((error) => console.error('Doctor seed failed:', error.message));

app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/prescriptions', prescriptionRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'MediLink backend' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
