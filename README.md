# MediLink

MediLink is a full-stack healthcare platform built with React, Node.js, Express, MongoDB, Docker, and AWS deployment patterns.

## Features

- Doctor listing and search
- Patient dashboard and appointment booking
- Slot-based booking UI
- QR/OTP check-in flow
- Digital prescription display
- User authentication with JWT
- REST APIs for scheduling, prescriptions, and user management
- Docker Compose stack with MongoDB, backend, and Nginx reverse proxy
- GitHub Actions CI/CD pipeline template for build and deploy

## Quick Start

1. Clone the repository
2. Copy `backend/.env.example` to `backend/.env`
3. Run `docker-compose up --build`
4. Open `http://localhost`

For detailed setup instructions, see [SETUP.md](SETUP.md).

## Production Deployment

Configure GitHub secrets for AWS and EC2, then push to main branch to trigger CI/CD.

## Project Structure

- `backend/` — Express API, MongoDB models, authentication, scheduling endpoints
- `frontend/` — React app with Tailwind CSS
- `nginx/` — Nginx reverse proxy configuration and production frontend hosting
- `docker-compose.yml` — Local development containers
- `.github/workflows/ci-cd.yml` — CI/CD build and deploy pipeline
