# Contributing Guide - Setting Up Your Development Environment

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MongoDB Atlas account
- Cloudinary account
- Google OAuth credentials
- Redis instance

## Installation Steps

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/travelgo.git
cd travelgo
```

### 2. Install Dependencies
```bash
npm run installer
```

### 3. Configure Environment Variables

#### Backend Setup
1. Create a `.env` file in the `backend/` directory:
```bash
cp backend/.env.example backend/.env
```

2. Fill in the following environment variables in `backend/.env`:
   - **MONGODB_URI**: Your MongoDB Atlas connection string
   - **REDIS_URL**: Your Redis instance URL
   - **JWT_SECRET**: Generate a secure random string
   - **GOOGLE_CLIENT_ID** & **GOOGLE_CLIENT_SECRET**: From Google Cloud Console
   - **CLOUDINARY_URL**: Your Cloudinary credentials (format: `cloudinary://key:secret@cloud_name`)
   - Other configuration values as needed

#### Frontend Setup
1. Create a `.env.local` file in the `frontend/` directory:
```bash
cp frontend/.env.example frontend/.env.local
```

2. Set the API path (usually `http://localhost:5000/api`)

### 4. Start Development Servers
```bash
npm start
```

This will start both backend and frontend concurrently.

## Important Security Notes

⚠️ **Never commit `.env` files to the repository!**
- The `.gitignore` file is configured to prevent this
- Always use `.env.example` files as templates
- Use strong, unique values for secrets
- Rotate credentials regularly

## Getting Required Credentials

### MongoDB Atlas
1. Create an account at https://www.mongodb.com/cloud/atlas
2. Create a cluster and copy the connection string

### Google OAuth
1. Go to https://console.cloud.google.com
2. Create OAuth 2.0 credentials (Web application)
3. Add `http://localhost:5000` to authorized redirect URIs

### Cloudinary
1. Sign up at https://cloudinary.com
2. Copy your Cloud Name, API Key, and API Secret

### Redis
- For development, you can use Redis Cloud: https://redis.com/try-free/
- Or run locally with Docker: `docker run -d -p 6379:6379 redis`

## Troubleshooting

If you encounter issues with environment variables:
1. Ensure all files in `.env.example` have corresponding values in your `.env` file
2. Restart the development servers after changing environment variables
3. Check the console for error messages about missing configurations
