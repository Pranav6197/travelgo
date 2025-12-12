# 🌍 TravelGo - Travel Blog Platform

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=flat-square&logo=node.js)
![React](https://img.shields.io/badge/React-18+-blue?style=flat-square&logo=react)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?style=flat-square&logo=mongodb)
![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)

**A modern MERN stack travel blog platform for sharing wanderlust stories** ✈️

[Features](#features) • [Tech Stack](#tech-stack) • [Setup](#setup) • [Contributing](#contributing)

</div>

---

## ✨ Features

- ✅ **Authentication**: Email/Password + Google OAuth 2.0
- ✅ **Blog Management**: Create, edit, delete posts with categories
- ✅ **Image Upload**: Cloudinary integration with auto-optimization
- ✅ **User Profiles**: Role-based access (User/Admin)
- ✅ **Admin Dashboard**: Content moderation & user management
- ✅ **Performance**: Redis caching & optimized queries
- ✅ **Responsive UI**: Mobile-first design with dark/light theme
- ✅ **Security**: JWT tokens, bcrypt encryption, CORS protection

---

## 🛠️ Tech Stack

| Category | Technologies |
|----------|--------------|
| **Frontend** | React 18, Vite, Tailwind CSS, Redux Toolkit, Axios |
| **Backend** | Node.js, Express.js, MongoDB, Passport.js, JWT |
| **Services** | Redis (Caching), Cloudinary (Image CDN), Google OAuth |

---

## 📋 Prerequisites

- **Node.js** v18+ ([Download](https://nodejs.org/))
- **MongoDB Atlas** account ([Free Tier](https://www.mongodb.com/cloud/atlas))
- **Redis Cloud** account ([Free Tier](https://redis.com/try-free/))
- **Cloudinary** account ([Sign up](https://cloudinary.com/))
- **Google OAuth** credentials ([Setup](https://console.cloud.google.com/))
- **Git** v2.0+ ([Download](https://git-scm.com/))

---

## 🚀 Quick Start

### 1️⃣ Clone & Install
```bash
git clone https://github.com/Pranav6197/travelgo.git
cd travelgo
npm run installer
```

### 2️⃣ Setup Environment Variables

**Backend** - Create `backend/.env`:
```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:5000

MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/
REDIS_URL=redis://default:password@host:6379

JWT_SECRET=your_secret_key_here
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
CLOUDINARY_URL=cloudinary://key:secret@cloud_name
```

**Frontend** - Create `frontend/.env.local`:
```env
VITE_API_PATH=http://localhost:5000/api
```

### 3️⃣ Run Development Servers
```bash
npm start
```

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:5000

---

## 📁 Project Structure

```
travelgo/
├── frontend/              # React + Vite app
│   ├── src/
│   │   ├── components/   # UI components
│   │   ├── pages/        # Page components
│   │   ├── assets/       # Images & SVGs
│   │   └── App.jsx       # Root component
│   └── package.json
│
├── backend/              # Express API server
│   ├── config/          # Configuration
│   ├── controllers/      # Route handlers
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API routes
│   ├── middlewares/      # Express middleware
│   └── package.json
│
└── README.md            # This file
```

---

## 📜 Available Scripts

```bash
# Root
npm start                   # Start frontend + backend
npm run installer           # Install all dependencies

# Frontend
cd frontend && npm run dev  # Dev server
npm run build              # Production build
npm test                   # Run tests

# Backend
cd backend && npm run dev   # Dev server with Nodemon
npm test                   # Run tests
```

---

## 🔒 Security

- ✅ Password encryption with bcryptjs
- ✅ JWT token authentication
- ✅ Secure HTTP-only cookies
- ✅ CORS protection
- ✅ Input validation
- ✅ Environment variable management

See [SECURITY.md](./SECURITY.md) for details.

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add feature'`
4. Push: `git push origin feature/amazing-feature`
5. Submit a Pull Request

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

---


## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Port 5000 in use | Kill process: `taskkill /PID <PID> /F` |
| MongoDB connection fails | Check connection string & IP whitelist |
| Redis connection fails | Verify Redis URL and credentials |
| .env not loading | Restart dev server after changes |

---

## 📊 Quick Stats

- 135+ Files
- 30+ API Endpoints
- 25+ React Components
- 100+ NPM Packages
- MongoDB & Redis Integration
- Full Authentication System
