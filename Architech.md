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
                        │   │   ⚠️ Port 443 — HTTPS — NOT CONFIGURED (see notes)
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

                        ## 🔒 HTTPS / TLS Notes (current status & how-to)

                        Current status: the project `nginx/nginx.conf` in this repo listens on port 80 only (HTTP). HTTPS (port 443) is not configured in the current Nginx container, so the security-group entry for port 443 above is marked `NOT CONFIGURED` to avoid confusion.

                        Options to enable HTTPS (pick one):

                        1) Let's Encrypt (Certbot) on EC2 (recommended for single-VM setups)
                           - Certificate files (privkey/fullchain) will be stored on the EC2 instance under `/etc/letsencrypt/live/<your-domain>/`.
                           - Automation: install `certbot` and use `certbot --nginx` or `certbot certonly` + `systemd`/cron to run `certbot renew` and `nginx -s reload` on success.
                           - Example command (one-time obtain): `sudo certbot --nginx -d medilink.in -d www.medilink.in`

                        2) AWS Certificate Manager (ACM) + Load Balancer (recommended for production on AWS)
                           - Provision certificates in ACM and reference the certificate ARN on an Application Load Balancer (ALB) or CloudFront distribution.
                           - Credentials / ARNs: store ACM certificate ARNs and IAM roles as secrets in your deployment documentation or GitHub Secrets; do NOT store private keys in the repo.
                           - ACM will auto-renew certificates; no instance-level cert files are required.

                        Minimal Nginx SSL server block (if using cert files on the instance):

                        ```
                        server {
                          listen 80;
                          server_name medilink.in www.medilink.in;
                          # Redirect all HTTP to HTTPS
                          return 301 https://$host$request_uri;
                        }

                        server {
                          listen 443 ssl http2;
                          server_name medilink.in www.medilink.in;

                          ssl_certificate /etc/letsencrypt/live/medilink.in/fullchain.pem;
                          ssl_certificate_key /etc/letsencrypt/live/medilink.in/privkey.pem;
                          ssl_protocols TLSv1.2 TLSv1.3;
                          ssl_prefer_server_ciphers on;
                          ssl_ciphers 'ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:...';

                          location /api/ { proxy_pass http://backend:5000/api/; }
                          location / { root /usr/share/nginx/html; try_files $uri $uri/ /index.html; }
                        }
                        ```

                        Notes on redirect strategy:
                        - For a single-VM deployment using Nginx, implement the `listen 80` server block above that issues a 301 to HTTPS.
                        - For AWS deployments behind an ALB, terminate TLS at the ALB and forward plain HTTP to the backend; in that case configure the ALB to handle redirects and add the ACM cert to the ALB listener.

                        Renewal automation:
                        - With Certbot: add a cron or systemd timer that runs `certbot renew --quiet --deploy-hook "nginx -s reload"` daily. Certbot will renew only when necessary.
                        - With ACM: certificates auto-renew; verify ALB listeners still reference the correct ARN after rotation.

                        If you want, I can: (A) add a commented SSL server block to `nginx/nginx.conf` (disabled by default), or (B) provision a Let's Encrypt cert and update Nginx automatically — tell me which approach you prefer.


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
  • EC2_HOST           → EC2 public IP or hostname
  • EC2_SSH_KEY        → Private key (.pem)
  • EC2_USER           → ubuntu
  • NOTE: AWS credentials are not required by the current CI/CD deployment workflow.
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
│        EC2_HOST            → <EC2_PUBLIC_IP> or hostname                 │
│        EC2_SSH_KEY         → private key (.pem file contents)           │
│        EC2_USER            → ubuntu                                     │
│        NOTE: AWS credentials are not used by the current CI/CD deploy.   │
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
│   7. Step: Run tests (placeholder)                                      │
│        no test framework is currently configured in root/backend/frontend │
│        future test commands: npm test, npm run test:unit, npm run test:e2e │
│                                                                         │
│   8. Step: Setup SSH                                                    │
│        loads EC2_SSH_KEY secret                                         │
│        writes private key to runner's ~/.ssh/                           │
│        sets permissions chmod 400                                       │
│                                                                         │
│   9. Step: SSH into EC2 & Deploy                                        │
│        ssh -i key ubuntu@<EC2_PUBLIC_IP>                                │
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
│   14. New code is LIVE on http://<EC2_PUBLIC_IP>                        │
│        Minimal downtime during rebuild (~10-30 seconds).               │
│        (True zero-downtime requires blue-green or rolling updates.)    │
└─────────────────────────────────────────────────────────────────────────┘
                                │
                                │  HTTP Port 80
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         END USER / BROWSER                              │
│                    Accesses http://<EC2_PUBLIC_IP>                      │
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
         │     build: ./backend
         │     port: 5000:5000
         │     env: MONGO_URI, JWT_SECRET, PORT
         │     network: medilink-net
         │
         └──▶ nginx        (starts last)
               build: ./nginx
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
  COPY /app/dist /usr/share/nginx/html
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

