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

## Local development

1. Copy environment variables:

```sh
cp backend/.env.example backend/.env
```

2. Start services:

```sh
docker-compose up --build
```

3. Open the app:

- Frontend: `http://localhost`
- API: `http://localhost/api`

## Production deployment

This repository includes a `github/workflows/ci-cd.yml` workflow. Configure the following secrets in GitHub:

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`
- `EC2_HOST`
- `EC2_USER`
- `EC2_SSH_KEY`

## Project structure

- `backend/` — Express API, MongoDB models, authentication, scheduling endpoints
- `frontend/` — React app with Tailwind CSS
- `nginx/` — Nginx reverse proxy configuration and production frontend hosting
- `docker-compose.yml` — Local development containers
- `.github/workflows/ci-cd.yml` — CI/CD build and deploy pipeline
