# MediLink — DevOps Architecture

> A full-stack healthcare platform deployed on AWS EC2 using Docker, Nginx, and GitHub Actions CI/CD.

---

## 🏗️ Architecture Overview

```
                        ┌─────────────────────────────────────────────────────┐
                        │                  INTERNET / USER                    │
                        └─────────────────────┬───────────────────────────────┘
                                              │
                                      HTTP (Port 80)
                                              │
                        ┌─────────────────────▼───────────────────────────────┐
                        │              AWS EC2 (t2.micro)                     │
                        │           Region: ap-south-1 (Mumbai)               │
                        │                                                     │
                        │   ┌─────────────────────────────────────────────┐   │
                        │   │         Security Group (Firewall)           │   │
                        │   │   ✅ Port 80  — HTTP  — 0.0.0.0/0          │   │
                        │   │   ✅ Port 443 — HTTPS — 0.0.0.0/0          │   │
                        │   │   ✅ Port 22  — SSH   — My IP only         │   │
                        │   └──────────────────┬──────────────────────────┘   │
                        │                      │                              │
                        │   ┌──────────────────▼──────────────────────────┐   │
                        │   │         Docker Network: medilink-net        │   │
                        │   │              (Bridge Driver)                │   │
                        │   │                                             │   │
                        │   │  ┌──────────────────────────────────────┐  │   │
                        │   │  │     NGINX Container  (Port 80)       │  │   │
                        │   │  │     Image: nginx:stable-alpine       │  │   │
                        │   │  │                                      │  │   │
                        │   │  │  /         → serves React frontend   │  │   │
                        │   │  │  /api/*    → proxy to backend:5000   │  │   │
                        │   │  │  try_files → SPA fallback index.html │  │   │
                        │   │  └───────────────┬──────────────────────┘  │   │
                        │   │                  │ proxy_pass               │   │
                        │   │                  │ http://backend:5000      │   │
                        │   │  ┌───────────────▼──────────────────────┐  │   │
                        │   │  │   BACKEND Container  (Port 5000)     │  │   │
                        │   │  │   Image: node:20-alpine              │  │   │
                        │   │  │   Runtime: Node.js + Express         │  │   │
                        │   │  │                                      │  │   │
                        │   │  │   Routes:                            │  │   │
                        │   │  │   POST /api/auth/register            │  │   │
                        │   │  │   POST /api/auth/login               │  │   │
                        │   │  │   POST /api/auth/register-doctor     │  │   │
                        │   │  │   PATCH /api/appointments/:id/checkin│  │   │
                        │   │  │   GET  /api/health                   │  │   │
                        │   │  └───────────────┬──────────────────────┘  │   │
                        │   │                  │ mongodb://mongo:27017    │   │
                        │   │  ┌───────────────▼──────────────────────┐  │   │
                        │   │  │   MONGO Container  (Port 27017)      │  │   │
                        │   │  │   Image: mongo:6.0                   │  │   │
                        │   │  │   restart: unless-stopped            │  │   │
                        │   │  │                                      │  │   │
                        │   │  │   Collections:                       │  │   │
                        │   │  │   • users         • doctors          │  │   │
                        │   │  │   • appointments  • slots            │  │   │
                        │   │  │   • prescriptions • medicalrecords   │  │   │
                        │   │  └───────────────┬──────────────────────┘  │   │
                        │   │                  │                          │   │
                        │   │  ┌───────────────▼──────────────────────┐  │   │
                        │   │  │   Named Volume: mongo-data           │  │   │
                        │   │  │   Mounted at: /data/db               │  │   │
                        │   │  │   Persists data across restarts      │  │   │
                        │   │  └──────────────────────────────────────┘  │   │
                        │   └─────────────────────────────────────────────┘   │
                        │                                                     │
                        │   AWS Services Used:                                │
                        │   ☁️  S3     — File & document storage              │
                        │   👁️  CloudWatch — CPU/Memory alerts & logs         │
                        │   🔐 IAM    — Role-based EC2 access to S3           │
                        └─────────────────────────────────────────────────────┘
```

---

## 🔄 CI/CD Pipeline (GitHub Actions)

```
  Developer pushes code
         │
         ▼
  ┌─────────────────┐
  │   GitHub Repo   │
  │  (main branch)  │
  └────────┬────────┘
           │  triggers on push
           ▼
  ┌─────────────────────────────────────────┐
  │         GitHub Actions Workflow         │
  │                                         │
  │  Step 1: Checkout code                  │
  │  Step 2: Run tests                      │
  │  Step 3: SSH into EC2 using secret key  │
  │  Step 4: git pull latest code           │
  │  Step 5: docker-compose up --build -d   │
  │  Step 6: Verify health check            │
  └────────────────────┬────────────────────┘
                       │  SSH (Port 22)
                       ▼
             ┌──────────────────┐
             │   AWS EC2        │
             │  (Production)    │
             │  New containers  │
             │  auto deployed   │
             └──────────────────┘

  Secrets stored in GitHub:
  • EC2_HOST           → EC2 Public IP
  • EC2_SSH_KEY        → Private key (.pem)
  • EC2_USER           → ubuntu
  • AWS_ACCESS_KEY_ID  → AWS credentials
  • AWS_SECRET_ACCESS_KEY
  • AWS_REGION         → ap-south-1
```