## Refresh Token Security
- `RefreshToken` documents are stored in `backend/models/RefreshToken.js` and expire automatically via the `expiresAt` TTL index.
- `authController.refresh` rotates tokens on use by deleting the existing refresh token record and inserting a new one with a fresh 30d expiry.
- `authController.logout` revokes the active refresh token by deleting its stored DB record and clearing the cookie.
- The current implementation stores refresh tokens as plain JWT strings in MongoDB; stronger hardening should hash refresh tokens and limit concurrent active tokens per user.
- Token creation and verification logic lives in `backend/services/authService.js`.

---

## Database Schema (MongoDB)

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

## PHI Security & Compliance
This architecture stores sensitive patient health information in `prescriptions` and `medicalrecords` collections. Key fields include `appointmentId`, `patientId`, `doctorId`, `diagnosis`, `medicines`, `allergies`, `chronicDiseases`, and `emergencyContact`.

Recommended protections:
- MongoDB encryption-at-rest using managed disk encryption or Atlas built-in encryption.
- Field-level encryption for highly sensitive fields such as `diagnosis`, `allergies`, and `emergencyContact`.
- Strict RBAC/authorization rules to ensure only authorized roles can access patient, doctor, and prescription data.
- Audit logging for reads and writes on PHI collections, with a centralized log store and retention policy.

Operational best practices:
- Daily backups with at least 30-day retention and documented restore procedures.
- Disaster recovery plan with target RTO/RPO and regular restore drills.
- Data deletion and retention policy tied to clinical and regulatory requirements.

Compliance guidance:
- Follow HIPAA controls for US deployments: access controls, audit logs, breach notification, and minimum necessary access.
- Follow GDPR requirements for EU deployments: data subject rights, lawful basis for processing, data minimization, and breach reporting.
- Maintain breach notification procedures and contact lists for affected parties.

Existing repository pointers:
- `backend/services/authService.js` and `backend/models/RefreshToken.js` for auth/token flow.
- `backend/services/storage.js` for the planned storage provider integration.
- Infrastructure and backup/audit configs should live in a dedicated ops/infrastructure repo or secured cloud console, not in source code.

---

## Tech Stack

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

Use `.env.example` as the starting point for local environment variables.

Required vars:
- `MONGO_URI`: local MongoDB URI, e.g. `mongodb://mongo:27017/medilink`
- `JWT_SECRET`: secure secret (recommended minimum 32 characters)
- `PORT`: backend port (`5000` default)

Optional vars:
- `NODE_ENV`: `development` or `production`
- `AWS_S3_BUCKET`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`: only required if S3 storage is enabled later
- `REFRESH_SECRET`: optional separate refresh token secret

Local setup:
```bash
git clone https://github.com/Suraj-07823/MediLink.git
cd MediLink
cp .env.example .env
# Edit .env and set JWT_SECRET plus any local values
```

Docker compose:
- The current `docker-compose.yml` embeds backend env values directly.
- Run `docker compose up --build -d` (or `docker-compose up --build -d` for legacy Docker Compose).
- If you want `docker-compose` to load `.env`, add an `env_file: .env` entry under the `backend` service.

Check status and logs:
```bash
docker compose ps
docker compose logs backend
docker compose logs nginx
```

Stop services:
```bash
docker compose down
```

Initial data and admin setup:
- There is no dedicated admin seed script in this repo.
- Create the first admin user via the API (`POST /api/auth/register` with `role=admin`) or add one directly in MongoDB.
- MongoDB initialization is handled by the service startup; add seed data through API calls or database inserts as needed.

Access the app at: `http://localhost`

---

## 👨‍💻 Author

**Suraj Vishwakarma**
- GitHub: [github.com/Suraj-07823](https://github.com/Suraj-07823)
- LinkedIn: [linkedin.com/in/suraj-vishwakarma-a281a6261](https://linkedin.com/in/suraj-vishwakarma-a281a6261)
