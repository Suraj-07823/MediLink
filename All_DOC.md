# 🏥 MediLink — Complete Project Documentation

> **Healthcare Appointment Platform — Nagpur, India**

| | |
|---|---|
| **Tech Stack** | React 18 + Node.js + MongoDB |
| **Current Phase** | Phase 1 Done → Building Phase 2 |
| **Target Market** | Nagpur → Maharashtra → India |
| **User Roles** | Patient · Doctor · Admin |

*Contains: PRD · TRD · App Flow · UI/UX Brief · Backend Schema · Implementation Plan*

---

## Document 01 — PRD: Product Requirements Document

*What MediLink is, who it's for, and why it exists*

### 1.1 App Overview

- **App Name:** MediLink
- **Tagline:** Book a doctor in Nagpur. Arrive smart. Get better faster.
- **Domain:** medilink.in
- **Type:** Healthcare appointment + check-in platform
- **Stage:** MVP — Phase 1 complete, Phase 2 in progress

### 1.2 Problem Statement

In Nagpur, patients still call clinics to book appointments or just show up and wait. Doctors have no digital schedule — they see 20–40 patients a day with zero data. There is no QR-based check-in. Prescriptions are handwritten on paper and lost. Patients have no record of their medical history.

### 1.3 Target Users

**Primary Users**
- Patients in Nagpur — anyone who visits a doctor's clinic
- Doctors — general physicians, specialists with physical clinics in Nagpur
- Admin — platform operator who verifies doctors and manages the system

**Pilot User Profile**
- MBBS doctor friend's general physician clinic
- General physicians see 20–40 patients/day = maximum test volume
- Patients are everyday Nagpur residents, age 18–70, with basic smartphones

### 1.4 Core Features (MVP)

| Feature | Patient | Doctor / Admin |
|---|---|---|
| **Registration & Login** | Name, phone, email, blood group, DOB | Speciality, reg number, qualification, clinic |
| **Appointment Booking** | Search doctor → pick slot → book | Doctor sets weekly time slots and capacity |
| **QR + OTP Check-in** | Receives QR code via Email + WhatsApp | Receptionist scans QR to mark patient arrived |
| **Digital Prescription** | Views prescription in their account | Writes diagnosis, medicines, follow-up date |
| **Medical History** | Stores allergies, chronic diseases, surgeries | Sees patient history before consultation |
| **Doctor Search** | Search by speciality or area in Nagpur | Profile visible after admin approves |
| **Admin Panel** | N/A | Approve/reject doctors, view platform stats |

### 1.5 Nice-to-Have Features (Post-MVP)

- Payment gateway — ₹ consultation fee paid online via Razorpay
- Patient reviews and doctor ratings
- Video consultation (telemedicine)
- SMS notifications (in addition to Email + WhatsApp)
- Multi-city expansion beyond Nagpur
- Family accounts — one login for multiple family members

### 1.6 User Stories

**As a Patient:**
- I want to search for a cardiologist near Dharampeth so I can book without calling
- I want to receive a QR code so I can check in at the clinic without waiting in a queue
- I want to see my prescription digitally so I never lose a paper slip
- I want my blood group and allergies saved so the doctor always knows my history

**As a Doctor:**
- I want to set my weekly availability so patients only book when I am free
- I want to see today's patient list in one screen so I can manage my time
- I want to write a digital prescription so patients receive it instantly
- I want my clinic to look professional so patients trust me

**As an Admin:**
- I want to verify doctors before they go live so fake profiles don't harm patients
- I want to see how many bookings happen daily so I can track growth

### 1.7 Success Metrics