---

## 💻 Complete Flow — Local Machine to Production Server

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        LOCAL MACHINE (Nagpur)                           │
│                                                                         │
│   1. Write code in VS Code                                              │
│        React components / Node.js routes / Docker configs               │
│                                                                         │
│   2. Test locally                                                       │
│        docker-compose up --build                                        │
│        open http://localhost → verify everything works                  │
│                                                                         │
│   3. Stage & commit changes                                             │
│        git add .                                                        │
│        git commit -m "feat: add appointment booking flow"               │
│                                                                         │
│   4. Push to GitHub                                                     │
│        git push origin main                                             │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │
                                │  git push (HTTPS / SSH)
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        GITHUB (Remote Repo)                             │
│              github.com/Suraj-07823/MediLink                            │
│                                                                         │
│   5. Push to main branch detected                                       │
│        GitHub Actions workflow triggered automatically                  │
│        (.github/workflows/deploy.yml)                                   │
│                                                                         │
│   Repository Secrets used:                                              │
│        EC2_HOST            → 13.127.14.68                               │
│        EC2_SSH_KEY         → private key (.pem file contents)           │
│        EC2_USER            → ubuntu                                     │
│        AWS_ACCESS_KEY_ID   → AWS credentials                            │
│        AWS_SECRET_ACCESS_KEY                                            │
│        AWS_REGION          → ap-south-1                                 │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │
                                │  GitHub Actions runner starts
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     GITHUB ACTIONS RUNNER (CI/CD)                      │
│                                                                         │
│   6. Step: Checkout code                                                │
│        actions/checkout@v3                                              │
│        pulls latest code into runner environment                        │
│                                                                         │
│   7. Step: Run tests (if configured)                                    │
│        npm test / lint checks                                           │
│        pipeline fails here if tests break → code never reaches server  │
│                                                                         │
│   8. Step: Setup SSH                                                    │
│        loads EC2_SSH_KEY secret                                         │
│        writes private key to runner's ~/.ssh/                           │
│        sets permissions chmod 400                                       │
│                                                                         │
│   9. Step: SSH into EC2 & Deploy                                        │
│        ssh -i key ubuntu@13.127.14.68                                   │
│        cd ~/MediLink                                                    │
│        git pull origin main          ← pulls latest code on server     │
│        docker-compose up --build -d  ← rebuilds & restarts containers  │
│                                                                         │
│   10. Step: Health Check                                                │
│        curl http://localhost/api/health                                 │
│        if response != 200 → pipeline marked FAILED                     │
│        team gets notified                                               │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │
                                │  SSH (Port 22)
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     AWS EC2 (ap-south-1, Mumbai)                        │
│                     Instance: t2.micro                                  │
│                     OS: Ubuntu 22.04 LTS                                │
│                                                                         │
│   11. git pull fetches latest code                                      │
│                                                                         │
│   12. docker-compose up --build -d runs:                                │
│                                                                         │
│        ┌─────────────────────────────────────────────────────────────┐  │
│        │              Docker Build Process                           │  │
│        │                                                             │  │
│        │  Backend Image:                                             │  │
│        │    FROM node:20-alpine                                      │  │
│        │    COPY package.json → npm install --production             │  │
│        │    COPY source code → EXPOSE 5000 → CMD npm start          │  │
│        │                                                             │  │
│        │  Nginx Image (multi-stage):                                 │  │
│        │    Stage 1: node:20-alpine → npm run build → /dist         │  │
│        │    Stage 2: nginx:stable-alpine → COPY dist + nginx.conf   │  │
│        │                                                             │  │
│        │  Mongo: pulls mongo:6.0 directly (no build needed)         │  │
│        └─────────────────────────────────────────────────────────────┘  │
│                                                                         │
│   13. All 3 containers start on medilink-net bridge network             │
│        mongo     → Up (data safe in named volume)                       │
│        backend   → Up (connected to mongo by service name)              │
│        nginx     → Up (serving frontend + proxying API)                 │
│                                                                         │
│   14. New code is LIVE on http://13.127.14.68                           │
│        Zero manual steps. Zero downtime during rebuild.                 │
└─────────────────────────────────────────────────────────────────────────┘
                                │
                                │  HTTP Port 80
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         END USER / BROWSER                              │
│                    Accesses http://13.127.14.68                         │
│                    Sees updated MediLink application                    │
└─────────────────────────────────────────────────────────────────────────┘


  SUMMARY — Time from git push to live:
  ┌─────────────────────────────────────┐
  │  git push          →   ~2 seconds   │
  │  Actions trigger   →   ~5 seconds   │
  │  SSH + git pull    →   ~15 seconds  │
  │  docker-compose    →   ~60 seconds  │
  │  Health check      →   ~5 seconds   │
  │  Total             →   ~90 seconds  │
  └─────────────────────────────────────┘
