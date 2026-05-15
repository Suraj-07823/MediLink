# MediLink Project Guide

## 1. Overview
MediLink is a healthcare platform with role-based access for patients, doctors, and admins. The project includes a React/Tailwind frontend, an Express/MongoDB backend, and security features like JWT authentication, refresh token rotation, account lockout, and encrypted medical data storage.

## 2. Architecture
The application follows a layered web architecture with explicit validation, security, and storage flows.

```mermaid
flowchart TB
  subgraph frontend [Frontend]
    A[React + Vite UI] --> B[Axios HTTP Client]
    B --> C[/api/auth\n/api/patient\n/api/doctor\n/api/admin/]
  end

  subgraph backend [Backend]
    C --> D[Express Router Layer]
    D --> X[Input Validation Middleware]\n    X --> E[Authentication / Authorization]
    E --> L[Account Lockout Logic]
    X --> F[Business Logic / Controllers]
    F --> G[MongoDB Data Models]
    F --> S[File Storage Service]\n    E --> H[JWT Access Token / Refresh Token]
  end

  subgraph db [Database]
    G --> I[(MongoDB)]
    S --> J[(AWS S3 or object storage)]
  end

  subgraph infra [Infrastructure]
    M[Docker / Docker Compose / ECS]
    N[Nginx Reverse Proxy]
    M --> frontend
    M --> backend
    M --> db
    N --> frontend
    N --> backend
  end
```

### Explanation
- **Input validation middleware**: Uses Zod or Joi to validate request bodies before controller logic.
- **Frontend**: React handles forms, role-based routing, and protected views.
- **Backend**: Express routers enforce auth, rate limiting, validation, lockout, and business rules.
- **Account lockout logic**: Prevents brute-force login by counting failed attempts and locking the account temporarily.
- **Token security**: Access token is short-lived (`1h`), refresh token is long-lived and stored as a secure `httpOnly` cookie, not in localStorage.
- **File storage**: Prescription files or uploads can be persisted in AWS S3 or any secure object storage and referenced from MongoDB.
- **Encryption at rest**: Sensitive collections such as medical records and prescriptions should use database encryption-at-rest and optionally field-level encryption for critical fields.
- **Infrastructure**: Docker or AWS ECS can orchestrate frontend/backend/db deployments.

## 3. Project Flow
This section describes the main runtime flow.

```mermaid
sequenceDiagram
  participant U as User
  participant F as Frontend
  participant B as Backend
  participant V as Validator
  participant DB as MongoDB
  participant S as S3

  U->>F: Open app / login/register
  F->>B: POST /api/auth/login or /api/auth/register
  B->>V: validate request body
  V-->>B: validated request
  B->>DB: validate user / create user
  DB-->>B: response
  B-->>F: access token + refresh token cookie
  F->>U: show dashboard or pending state

  alt Doctor login and approval pending
    F->>U: show pending screen
  else Doctor approved
    F->>U: show doctor dashboard
  end

  U->>F: book appointment / view records
  F->>B: authenticated API calls
  B->>B: authorization and lockout checks
  B->>DB: read/write appointment or medical records
  DB-->>B: return data
  B-->>F: send data back

  alt prescription upload
    F->>B: upload prescription file
    B->>S: store file in S3
    S-->>B: file URL
    B->>DB: save prescription metadata
  end
end
```

### Explanation
- **Validation first**: Requests are checked by middleware before controller logic.
- **Auth flow**: Successful login returns a JWT and sets an `httpOnly` refresh token cookie.
- **Doctor approval**: Doctors are redirected to pending status until admin approval.
- **File storage**: Prescription files can move to S3, with metadata stored in MongoDB.
- **Real-time updates**: If appointment status updates are needed in real time, the app can use polling or WebSocket notifications from backend to frontend.

## 4. CI/CD Flow
A typical CI/CD process for MediLink on AWS.

```mermaid
flowchart TD
  A[Developer Pushes Code] --> B[Source Control (Git)]
  B --> C[CI Pipeline]
  C --> D[Install Dependencies]
  C --> E[Run Tests (Jest + Supertest)]
  C --> F[Build Frontend & Backend]
  C --> G[Security / Lint Checks]
  C --> H[Build Docker Images]
  H --> I[Push Images to ECR]
  I --> J[Deploy to ECS / EC2]
  J --> K[Environment-specific config: dev/staging/prod]
  K --> L[Run Smoke Tests]
```

### Explanation
- **Test framework**: Backend tests are implemented with Jest and Supertest; frontend tests can use Jest or React Testing Library.
- **Docker build**: Builds separate frontend/backend images.
- **Container registry**: Push built images to AWS ECR.
- **Deployment**: Deploy containers to AWS ECS or EC2.
- **Environment configs**: Use different `.env` values for dev, staging, and prod.

## 5. User Interaction
MediLink has three main user roles with distinct interactions.

### Patient
- Register and login
- Book appointments with doctors
- View appointment history
- Access medical records and prescriptions

### Doctor
- Register and wait for admin approval
- Manage availability and appointments
- View patient details and upload prescriptions
- Update appointment status

