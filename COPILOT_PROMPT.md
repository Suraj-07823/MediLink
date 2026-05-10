
---

## Who I am
I am a beginner developer building a healthcare startup called **MediLink**.
I am from Nagpur, India. I use Windows 11, VS Code, and PowerShell.
I need clear explanations for every piece of code — not just the code itself.

---

## What MediLink is
MediLink is a full-stack healthcare appointment platform for Nagpur (expanding to all of India later).

**The core flow:**
1. Patient creates account → fills health profile
2. Patient searches for nearby doctors (by city + GPS)
3. Patient books an appointment slot
4. Patient receives a QR code + 6-digit OTP via Email AND WhatsApp
5. Patient visits clinic → receptionist scans QR or enters OTP → patient is checked in
6. Doctor sees patient, writes digital prescription
7. Patient sees prescription + full medical record in their account

---

## Three user roles

### Patient
- Register with name, email, phone, date of birth, gender, blood group, address
- Search doctors by speciality + city OR by GPS location
- Book appointment slots
- Receive QR + OTP on email and WhatsApp after booking
- View prescriptions and medical history in dashboard

### Doctor
- Register with medical registration number, qualification, speciality
- Upload documents (degree certificate, registration certificate)
- Wait for Admin approval before going live
- Set weekly schedule (days + time slots + max patients per slot)
- Set consultation fee in ₹ (rupees)
- See today's patient list
- Write prescriptions after consultation

### Admin (just me — one account)
- Login with special admin credentials
- See all doctor applications with their documents
- Approve or reject doctor registrations
- View all users, appointments, analytics
- Monitor the entire platform

---

## Tech Stack

### Backend
- **Runtime:** Node.js with Express.js
- **Database:** MongoDB with Mongoose
- **Auth:** JWT (JSON Web Tokens) + bcryptjs for passwords
- **File uploads:** Multer (for doctor documents)
- **QR Code:** qrcode npm package
- **Email:** Nodemailer with Gmail SMTP
- **WhatsApp:** Twilio API
- **PDF generation:** pdfkit (for prescriptions)
- **Environment variables:** dotenv

### Frontend
- **Framework:** React 18 with Vite
- **Routing:** React Router DOM v6
- **Styling:** Tailwind CSS
- **HTTP requests:** Axios
- **QR Scanner:** react-qr-reader (for receptionist check-in)

### Infrastructure
- **Containerization:** Docker + Docker Compose
- **Reverse proxy:** Nginx
- **Database container:** MongoDB 6.0

---

## MongoDB Collections (Database Design)

### 1. Users collection
```js
{
  name: String,           // full name
  email: String,          // unique, for login
  phone: String,          // for WhatsApp OTP
  password: String,       // bcrypt hashed
  role: String,           // "patient" | "doctor" | "admin"
  dateOfBirth: Date,
  gender: String,         // "male" | "female" | "other"
  bloodGroup: String,     // "A+", "B+", "O+"...
  address: {
    area: String,
    city: String,         // default: Nagpur
    pincode: String,
    state: String
  },
  profilePhoto: String,   // image URL
  isVerified: Boolean,    // email verified
  isActive: Boolean,      // account active
  createdAt: Date
}
```

### 2. Doctors collection
```js
{
  userId: ObjectId,       // ref: Users
  speciality: String,     // "Cardiology", "ENT", "Dermatology"...
  qualification: String,  // "MBBS", "MD", "MS"...
  experience: Number,     // years
  regNumber: String,      // medical council registration number
  consultationFee: Number,// in rupees ₹
  clinicName: String,
  clinicAddress: {
    area: String,
    city: String,
    pincode: String
  },
  location: {
    type: { type: String, default: "Point" },
    coordinates: [Number] // [longitude, latitude] for GPS search
  },
  about: String,          // doctor bio
  documents: [{
    name: String,         // "degree", "registration"
    url: String           // uploaded file URL
  }],
  status: String,         // "pending" | "approved" | "rejected"
  rejectionReason: String,// if rejected by admin
  avgRating: Number,      // calculated from reviews
  totalReviews: Number
}
```

### 3. Slots collection
```js
{
  doctorId: ObjectId,     // ref: Doctors
  dayOfWeek: String,      // "Monday", "Tuesday"...
  startTime: String,      // "09:00"
  endTime: String,        // "10:00"
  maxPatients: Number,    // capacity
  isActive: Boolean       // can turn slot on/off
}
```

### 4. Appointments collection
```js
{
  patientId: ObjectId,    // ref: Users
  doctorId: ObjectId,     // ref: Doctors
  date: Date,             // appointment date
  timeSlot: String,       // "09:00"
  symptoms: String,       // patient's complaint
  status: String,         // "booked" | "checked-in" | "completed" | "cancelled"
  fee: Number,            // consultation fee at time of booking
  qrCode: String,         // base64 QR image
  otp: String,            // 6-digit OTP
  otpExpiry: Date,        // OTP valid for 24 hours
  checkedInAt: Date,      // when receptionist scanned
  createdAt: Date
}
```

### 5. Prescriptions collection
```js
{
  appointmentId: ObjectId,// ref: Appointments
  patientId: ObjectId,    // ref: Users
  doctorId: ObjectId,     // ref: Doctors
  diagnosis: String,
  medicines: [{
    name: String,
    dosage: String,       // "500mg"
    frequency: String,    // "twice a day"
    duration: String,     // "7 days"
    instructions: String  // "after meals"
  }],
  notes: String,          // doctor's advice
  followUpDate: Date,
  createdAt: Date
}
```

