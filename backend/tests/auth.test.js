const request = require('supertest');
const mongoose = require('mongoose');
const express = require('express');
const bcrypt = require('bcryptjs');

// Minimal express app for testing
const app = express();
app.use(express.json());

const authRoutes = require('../routes/auth');
app.use('/api/auth', authRoutes);

const User = require('../models/User');

const TEST_MONGO_URI = process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/medilink_test';

beforeAll(async () => {
  await mongoose.connect(TEST_MONGO_URI);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

afterEach(async () => {
  await User.deleteMany({});
});

describe('POST /api/auth/register', () => {
  it('registers a patient successfully', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test Patient',
      email: 'patient@test.com',
      phone: '9876543210',
      password: 'password123',
      role: 'patient'
    });
    expect(res.statusCode).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe('patient');
  });

  it('rejects duplicate email', async () => {
    const data = { name: 'A', email: 'a@test.com', phone: '9876543210', password: 'pass123', role: 'patient' };
    await request(app).post('/api/auth/register').send(data);
    const res = await request(app).post('/api/auth/register').send(data);
    expect(res.statusCode).toBe(409);
  });

  it('rejects non-patient role', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Doc', email: 'doc@test.com', phone: '9876543210', password: 'pass123', role: 'doctor'
    });
    expect(res.statusCode).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    const hashed = await bcrypt.hash('password123', 10);
    await User.create({ name: 'Test', email: 'test@test.com', phone: '9876543210', password: hashed, role: 'patient' });
  });

  it('logs in with correct credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'test@test.com', password: 'password123' });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it('rejects wrong password', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'test@test.com', password: 'wrongpass' });
    expect(res.statusCode).toBe(401);
  });

  it('rejects unknown email', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'nobody@test.com', password: 'password123' });
    expect(res.statusCode).toBe(401);
  });
});
