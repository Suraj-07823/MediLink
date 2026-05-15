# MediLink — Project Guide

> A role-based healthcare platform connecting patients and doctors with slot-based scheduling, QR/OTP check-in, digital prescriptions, and JWT authentication.

**Developer:** Suraj Vishwakarma
**GitHub:** [github.com/Suraj-07823](https://github.com/Suraj-07823)
**LinkedIn:** [linkedin.com/in/suraj-vishwakarma-a281a6261](https://linkedin.com/in/suraj-vishwakarma-a281a6261)
**Type:** B.Tech CSE Final Year Project · Startup Potential

---

## Table of Contents

1. [Overview](#1-overview)
2. [Tech Stack](#2-tech-stack)
3. [System Architecture](#3-system-architecture)
4. [Project Flow](#4-project-flow)
5. [User Roles & Features](#5-user-roles--features)
6. [Security & Auth Flow](#6-security--auth-flow)
7. [Data Models](#7-data-models)
8. [API Reference](#8-api-reference)
9. [Environment Variables](#9-environment-variables)
10. [CI/CD Pipeline](#10-cicd-pipeline)
11. [Error Handling Strategy](#11-error-handling-strategy)
12. [Logging Strategy](#12-logging-strategy)

---

## 1. Overview

MediLink is a full-stack healthcare platform with three user roles — **Patient**, **Doctor**, and **Admin**. It provides:

- Slot-based appointment booking
- QR / OTP check-in on appointment day
- Digital prescription upload and access (AWS S3)
- Admin-gated doctor approval workflow
- JWT access token + rotating refresh token authentication
- Rate limiting, account lockout, and input validation

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js + Vite |
| Styling | Tailwind CSS |
| Backend | Node.js + Express.js |
| Database | MongoDB (Mongoose) |
| Authentication | JWT (access token) + Refresh token (httpOnly cookie) |
| Input Validation | Zod |
| File Storage | AWS S3 |
| Cloud Hosting | AWS EC2 |
| Containers | Docker + Docker Compose |
| Reverse Proxy | Nginx |
| CI/CD | GitHub Actions |
| Testing | Jest + Supertest |
| Logging | Winston + Morgan |
| Rate Limiting | express-rate-limit |

---

## 3. System Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                        Infrastructure                            │
│   Nginx (reverse proxy + SSL)   ←→   Docker Compose             │
│                        AWS EC2 (host)                            │
│                                                                  │
│  ┌─────────────────┐   ┌──────────────────────┐   ┌──────────┐  │
│  │    Frontend      │   │       Backend         │   │   DB     │  │
│  │                  │   │                       │   │          │  │
│  │  React + Vite    │──▶│  Express Router       │──▶│ MongoDB  │  │
│  │  Axios Client    │   │  Zod Validation       │   │          │  │
│  │                  │   │  Auth + Rate Limiter  │   └──────────┘  │
│  │  /api/auth       │   │  Account Lockout      │                  │
│  │  /api/patient    │   │  Controllers          │──▶  AWS S3       │
│  │  /api/doctor     │   │  JWT / Refresh Token  │  (prescriptions) │
│  │  /api/admin      │   │  Winston Logging      │                  │
│  └─────────────────┘   └──────────────────────┘                  │
└──────────────────────────────────────────────────────────────────┘
```

### Layer Breakdown

**Frontend** — React UI handles navigation, role-based dashboards, forms, and Axios HTTP calls to the backend API.

**Backend** — Express routes pass through Zod validation → rate limiting → JWT auth middleware → role authorization → controllers → MongoDB.

**Database** — MongoDB stores Users, Doctors, Appointments, Prescriptions, and Medical Records.

**File Storage** — AWS S3 stores prescription PDFs uploaded by doctors. Signed URLs are returned to patients for secure access.

**Infrastructure** — Docker Compose orchestrates frontend, backend, and MongoDB containers. Nginx acts as a reverse proxy with SSL termination. Hosted on AWS EC2.

---

## 4. Project Flow

### Login / Register Flow

```
User
 │
 ├─▶ POST /api/auth/register or /api/auth/login
 │        │
 │        ▼
 │   Zod validates input
 │        │
 │        ▼
 │   Rate limiter check (express-rate-limit)
 │        │
 │        ▼
 │   Account lockout check (loginAttempts, lockUntil)
 │        │
 │        ▼
 │   MongoDB: validate credentials / create user
 │        │
 │        ├─▶ Issue access token (JWT, 15 min, returned in response body)
 │        └─▶ Issue refresh token (JWT, 7d, set as httpOnly cookie)
 │
 ├─▶ Doctor? → show "Pending Approval" screen until admin approves
 └─▶ Approved / Patient / Admin? → redirect to role dashboard
```

### Appointment Booking Flow

```
Patient selects doctor + slot
 │
 ▼
POST /api/patient/appointments  (JWT required)
 │
 ▼
Backend validates slot availability
 │
 ▼
MongoDB: create Appointment document (status: pending)
 │
 ▼
QR code / OTP generated and stored (hashed)
 │
 ▼
Patient checks in on appointment day via POST /api/patient/checkin
 │
 ▼
Backend verifies QR / OTP → sets checkedIn: true
 │
 ▼
Doctor updates status → completed → uploads prescription to S3
```

---

## 5. User Roles & Features

### Patient

- Register, login, manage profile
- Browse doctors by specialty
- Book slot-based appointments
- QR / OTP check-in on appointment day
- View appointment history and status
- Access digital prescriptions and medical records

### Doctor

- Register and await admin approval before dashboard access
- Set availability and manage appointment slots
- View patient details and history
- Upload and issue digital prescriptions (stored on AWS S3)
- Update appointment status (pending → confirmed → completed)
- Participate in consultation workflows

### Admin

- Approve or reject doctor registrations
- Manage all users, doctors, and appointments
- Monitor system health and flagged accounts
- Full audit log: who approved whom, and when
- Account lockout controls for repeated failed logins

---

## 6. Security & Auth Flow

### Token Strategy

| Token | Storage | TTL | Notes |
|---|---|---|---|
| Access Token | Memory (JS variable) | 15 minutes | Never in localStorage |
| Refresh Token | httpOnly cookie | 7 days | Rotated on every use |

### Flow

```
Frontend                           Backend
   │                                  │
   ├──POST /api/auth/login──────────▶│
   │                                  ├─ Validate credentials
   │                                  ├─ Check account lockout
   │◀── access token (body) ─────────┤
   │◀── refresh token (httpOnly) ────┤
   │                                  │
   ├── protected request + Bearer ──▶│
   │                                  ├─ Verify access token
   │◀── response ────────────────────┤
   │                                  │
   │  [access token expires]          │
   ├──POST /api/auth/refresh ────────▶│
   │                                  ├─ Verify refresh token
   │                                  ├─ Rotate refresh token (invalidate old)
   │◀── new access token (body) ─────┤
   │◀── new refresh token (cookie) ──┤
```

### Additional Security Measures

- **Rate limiting** — `express-rate-limit` on all auth routes (e.g. max 10 requests / 15 min window)
- **Account lockout** — 5 failed login attempts triggers a timed lockout stored in `loginAttempts` and `lockUntil` fields
- **Input validation** — Zod schema validation on every route before hitting controllers. Returns 400 with field-level errors
- **Refresh token hashing** — Refresh tokens are hashed before storage in MongoDB. Raw token is never persisted
- **CORS** — Configured to allow only trusted origins
- **Helmet.js** — HTTP security headers on all responses
- **Data at rest** — Prescriptions stored in private S3 bucket. Access via signed URLs with short TTL

---

## 7. Data Models

### User

```js
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (bcrypt hashed),
  role: 'patient' | 'doctor' | 'admin',
  loginAttempts: Number (default: 0),
  lockUntil: Date,
  refreshToken: String (hashed),
  createdAt: Date,
  updatedAt: Date
}
```

### Doctor

```js
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  specialty: String,
  licenseNumber: String,
  approvalStatus: 'pending' | 'approved' | 'rejected',
  availability: [
    { day: String, slots: [String] }
  ],
  bio: String,
  createdAt: Date
}
```

### Appointment

```js
{
  _id: ObjectId,
  patientId: ObjectId (ref: User),
  doctorId: ObjectId (ref: Doctor),
  slotTime: Date,
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled',
  qrCode: String,
  otpHash: String,
  checkedIn: Boolean (default: false),
  notes: String,
  createdAt: Date
}
```

### Prescription

```js
{
  _id: ObjectId,
  appointmentId: ObjectId (ref: Appointment),
  doctorId: ObjectId (ref: Doctor),
  patientId: ObjectId (ref: User),
  medicines: [
    { name: String, dosage: String, duration: String }
  ],
  instructions: String,
  fileUrl: String (AWS S3 signed URL),
  createdAt: Date
}
```

### AuditLog (Admin actions)

```js
{
  _id: ObjectId,
  adminId: ObjectId (ref: User),
  action: String,         // e.g. 'APPROVE_DOCTOR'
  targetId: ObjectId,     // ref to affected document
  targetModel: String,    // 'Doctor' | 'User' | 'Appointment'
  metadata: Object,       // extra context
  createdAt: Date
}
```

---

## 8. API Reference

### System Routes

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/health` | — | Health check for monitoring/deployment |

### Auth Routes

| Method | Endpoint | Auth | Description |
|---|---|---|
| POST | `/api/auth/register` | — | Register new user |
| POST | `/api/auth/login` | — | Login, returns JWT + sets httpOnly cookie |
| POST | `/api/auth/refresh` | Cookie | Rotate refresh token, issue new access token |
| POST | `/api/auth/logout` | JWT | Invalidate refresh token |

### Patient Routes

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/patient/profile` | JWT (patient) | View own profile |
| PUT | `/api/patient/profile` | JWT (patient) | Update own profile |
| GET | `/api/patient/doctors` | JWT (patient) | Browse available doctors |
| GET | `/api/patient/appointments` | JWT (patient) | List own appointments |
| POST | `/api/patient/appointments` | JWT (patient) | Book an appointment |
| DELETE | `/api/patient/appointments/:id` | JWT (patient) | Cancel appointment |
| POST | `/api/patient/checkin` | JWT (patient) | QR / OTP check-in |
| GET | `/api/patient/prescriptions` | JWT (patient) | View own prescriptions |

### Doctor Routes

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/doctor/appointments` | JWT (doctor) | View scheduled appointments |
| PATCH | `/api/doctor/appointments/:id` | JWT (doctor) | Update appointment status |
| POST | `/api/doctor/prescriptions` | JWT (doctor) | Upload prescription (S3) |
| GET | `/api/doctor/prescriptions` | JWT (doctor) | View issued prescriptions |
| PUT | `/api/doctor/availability` | JWT (doctor) | Set available slots |
| GET | `/api/doctor/patients/:id` | JWT (doctor) | View patient detail |

### Admin Routes

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/admin/doctors` | JWT (admin) | List all doctor registrations |
| PATCH | `/api/admin/doctors/:id/approve` | JWT (admin) | Approve or reject doctor |
| GET | `/api/admin/users` | JWT (admin) | List all users |
| DELETE | `/api/admin/users/:id` | JWT (admin) | Remove user account |
| GET | `/api/admin/appointments` | JWT (admin) | View all appointments |
| GET | `/api/admin/audit-logs` | JWT (admin) | View admin action history |

---

## 9. Environment Variables

Create a `.env` file in `/backend`:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/medilink

# JWT
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=your_refresh_secret_here
REFRESH_TOKEN_EXPIRES=7d

# AWS
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_REGION=ap-south-1
S3_BUCKET_NAME=medilink-prescriptions

# Rate Limiting
RATE_LIMIT_WINDOW_MS=3600000
RATE_LIMIT_MAX=60

# CORS
CLIENT_URL=http://localhost:5173
```

---

## 10. CI/CD Pipeline

Pipeline runs on every push to `main` via GitHub Actions.

```
Developer pushes to main / opens PR
            │
            ▼
    GitHub Actions triggered
            │
     ┌──────┴───────┐
     ▼              ▼
  Install deps    Lint (ESLint)
     │              │
     └──────┬───────┘
            ▼
     Unit tests (Jest + Supertest)
            │
            ▼
     Build frontend (Vite)
            │
            ▼
     Docker image build (multi-stage)
            │
            ▼
     Push to AWS ECR (tagged with commit SHA)
            │
            ▼
     SSH into EC2 → docker compose up -d
            │
            ▼
     Smoke test: GET /api/health
            │
     ┌──────┴───────┐
     ▼              ▼
  Pass: done    Fail: rollback to
                previous ECR tag
```

### GitHub Actions Workflow Summary

```yaml
# .github/workflows/deploy.yml (summary)
on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - Install dependencies
      - Run ESLint
      - Run Jest tests

  build-and-deploy:
    needs: test
    steps:
      - Build Docker images
      - Push to AWS ECR
      - SSH into EC2
      - Pull and run latest images
      - Health check + rollback on failure
```

---

## 11. Error Handling Strategy

All errors are caught by a global Express error handler and returned in a consistent format:

```json
{
  "success": false,
  "error": "Human-readable message",
  "code": "ERROR_CODE"
}
```

### Error Types

| HTTP Status | Code | Cause |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Zod schema violation — includes field-level detail |
| 401 | `UNAUTHORIZED` | Missing, invalid, or expired access token |
| 403 | `FORBIDDEN` | Valid token but insufficient role |
| 404 | `NOT_FOUND` | Resource does not exist |
| 409 | `CONFLICT` | Duplicate email, slot already booked, etc. |
| 429 | `RATE_LIMITED` | Too many requests — includes `Retry-After` header |
| 423 | `ACCOUNT_LOCKED` | Too many failed login attempts |
| 500 | `INTERNAL_ERROR` | Unhandled exception — no internal detail leaked to client |

### Global Error Handler (Express)

```js
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const code = err.code || 'INTERNAL_ERROR';
  const message = status === 500 ? 'Something went wrong' : err.message;

  // Log full error internally
  logger.error({ code, message: err.message, stack: err.stack });

  res.status(status).json({ success: false, error: message, code });
});
```

---

## 12. Logging Strategy

| Logger | Purpose |
|---|---|
| Morgan | HTTP request logs (method, route, status, response time) |
| Winston | Application logs: errors, auth events, admin actions |

### Log Levels

```
error   → unhandled exceptions, DB failures
warn    → failed logins, rate limit hits, account lockouts
info    → successful auth, appointment created, prescription uploaded
debug   → detailed flow (dev only)
```

### Log Format (Winston)

```json
{
  "level": "warn",
  "message": "Failed login attempt",
  "userId": "64abc...",
  "ip": "103.x.x.x",
  "timestamp": "2025-05-15T10:32:00Z"
}
```

Logs are written to:
- `logs/error.log` — errors only
- `logs/combined.log` — all levels
- Console in development

---

## Project Status

| Phase | Description | Status |
|---|---|---|
| 1 | Auth system (register, login, JWT, refresh) | ✅ Complete |
| 2 | Doctor registration + admin approval | ✅ Complete |
| 3 | Appointment booking + slot management | 🔄 In Progress |
| 4 | QR / OTP check-in | 🔄 In Progress |
| 5 | Prescription upload (AWS S3) | ⏳ Planned |
| 6 | Patient medical records | ⏳ Planned |
| 7 | Docker + Nginx deployment | ⏳ Planned |
| 8 | GitHub Actions CI/CD | ⏳ Planned |

---

*MediLink — Built by Suraj Vishwakarma | B.Tech CSE, Nagpur*