### Admin
- Approve or reject doctor registrations
- Manage users, doctors, and appointments
- Monitor system activity
- Review audit logs for approvals and changes

## 6. Security & Token Flow
The auth flow uses a short-lived access token and a secure refresh token.

```mermaid
flowchart LR
  U[User] --> F[Frontend]
  F --> B[Backend Auth]
  B -->|access token| F
  B -->|refresh token httpOnly cookie| F
  F -->|protected request| B
  B -->|verify access token| B
  alt access token expired
    F --> B: POST /api/auth/refresh
    B -->|rotate refresh token| F
    B -->|new access token| F
  end
```

### Explanation
- **Access Token**: Short-lived JWT used for API authorization.
- **Refresh Token**: Stored securely as an `httpOnly`, `Secure` cookie and rotated on each refresh.
- **LocalStorage**: Refresh tokens are not stored in localStorage for security reasons.
- **Rate limiting**: `express-rate-limit` is applied to sensitive routes like login.
- **Account lockout**: Tracks failed logins and temporarily locks the account after repeated failures.
- **Encryption at rest**: Sensitive collections such as medical records and prescriptions should be protected with database encryption-at-rest and optionally field-level encryption.

## 7. Data Models
Key collections and relationships.

### User
- `name`, `email`, `phone`, `password`
- `role`: `patient`, `doctor`, or `admin`
- `isVerified`, `isActive`
- `failedLoginCount`, `lockedUntil`
- `speciality`, `qualification`, `experience`, `regNumber` for doctors
- Relationship: a doctor has one `Doctor` profile, a patient may have one `MedicalRecord`

### Doctor
- `userId` → User
- `speciality`, `qualification`, `experience`, `regNumber`
- `consultationFee`, `clinicName`, `clinicAddress`
- `status`: `pending` / `approved` / `rejected`

### Appointment
- `patientId` → User
- `doctorId` → Doctor
- `date`, `timeSlot`, `status`
- `consultationReason`, `notes`, `qrCode`

### Prescription
- `appointmentId` → Appointment
- `doctorId`, `patientId`
- `medicines`, `instructions`
- `fileUrl` for uploaded prescription files stored in S3 or object storage

### MedicalRecord
- `patientId` → User
- `allergies`, `chronicDiseases`, `pastSurgeries`, `currentMedicines`
- `emergencyContact`
- `createdAt`, `updatedAt`

## 8. Environment Variables
Required env vars for development and deployment.

```text
PORT=5000
NODE_ENV=development
JWT_SECRET=your_jwt_secret
REFRESH_SECRET=your_refresh_secret
MONGO_URI=mongodb://localhost:27017/medilink
CORS_ORIGIN=http://localhost:5173
AWS_S3_BUCKET=your_s3_bucket_name
AWS_ACCESS_KEY_ID=your_aws_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_REGION=your_aws_region
ECR_REPOSITORY=your_ecr_repo
DATABASE_ENCRYPTION_KEY=optional_field_encryption_key
```

## 9. API Endpoints Reference
Basic route table.

| Route | Method | Auth Required | Roles | Description |
|---|---|---|---|---|
| `/api/auth/register` | POST | No | patient, admin | Register patient or admin user |
| `/api/auth/register-doctor` | POST | No | doctor | Register a doctor for approval |
| `/api/auth/login` | POST | No | all | Login and receive access + refresh tokens |
| `/api/auth/refresh` | POST | No (cookie) | all | Refresh access token |
| `/api/auth/logout` | POST | No (cookie) | all | Revoke refresh token and logout |
| `/api/auth/me` | GET | Yes | all | Get current authenticated user |
| `/api/doctors` | GET | Yes | all | List doctors |
| `/api/appointments` | POST | Yes | patient | Book appointment |
| `/api/appointments` | GET | Yes | patient, doctor | Fetch appointments |
| `/api/prescriptions` | POST | Yes | doctor | Create prescription |
| `/api/medical-records` | POST | Yes | patient, doctor | Create or update medical record |

## 10. Error Handling Strategy
The backend uses a global error handler and standardized response format.

- **Validation errors**: return `400 Bad Request` with field-specific messages.
- **Authentication/authorization errors**: return `401 Unauthorized` or `403 Forbidden`.
- **Not found**: return `404 Not Found` for unknown routes or resources.
- **Server errors**: return `500 Internal Server Error` with a generic message in production.
- **Standard response format**:

```json
{
  "message": "Error message",
  "error": "detailed error info",
  "fields": { "fieldName": "validation issue" }
}
```

## 11. Logging & Audit
Logging and audit strategy for healthcare security and compliance.

- **Request logging**: Use Morgan for HTTP request logging in development.
- **Application logging**: Use Winston for structured logs, error tracking, and audit trails.
- **Admin audit logs**: Track actions like doctor approval, role changes, and critical updates with timestamps and admin IDs.
- **Security logs**: Capture failed login attempts, account lockouts, refresh token usage, and suspicious activity.

## 12. How to Use This Guide
- Use architecture diagrams to understand the system flow.
- Use data model and API sections to connect frontend features with backend implementation.
- Use CI/CD and env var sections for deployment planning.
- Use error and logging sections to guide production hardening.
