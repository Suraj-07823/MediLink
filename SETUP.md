# MediLink Setup Guide

This guide provides step-by-step instructions to set up and run the MediLink healthcare platform locally and deploy it to production.

## Prerequisites

- Docker and Docker Compose installed
- Node.js 20+ (for local development without Docker)
- Git
- AWS account (for production deployment)

## Local Development Setup

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd medilink
```

### 2. Environment Configuration

Copy the example environment file and update it with your settings:

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` to set:
- `MONGO_URI`: MongoDB connection string (default: `mongodb://mongo:27017/medilink` for Docker)
- `JWT_SECRET`: A secure random string for JWT tokens
- `PORT`: Backend port (default: 5000)

### 3. Start the Application

Use Docker Compose to build and run all services:

```bash
docker-compose up --build
```

This will start:
- MongoDB database
- Node.js backend API on port 5000
- Nginx reverse proxy on port 80
- React frontend served by Nginx

### 4. Access the Application

- Frontend: http://localhost
- API: http://localhost/api
- Health check: http://localhost/api/health

### 5. Development Workflow

For frontend development with hot reload:

```bash
cd frontend
npm install
npm run dev
```

For backend development:

```bash
cd backend
npm install
npm run dev
```

### 6. Database Seeding

The backend automatically seeds initial doctor data on first startup. You can add more doctors via the API or database.

## API Testing with Postman

Import the following endpoints into Postman for testing:

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Doctors
- `GET /api/doctors` - List all doctors

### Appointments
- `GET /api/appointments` - Get user's appointments (requires auth)
- `POST /api/appointments` - Book appointment (requires auth)
- `PATCH /api/appointments/:id/checkin` - Check in with OTP

### Prescriptions
- `GET /api/prescriptions` - Get user's prescriptions (requires auth)
- `POST /api/prescriptions` - Create prescription (doctor only)

Include `Authorization: Bearer <token>` header for authenticated requests.

## Production Deployment

### 1. AWS Setup

1. Create an EC2 instance with Ubuntu
2. Install Docker and Docker Compose on EC2
3. Create an IAM user with EC2 and S3 permissions
4. Set up security groups to allow HTTP/HTTPS traffic

### 2. GitHub Secrets Configuration

In your GitHub repository, add the following secrets:

- `AWS_ACCESS_KEY_ID`: Your AWS access key
- `AWS_SECRET_ACCESS_KEY`: Your AWS secret key
- `AWS_REGION`: Your AWS region (e.g., us-east-1)
- `EC2_HOST`: Public IP or DNS of your EC2 instance
- `EC2_USER`: SSH username (usually ubuntu)
- `EC2_SSH_KEY`: Private SSH key for EC2 access

### 3. Deploy

1. Push changes to the `main` branch
2. GitHub Actions will automatically build and deploy to EC2
3. The workflow runs tests, builds Docker images, and SSHs into EC2 to update containers

### 4. SSL Configuration

For production SSL:
1. Obtain SSL certificate (Let's Encrypt or AWS Certificate Manager)
2. Update `nginx/nginx.conf` to include SSL configuration
3. Rebuild and redeploy

## Troubleshooting

### Common Issues

1. **Port conflicts**: Ensure ports 80, 5000 are available
2. **MongoDB connection**: Check Docker network and MONGO_URI
3. **Frontend not loading**: Verify Nginx configuration and build process
4. **Auth failures**: Ensure JWT_SECRET is set and tokens are valid

### Logs

View container logs:

```bash
docker-compose logs backend
docker-compose logs nginx
docker-compose logs mongo
```

### Database Access

Connect to MongoDB directly:

```bash
docker exec -it medilink_mongo_1 mongo medilink
```

## Architecture Overview

- **Frontend**: React with Vite, Tailwind CSS for styling
- **Backend**: Node.js with Express, JWT authentication
- **Database**: MongoDB with Mongoose ODM
- **Reverse Proxy**: Nginx for API routing and static serving
- **Containerization**: Docker Compose for local development
- **CI/CD**: GitHub Actions for automated deployment

## Contributing

1. Create a feature branch
2. Make changes and test locally
3. Commit with descriptive messages
4. Push and create a pull request
5. CI/CD will run tests and deploy on merge to main

## Support

For issues or questions, check the GitHub repository issues or contact the development team.