```

---

## 🐳 Docker Setup

### docker-compose.yml — Service Map

```
docker-compose up --build -d
         │
         ├──▶ mongo        (starts first)
         │     image: mongo:6.0
         │     volume: mongo-data:/data/db
         │     network: medilink-net
         │
         ├──▶ backend      (starts after mongo)
         │     build: ./backend/Dockerfile
         │     port: 5000:5000
         │     env: MONGO_URI, JWT_SECRET, PORT
         │     network: medilink-net
         │
         └──▶ nginx        (starts last)
               build: nginx/Dockerfile (multi-stage)
               port: 80:80
               network: medilink-net
```

### Nginx Multi-Stage Build

```
Stage 1 — Builder
  FROM node:20-alpine
  COPY frontend/
  RUN npm run build  ──▶  produces /app/dist/
         │
         │ COPY --from=build
         ▼
Stage 2 — Final Image
  FROM nginx:stable-alpine
  COPY nginx.conf
  COPY /app/dist → /usr/share/nginx/html
  EXPOSE 80
  (No Node.js in final image — small & secure)
```

---

## 🔐 Authentication Flow

```
  User Login Request
         │
         ▼
  ┌─────────────────────────────────────┐
  │  POST /api/auth/login               │
  │  { email, password }                │
  └──────────────┬──────────────────────┘
                 │
                 ▼
  Check failed attempts (lockout after 5)
                 │
                 ▼
  bcrypt.compare(password, hash)
                 │
         ┌───────┴────────┐
       ❌ Wrong          ✅ Correct
         │                │
    increment          generate
    failedCount        JWT (1hr)
                        +
                    RefreshToken (30d)
                    stored in MongoDB
                    + httpOnly cookie
                        │
                        ▼
                 Return token to client
```

---

## 🗄️ Database Schema (MongoDB)

```
  medilink (database)
  │
  ├── users
  │   ├── _id, name, email, phone, password (bcrypt)
  │   ├── role: patient | doctor | admin
  │   ├── isActive, failedLoginCount, lockedUntil
  │   └── doctorStatus: pending | approved | rejected
  │
  ├── doctors
  │   ├── userId (ref: users)
  │   ├── speciality, qualification, regNumber
  │   ├── consultationFee, clinicName, clinicAddress
  │   ├── location (2dsphere index — GPS search)
  │   └── status: pending | approved | rejected
  │
  ├── slots
  │   ├── doctorId (ref: doctors)
  │   ├── dayOfWeek, startTime, endTime (HH:MM)
  │   ├── maxPatients
  │   └── isActive
  │
  ├── appointments
  │   ├── patientId (ref: users)
  │   ├── doctorId (ref: doctors)
  │   ├── date, timeSlot
  │   ├── status: booked | checked-in | completed | cancelled
  │   ├── otp, otpExpiry
  │   └── checkedInAt
  │
  ├── prescriptions
  │   ├── appointmentId, patientId, doctorId
  │   ├── diagnosis
  │   ├── medicines[ {name, dosage, frequency, duration} ]
  │   └── followUpDate
  │
  └── medicalrecords
      ├── patientId (unique — one per patient)
      ├── allergies[], chronicDiseases[]
      ├── pastSurgeries[], currentMedicines[]
      └── emergencyContact { name, phone, relation }
```

---

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js + Vite + Tailwind CSS |
| Backend | Node.js + Express.js |
| Database | MongoDB 6.0 |
| Containerization | Docker + Docker Compose |
| Reverse Proxy | Nginx (stable-alpine) |
| Cloud | AWS EC2 (ap-south-1) |
| Storage | AWS S3 |
| Monitoring | AWS CloudWatch |
| CI/CD | GitHub Actions |
| Auth | JWT + bcrypt + Refresh Tokens |
| IaC | Terraform (EC2 + Security Groups) |

---

## 🚀 Local Setup

```bash
# Clone the repo
git clone https://github.com/Suraj-07823/MediLink.git
cd MediLink

# Run all services
docker-compose up --build -d

# Check status
docker-compose ps

# View logs
docker-compose logs backend
docker-compose logs nginx

# Stop all
docker-compose down
```

Access at: `http://localhost`

---

## 👨‍💻 Author

**Suraj Vishwakarma**
- GitHub: [github.com/Suraj-07823](https://github.com/Suraj-07823)
- LinkedIn: [linkedin.com/in/suraj-vishwakarma-a281a6261](https://linkedin.com/in/suraj-vishwakarma-a281a6261)