### 6. MedicalRecords collection
```js
{
  patientId: ObjectId,    // ref: Users
  allergies: [String],
  chronicDiseases: [String],
  pastSurgeries: [String],
  currentMedicines: [String],
  emergencyContact: {
    name: String,
    phone: String,
    relation: String
  }
}
```

---

## Folder Structure

```
MediLink/
├── backend/
│   ├── config/
│   │   ├── db.js               # MongoDB connection
│   │   └── auth.js             # JWT config
│   ├── models/
│   │   ├── User.js
│   │   ├── Doctor.js
│   │   ├── Slot.js
│   │   ├── Appointment.js
│   │   ├── Prescription.js
│   │   └── MedicalRecord.js
│   ├── routes/
│   │   ├── auth.js             # register + login (all roles)
│   │   ├── patient.js          # patient actions
│   │   ├── doctor.js           # doctor actions
│   │   └── admin.js            # admin actions
│   ├── middleware/
│   │   └── auth.js             # protect routes + role check
│   ├── utils/
│   │   ├── sendEmail.js        # Nodemailer email sender
│   │   ├── sendWhatsApp.js     # Twilio WhatsApp sender
│   │   ├── generateQR.js       # QR code generator
│   │   └── generateOTP.js      # 6-digit OTP generator
│   ├── uploads/                # doctor document uploads
│   ├── .env
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── LoadingSpinner.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx            # landing page
│   │   │   ├── Login.jsx           # shared login
│   │   │   ├── Register.jsx        # choose role + register
│   │   │   ├── patient/
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── SearchDoctors.jsx
│   │   │   │   ├── BookAppointment.jsx
│   │   │   │   ├── MyAppointments.jsx
│   │   │   │   ├── Prescriptions.jsx
│   │   │   │   └── Profile.jsx
│   │   │   ├── doctor/
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── Schedule.jsx
│   │   │   │   ├── Appointments.jsx
│   │   │   │   ├── PatientDetail.jsx
│   │   │   │   ├── WritePrescription.jsx
│   │   │   │   └── Profile.jsx
│   │   │   └── admin/
│   │   │       ├── Dashboard.jsx
│   │   │       ├── DoctorApplications.jsx
│   │   │       ├── AllUsers.jsx
│   │   │       └── Analytics.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx     # global auth state
│   │   ├── utils/
│   │   │   └── axios.js            # axios with base URL + token
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── nginx/
│   ├── Dockerfile
│   └── nginx.conf
└── docker-compose.yml
```

---

## API Routes Plan

### Auth routes (public)
```
POST /api/auth/register       # register patient or doctor
POST /api/auth/login          # login all roles → returns JWT + role
```

### Patient routes (JWT required, role: patient)
```
GET    /api/patient/profile           # get my profile
PUT    /api/patient/profile           # update profile
GET    /api/patient/doctors/search    # search by speciality + city
GET    /api/patient/doctors/nearby    # GPS based search
GET    /api/patient/doctors/:id       # doctor detail + slots
POST   /api/patient/appointments      # book appointment
GET    /api/patient/appointments      # my appointments list
GET    /api/patient/prescriptions     # my prescriptions
GET    /api/patient/records           # my medical records
```

### Doctor routes (JWT required, role: doctor, status: approved)
```
GET    /api/doctor/profile            # get my profile
PUT    /api/doctor/profile            # update clinic info + fee
POST   /api/doctor/slots              # add slot
GET    /api/doctor/slots              # get my slots
DELETE /api/doctor/slots/:id          # remove slot
GET    /api/doctor/appointments       # today's patients
POST   /api/doctor/checkin            # verify OTP and check in patient
POST   /api/doctor/prescriptions      # write prescription
```

### Admin routes (JWT required, role: admin)
```
GET    /api/admin/doctors/pending     # all pending doctor applications
PUT    /api/admin/doctors/:id/approve # approve doctor
PUT    /api/admin/doctors/:id/reject  # reject with reason
GET    /api/admin/users               # all patients
GET    /api/admin/appointments        # all appointments
GET    /api/admin/analytics           # stats and numbers
```

---

## Environment Variables (.env)
```
PORT=5000
MONGO_URI=mongodb://mongo:27017/medilink
JWT_SECRET=your_strong_secret_here

# Email (Gmail)
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_gmail_app_password

# Twilio WhatsApp
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
```

---

## Important Rules for Copilot

1. **Always explain every line of code** — I am a beginner, don't skip explanations
2. **Use the exact folder structure** shown above — don't create files in wrong places
3. **Always use async/await** — not .then().catch() callbacks
4. **Always handle errors** with try/catch blocks
5. **Never hardcode secrets** — always use process.env.VARIABLE_NAME
6. **Role-based protection** — every route must check JWT + role before doing anything
7. **One file at a time** — build one file completely before moving to the next
8. **Use the collection schemas** exactly as defined above
9. **Indian context** — phone numbers are 10 digits, currency is ₹ rupees, city default is Nagpur
10. **Tailwind CSS only** for all frontend styling — no inline styles, no other CSS frameworks

---

## Current Status
- Docker is running ✅
- Basic project structure exists ✅
- Now rebuilding with full role-based system from Phase 1

## What to build next (Phase 1)
Start with these files in this exact order:
1. `backend/models/User.js` — the main user schema
2. `backend/models/Doctor.js` — doctor profile schema  
3. `backend/routes/auth.js` — register and login for all roles
4. `backend/middleware/auth.js` — JWT protection + role checking
5. `backend/server.js` — updated server with all routes
6. `frontend/src/context/AuthContext.jsx` — global login state
7. `frontend/src/pages/Register.jsx` — registration page with role selection
8. `frontend/src/pages/Login.jsx` — login page