| Metric | Target (3 months) | Target (6 months) |
|---|---|---|
| Pilot doctors onboarded | 1 (your friend's clinic) | 5–10 clinics in Nagpur |
| Patient registrations | 50 | 500 |
| Appointments booked | 100 | 1,000 |
| QR check-ins | 80% of appointments | 90% of appointments |
| Doctor approval time | < 48 hours | < 24 hours |

---

## Document 02 — TRD: Technical Requirements Document

*The full technology stack, architecture, and constraints*

### 2.1 Technology Stack

| Layer | Technology | Why Chosen |
|---|---|---|
| **Frontend** | React 18 + Vite + Tailwind CSS | Fast HMR, component-based, utility-first CSS |
| **Routing** | React Router v6 | Nested routes for 3-role layout system |
| **HTTP Client** | Axios | Request interceptors for auth token injection |
| **Notifications** | react-hot-toast | Clean toast system, no setup needed |
| **Backend** | Node.js + Express.js | JavaScript everywhere, fast API development |
| **Database** | MongoDB + Mongoose | Flexible schema, great for healthcare records |
| **Authentication** | JWT (JSON Web Tokens) | Stateless, works across mobile + web |
| **Password Security** | bcryptjs (10 rounds) | Industry standard for password hashing |
| **Reverse Proxy** | Nginx | Routes /api/* to backend, everything else to React |
| **Containerization** | Docker + Docker Compose | One command starts everything |
| **Email** | Nodemailer + Gmail SMTP | Free, reliable, no credit card needed |
| **WhatsApp** | Twilio API | QR + OTP delivery to Indian phone numbers |
| **QR Code** | qrcode npm package | Generates QR for appointment check-in |
| **PDF** | pdfkit | Generates digital prescription PDFs |
| **File Upload** | multer | Doctor document uploads (degree, reg certificate) |

### 2.2 Architecture Overview

**Single Codebase — 3 Experiences:** One React app with 3 completely separate layouts and dashboards. Each role (Patient/Doctor/Admin) feels like a different app but shares the same codebase. Security lives on the backend (JWT + role middleware), not the frontend.

**Request Flow:**
```
Browser → Nginx (port 80) → React App (frontend) or Node.js API (backend)
```
- All API calls go to `/api/*` — Nginx proxies these to `backend:5000`
- Frontend calls go to `/*` — Nginx serves React's `index.html`

### 2.3 Environment Variables

| Variable | Value (Development) | Purpose |
|---|---|---|
| `PORT` | 5000 | Backend server port |
| `MONGO_URI` | mongodb://mongo:27017/medilink | MongoDB connection string |
| `JWT_SECRET` | your-secret-key-here | Signs and verifies JWT tokens |
| `NODE_ENV` | development | Controls error stack trace visibility |
| `GMAIL_USER` | your@gmail.com | Email sender for notifications |
| `GMAIL_PASS` | app-password-here | Gmail app password (not main password) |
| `TWILIO_SID` | ACxxxxxxxx | Twilio account SID for WhatsApp |
| `TWILIO_TOKEN` | your-token | Twilio auth token |
| `TWILIO_PHONE` | whatsapp:+14155238886 | Twilio sandbox WhatsApp number |

### 2.4 Packages to Install

**Backend — Missing Packages**

```bash
npm install express-rate-limit    # brute-force protection on login
npm install express-validator     # input sanitization
npm install nodemailer            # Email sending
npm install twilio                # WhatsApp OTP delivery
npm install qrcode                # QR code generation
npm install pdfkit                # digital prescription PDFs
npm install multer                # file uploads (doctor documents)
```

### 2.5 Hosting Plan (Free Tier)

| Service | Provider | Cost |
|---|---|---|
| **Backend API** | Railway.app | Free (500 hrs/month) |
| **Database** | MongoDB Atlas | Free (512MB storage) |
| **Frontend** | Vercel or Railway | Free |
| **Email** | Gmail SMTP | Free (500 emails/day) |
| **WhatsApp** | Twilio sandbox | Free (trial credits) |
| **Domain** | GoDaddy / Hostinger | ~₹800/year for medilink.in |

### 2.6 Key Technical Decisions & Constraints

- JWT expiry MUST be set to `30d` — currently broken at `1h` (bug from review)
- Admin registration MUST be blocked from the public register endpoint
- Doctor fields should NOT be duplicated in User model — use Doctor model only
- CORS must whitelist only `localhost` and `medilink.in` domain
- All dates stored in UTC, displayed in IST on frontend
- Phone numbers validated as 10-digit Indian format (starting with 6–9)

---

## Document 03 — App Flow: User Navigation

*Every screen, every route, and how users move through the app*

### 3.1 All Routes

| Route | Page | Access |
|---|---|---|
| `/` | Home (Landing page) | Public |
| `/login` | Login | Public (redirect to dashboard if already logged in) |
| `/register` | Register (Patient or Doctor) | Public |
| `/patient/dashboard` | Patient Dashboard | Protected — role: patient |
| `/patient/find-doctors` | Doctor Search + Results | Protected — role: patient |
| `/patient/book/:doctorId` | Booking Page — select slot | Protected — role: patient |
| `/patient/appointments` | My Appointments list | Protected — role: patient |
| `/patient/prescriptions` | My Prescriptions | Protected — role: patient |
| `/patient/profile` | Edit patient profile + medical record | Protected — role: patient |
| `/doctor/dashboard` | Doctor Dashboard | Protected — role: doctor + approved |
| `/doctor/pending` | Waiting for admin approval | Protected — role: doctor + pending |
| `/doctor/schedule` | Manage weekly time slots | Protected — role: doctor + approved |
| `/doctor/appointments` | Today's patient list | Protected — role: doctor + approved |
| `/doctor/prescribe/:appointmentId` | Write prescription form | Protected — role: doctor + approved |
| `/doctor/profile` | Edit doctor profile | Protected — role: doctor |
| `/admin/dashboard` | Admin overview stats | Protected — role: admin |
| `/admin/doctors` | Doctor approval queue | Protected — role: admin |
| `/admin/doctors/:id` | Review doctor application | Protected — role: admin |
| `/admin/patients` | All patients list | Protected — role: admin |
| `*` | Redirect to / | Fallback 404 |

### 3.2 Patient Flow

**New Patient Registration**
1. Lands on Home → clicks 'Book a Doctor' → goes to `/register`
2. Selects 'Patient' tab → fills name, email, phone, password, DOB, blood group, gender
3. Submits → backend creates User + saves JWT → redirects to `/patient/dashboard`

**Booking an Appointment**
1. Patient Dashboard → clicks 'Find Doctors'
2. Searches by speciality (e.g. 'General Physician') or area in Nagpur
3. Sees doctor cards with name, fee, rating, clinic address
4. Clicks 'Book' → selects date → sees available time slots
5. Clicks a slot → enters symptoms → confirms booking
6. Backend creates Appointment, generates 6-digit OTP, stores in DB
7. Patient receives Email + WhatsApp with QR code and OTP

**Check-in at Clinic**
1. Patient arrives at clinic → shows QR on phone to receptionist
2. Receptionist scans QR or enters OTP → appointment status changes to `checked-in`
3. Doctor sees patient in their queue → calls patient → marks as `completed`

### 3.3 Doctor Flow

**New Doctor Registration**
1. Goes to `/register` → selects 'Doctor' tab
2. Fills name, email, phone, speciality, qualification, reg number, clinic details, fee
3. Submits → backend creates User + Doctor (status: pending) → redirects to `/doctor/pending`
4. Sees waiting screen: *"Your profile is under review. We'll notify you when approved."*

**After Admin Approval**
1. Doctor gets email notification: *"Your profile is approved!"*
2. Logs in → redirected to `/doctor/dashboard`
3. Goes to `/doctor/schedule` → sets weekly slots (e.g. Mon–Fri 9AM–1PM, max 20 patients)
4. Now appears in patient search results

**Daily Doctor Workflow**
1. Opens `/doctor/appointments` → sees today's patient list with time slots
2. Patient checks in (QR scanned) → status changes to `checked-in` → appears at top
3. Doctor calls patient → completes consultation → goes to `/doctor/prescribe/:id`
4. Writes prescription (diagnosis + medicines + notes + follow-up date) → submits
5. Patient immediately sees prescription in their account

### 3.4 Admin Flow

1. Logs in with manually-created admin credentials → goes to `/admin/dashboard`
2. Sees stats: total doctors, patients, appointments today, pending approvals
3. Goes to `/admin/doctors` → sees pending doctor applications queue
4. Clicks on a doctor → reviews registration details, qualifications, reg number
5. Clicks Approve or Reject (with rejection reason) → doctor gets email notification

### 3.5 Auth Flow

**Login**
- User submits email + password → backend returns JWT + role
- JWT stored in `localStorage` with 30-day expiry
- Redirected: patient → `/patient/dashboard`, doctor → `/doctor/dashboard`, admin → `/admin/dashboard`

**App Load (Persistent Login)**
- App opens → `AuthContext` reads token from `localStorage`
- Calls `GET /api/auth/me` → verifies token → restores session silently
- While verifying: show full-screen loading spinner
- If token expired/invalid: clear `localStorage` → redirect to `/login`

**Logout**
- User clicks Logout → clear `localStorage` + axios header → redirect to `/`

---

## Document 04 — UI/UX Design Brief

*Colors, typography, spacing, component patterns, and design rules*

### 4.1 Design Philosophy

MediLink should feel like a premium Indian healthcare product — trustworthy, clean, and fast. NOT like a government hospital website. Think: clean white surfaces, confident typography, subtle color accents. The interface should be so clear that a 60-year-old in Nagpur can use it without any help.

### 4.2 Color System

**Patient Experience — Blue Theme**

| Color | Hex | Usage |
|---|---|---|
| Primary Blue | `#2563EB` | Primary buttons, active states, links |
| Light Blue | `#EFF6FF` | Card backgrounds, soft highlights |
| Dark Blue | `#1E40AF` | Button hover states |
| Slate 900 | `#0F172A` | Headings, important text |
| Slate 600 | `#475569` | Body text, descriptions |
| Slate 100 | `#F1F5F9` | Page backgrounds, input fields |

**Doctor Experience — Green Theme**

| Color | Hex | Usage |
|---|---|---|
| Primary Green | `#16A34A` | Primary buttons, active states |
| Light Green | `#F0FDF4` | Card backgrounds |
| Dark Green | `#15803D` | Hover states |

**Admin Experience — Dark/Purple Theme**

| Color | Hex | Usage |
|---|---|---|
| Primary Purple | `#7C3AED` | Primary buttons, active states |
| Slate 900 | `#0F172A` | Sidebar background |
| Slate 800 | `#1E293B` | Admin card backgrounds |

### 4.3 Typography

| Element | Size | Weight | Color |
|---|---|---|---|
| Page title (H1) | 30px / text-3xl | Bold (700) | Slate 900 |
| Section heading (H2) | 24px / text-2xl | Semibold (600) | Slate 800 |
| Card heading (H3) | 18px / text-lg | Semibold (600) | Slate 800 |
| Body text | 16px / text-base | Normal (400) | Slate 600 |
| Small text / label | 14px / text-sm | Medium (500) | Slate 500 |
| Tiny / caption | 12px / text-xs | Normal (400) | Slate 400 |

Font family: `system-ui, -apple-system, 'Inter', sans-serif`. Do NOT load custom fonts — use Tailwind defaults.

### 4.4 Component Patterns

**Cards**
- White background (`#FFFFFF`) with 1px border (`border-slate-200`)
- Rounded corners: `rounded-2xl` (16px) for main cards, `rounded-xl` for inner cards
- Shadow: `shadow-sm` only — avoid heavy shadows
- Padding: `p-6` (24px) for main cards, `p-4` for compact cards

**Buttons**
- Primary: `bg-blue-600` (or green/purple by role), `text-white`, `rounded-xl`, `py-3 px-6`
- Secondary: `bg-white`, `border border-slate-300`, `text-slate-700`, same rounding
- Disabled: `opacity-50`, `cursor-not-allowed` — never remove the button
- Loading state: show spinner inside button, keep button disabled

**Form Inputs**
- Full width: `w-full`, `border border-slate-300`, `rounded-xl`, `px-4 py-3`
- Focus ring: `focus:ring-2 focus:ring-blue-500 focus:border-transparent`
- Error state: `border-red-500` + red helper text below the field
- Label above input: `text-sm font-medium text-slate-700`, margin-bottom: 8px

**Status Badges**

| Status | Classes |
|---|---|
| Pending | `bg-yellow-100 text-yellow-800 rounded-full px-3 py-1 text-xs font-medium` |
| Approved | `bg-green-100 text-green-800` |
| Rejected | `bg-red-100 text-red-800` |
| Booked | `bg-blue-100 text-blue-800` |
| Completed | `bg-gray-100 text-gray-800` |

### 4.5 Layout Rules

- Maximum content width: `max-w-7xl mx-auto` — never full-bleed content
- Page padding: `px-4 sm:px-6 lg:px-8` on outer wrappers
- Grid: 1 column mobile → 2 columns tablet → 3 columns desktop
- Sidebar (Doctor/Admin layouts): 256px wide, fixed left, content takes remaining width
- Patient layout: top navigation bar, no sidebar — simpler for patients

### 4.6 Mobile-First Rules

- Every page must work on a 375px wide phone screen — this is non-negotiable
- Touch targets must be at least 44px tall — use `py-3` minimum on all buttons
- Stack cards vertically on mobile (`grid-cols-1`)
- Bottom navigation bar for patients on mobile (Book, Appointments, Profile)
- Doctor schedule picker must be scrollable on mobile

---

## Document 05 — Backend Schema

*All 6 database collections, their fields, relationships, and API endpoints*

### 5.1 Database: MongoDB

**Database name:** `medilink`  
**Collections:** `users`, `doctors`, `slots`, `appointments`, `prescriptions`, `medicalrecords`

### 5.2 Collection: `users`

| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | Auto-generated primary key |
| `name` | String (required) | Full name of patient/doctor/admin |
| `email` | String (required, unique) | Lowercase, used for login |
| `phone` | String (required) | 10-digit Indian mobile number |
| `password` | String (required) | bcrypt hashed — never store plaintext |
| `role` | Enum: `patient\|doctor\|admin` | Default: `patient` |
| `dateOfBirth` | Date | Patient only |
| `gender` | Enum: `male\|female\|other` | Patient only |
| `bloodGroup` | Enum: `A+\|A-\|B+\|B-\|AB+\|AB-\|O+\|O-` | Patient only |
| `address.area` | String | Patient's locality (e.g. Dharampeth) |
| `address.city` | String | Default: Nagpur |
| `address.pincode` | String | 6-digit pincode |
| `profilePhoto` | String (URL) | Cloud storage URL |
| `isVerified` | Boolean | Default: false — email verification |
| `isActive` | Boolean | Default: true — admin can suspend |
| `createdAt / updatedAt` | Date | Auto-managed by Mongoose timestamps |

**Indexes:** `email` (unique), `phone`, `role`

> ⚠️ **NOTE:** Doctor-specific fields (speciality, regNumber, etc.) should NOT be stored here — store only in Doctor collection.

### 5.3 Collection: `doctors`

| Field | Type | Notes |
|---|---|---|
| `userId` | ObjectId (ref: User, required) | Links to users collection |
| `speciality` | String (required) | e.g. General Physician, Cardiologist |
| `qualification` | String (required) | e.g. MBBS, MD, MS |
| `experience` | Number | Years of experience (not required — can be 0) |
| `regNumber` | String (required, unique) | Medical Council registration number |
| `consultationFee` | Number (required) | Rupees ₹ |
| `clinicName` | String (required) | Name of the clinic |
| `clinicAddress.area` | String | e.g. Dharampeth, Sitabuldi |
| `clinicAddress.city` | String | Default: Nagpur |
| `clinicAddress.pincode` | String | |
| `location.type` | String | Always `'Point'` |
| `location.coordinates` | [longitude, latitude] | For GPS-based nearby search |
| `about` | String | Doctor bio / introduction |
| `documents` | [{name, url}] | Uploaded degree and certificates |
| `status` | Enum: `pending\|approved\|rejected` | Admin controls this |
| `rejectionReason` | String | Only if status = rejected |
| `avgRating` | Number | Default: 0, calculated from reviews |
| `totalReviews` | Number | Default: 0 |

**Indexes:** `userId`, `location` (2dsphere for GPS), `speciality + clinicAddress.city + status`

### 5.4 Collection: `slots`

| Field | Type | Notes |
|---|---|---|
| `doctorId` | ObjectId (ref: Doctor, required) | Which doctor this slot belongs to |
| `dayOfWeek` | Enum: Monday...Sunday (required) | Recurring weekly schedule |
| `startTime` | String HH:MM (required) | 24-hour format e.g. `'09:00'` |
| `endTime` | String HH:MM (required) | Must be after startTime |
| `maxPatients` | Number (required, min: 1) | How many patients in this time block |
| `isActive` | Boolean | Default: true. Doctor can pause a slot |

**Indexes:** `doctorId + dayOfWeek`

### 5.5 Collection: `appointments`

| Field | Type | Notes |
|---|---|---|
| `patientId` | ObjectId (ref: User, required) | Who booked |
| `doctorId` | ObjectId (ref: Doctor, required) | Who they booked with |
| `date` | Date (required) | Date of appointment |
| `timeSlot` | String HH:MM (required) | e.g. `'10:00'` |
| `symptoms` | String | Patient's reason for visit |
| `status` | Enum: `booked\|checked-in\|completed\|cancelled` | Default: `booked` |
| `fee` | Number (required) | Fee at time of booking (frozen, not Doctor's current fee) |
| `otp` | String | 6-digit OTP for check-in |
| `otpExpiry` | Date | OTP valid for 24 hours |
| `checkedInAt` | Date | Timestamp when receptionist checked patient in |

**Indexes:** `patientId+date`, `doctorId+date`, `status`, `otp+otpExpiry`

**Unique index:** `doctorId + date + timeSlot` (only for non-cancelled) — prevents double booking

### 5.6 Collection: `prescriptions`

| Field | Type | Notes |
|---|---|---|
| `appointmentId` | ObjectId (ref: Appointment, required) | Links to appointment |
| `patientId` | ObjectId (ref: User, required) | Who receives it |
| `doctorId` | ObjectId (ref: Doctor, required) | Who wrote it |
| `diagnosis` | String (required) | Clinical diagnosis |
| `medicines` | [{name, dosage, frequency, duration, instructions}] | Array of prescribed medicines |
| `notes` | String | Additional advice, lifestyle changes |
| `followUpDate` | Date | When patient should return |

### 5.7 Collection: `medicalrecords`

| Field | Type | Notes |
|---|---|---|
| `patientId` | ObjectId (ref: User, required, unique) | One record per patient |
| `allergies` | [String] | e.g. `['Penicillin', 'Shellfish']` |
| `chronicDiseases` | [String] | e.g. `['Diabetes', 'Hypertension']` |
| `pastSurgeries` | [String] | e.g. `['Appendectomy 2020']` |
| `currentMedicines` | [String] | Ongoing medication list |
| `emergencyContact.name` | String | Name of emergency contact |
| `emergencyContact.phone` | String | 10-digit Indian phone |
| `emergencyContact.relation` | String | e.g. Mother, Brother, Spouse |

### 5.8 API Endpoints

**Auth Routes — `/api/auth`**

| Method + Route | Access | Description |
|---|---|---|
| `POST /register` | Public | Patient registration |
| `POST /register-doctor` | Public | Doctor registration (status: pending) |
| `POST /login` | Public | Login for all roles — returns JWT + role |
| `GET /me` | Protected (any role) | Verify token + restore session |

**Doctor Routes — `/api/doctors` (Phase 2)**

| Method + Route | Access | Description |
|---|---|---|
| `GET /search` | Protected (patient) | Search by speciality + area |
| `GET /:id` | Protected | Get doctor profile |
| `GET /:id/slots` | Protected (patient) | Get available slots for a date |
| `PUT /profile` | Protected (doctor) | Update own profile |
| `POST /slots` | Protected (doctor) | Create weekly slot |
| `PUT /slots/:id` | Protected (doctor) | Update/deactivate slot |

**Appointment Routes — `/api/appointments` (Phase 2)**

| Method + Route | Access | Description |
|---|---|---|
| `POST /book` | Protected (patient) | Book appointment + generate OTP |
| `GET /my` | Protected (patient) | Patient's own appointments |
| `GET /today` | Protected (doctor) | Doctor's appointments for today |
| `POST /check-in` | Protected (doctor) | Mark patient as checked-in via OTP |
| `PUT /:id/cancel` | Protected (patient/doctor) | Cancel an appointment |

---

## Document 06 — Implementation Plan

*The exact build order, phase by phase, with what to fix first*

### 6.1 Immediate Bug Fixes (Before Phase 2)

> ⚠️ Fix these first — takes ~2 hours. These bugs exist in your current code and will break user experience.

| # | Bug | Fix |
|---|---|---|
| 1 | **JWT Expiry** | `backend/routes/auth.js`: change `expiresIn: '1h'` → `'30d'` |
| 2 | **Admin Reg Open** | Only allow `role: 'patient'` in `/api/auth/register`. Block `'admin'` |
| 3 | **Wrong Redirect** | `Register.jsx`: patient → `/patient/dashboard`, doctor → `/doctor/pending` |
| 4 | **Auth Flash** | `App.jsx`: check `sessionLoading` → show `<LoadingSpinner />` while `/me` is pending |
| 5 | **Experience Bug** | Doctor model: remove `required: true` from `experience` field |
| 6 | **Duplicate File** | Delete `backend/config/auth.js` — it's a dead duplicate |
| 7 | **Data Duplication** | Remove doctor fields (speciality, regNumber etc.) from User model |
| 8 | **Fake Data** | Replace hardcoded John Doe data in dashboards with empty states |
| 9 | **No Rate Limit** | Install `express-rate-limit`, limit `/login` to 5 attempts per 15 minutes |

### 6.2 Phase 2 — Doctor Search + Booking

**Goal:** A patient can search for a doctor in Nagpur, see their slots, and book an appointment. This is the CORE feature that makes MediLink actually useful.

**Step 1 — Admin Panel** *(so you can approve your doctor friend)*
- Create `backend/routes/admin.js` with: `GET /doctors/pending`, `PUT /doctors/:id/approve`, `PUT /doctors/:id/reject`
- Build frontend `/admin/doctors` page — list of pending doctors with Approve/Reject buttons
- Create your admin account directly in MongoDB
- Register your doctor friend → approve via admin panel → test full flow

**Step 2 — Doctor Schedule Management**
- Build `/doctor/schedule` page — doctor sets weekly slots (day, startTime, endTime, maxPatients)
- Create `POST /api/doctors/slots` backend route
- Show slot grid: Mon–Sun with toggle to activate/deactivate

**Step 3 — Doctor Search**
- Build `GET /api/doctors/search` with filters: speciality, area/pincode
- Add GPS search: `GET /api/doctors/nearby` with coordinates + radius
- Build `/patient/find-doctors` frontend page
- Doctor cards: name, photo, speciality, fee, rating, clinic area

**Step 4 — Booking Flow**
- Build `/patient/book/:doctorId` — show calendar → patient picks date
- Fetch available slots for chosen date: `GET /api/doctors/:id/slots?date=`
- Show slot times, highlight full slots (disabled)
- Patient enters symptoms → clicks Confirm Booking
- Backend: create Appointment, generate 6-digit OTP, save to DB

### 6.3 Phase 3 — QR Code + OTP + Notifications

```bash
npm install qrcode nodemailer twilio
```

- After booking: generate QR code containing `appointmentId + OTP`
- Send Email: appointment confirmation + QR image attachment
- Send WhatsApp: *"Your appointment with Dr. X is booked for [date]. OTP: 123456"*
- Build check-in endpoint: `POST /api/appointments/check-in` (doctor/receptionist submits OTP)
- Doctor dashboard shows patient as 'Arrived' after check-in

### 6.4 Phase 4 — Prescriptions + Medical Records

- Build `/doctor/prescribe/:appointmentId` — form with diagnosis, medicines, notes, follow-up
- `POST /api/prescriptions` — saves prescription, links to appointment
- Patient sees prescription at `/patient/prescriptions` — list of all past prescriptions
- Generate PDF using `pdfkit` — prescription with clinic header, medicines table
- Build `/patient/profile/medical` — patient edits allergies, chronic diseases, emergency contact
- Doctor can view patient's medical record before writing prescription

### 6.5 Phase 5 — Polish + Launch

- Admin dashboard analytics: charts for bookings per day, active doctors, top specialities
- Doctor ratings: patient can rate doctor after completed appointment
- Profile photos: patient + doctor upload photo via multer → store URL in DB
- Email verification: send confirmation email on registration
- Deploy: Railway (backend + MongoDB Atlas) + Vercel (frontend)
- Set up custom domain: `medilink.in`
- Apply to Startup India registration (free, gives you credibility)
- Apply to VNIT TIDES incubation, Wadhwani Foundation, Smart India Hackathon

### 6.6 Milestone Timeline

| Milestone | What It Means | Estimated Time |
|---|---|---|
| Bug fixes done | App works correctly — no broken redirects, JWT fixed | 2 hours |
| Doctor friend approved | First real doctor live on the platform | 1 day |
| First real booking | Real patient books real appointment on MediLink | 1–2 weeks |
| QR check-in works | Receptionist can scan QR to mark patient arrived | 2–3 weeks |
| First prescription | Doctor writes digital prescription via MediLink | 3–4 weeks |
| 10 appointments/day | Enough volume to test reliability and fix bugs | 4–6 weeks |
| 5 doctors onboarded | Ready to pitch to investors and incubators | 2–3 months |

---

> **Final Advice:** You have a real project with real architecture. The hardest part is already done — the foundation is solid. Focus on getting your doctor friend using it for even 1 week. Real usage will teach you more than 6 months of solo building. Go show them the app this week.
