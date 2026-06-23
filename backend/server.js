const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const connectDatabase = require('./config/db');
const redis = require('./config/redis');
const mongoose = require('mongoose');

const app = express();
connectDatabase();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Service Routers
app.use('/api/auth', require('./services/auth/router'));
app.use('/api/patients', require('./services/patient/router'));
app.use('/api/appointments', require('./services/appointment/router'));
app.use('/api/clinical', require('./services/clinical/router'));
app.use('/api/admin', require('./services/admin/router'));

app.get('/api/health', async (req, res) => {
  const redisPing = await redis.ping().catch(() => 'error');
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      redis: redisPing === 'PONG' ? 'connected' : 'disconnected'
    }
  });
});

app.use('*', (req, res) => res.status(404).json({ message: 'Route not found' }));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`MediLink Gateway Running on port ${PORT}`));
