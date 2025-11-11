# 🚀 JIA - AI-Powered Recruitment Platform

JIA is an intelligent recruitment platform built with Next.js that streamlines the hiring process with AI-driven candidate screening, automated interviews, and smart applicant tracking.

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, SASS
- **Backend**: Next.js API Routes, MongoDB, Firebase
- **AI**: OpenAI API integration
- **Real-time**: Socket.io

## ✅ Prerequisites

- Node.js 18+
- MongoDB Atlas account
- Firebase account
- OpenAI API key

## 🚀 Quick Start

```bash
# Clone and install
git clone https://github.com/222michael/launchpadjia.git
cd launchpadjia
npm install

# Setup environment
cp .env.example .env
# Edit .env with your credentials

# Run development server
npm run dev
```

Visit http://localhost:3000

## 🔧 Environment Setup

### 1. MongoDB Atlas

1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free cluster (M0)
3. Add database user (Database Access)
4. Whitelist IP: 0.0.0.0/0 (Network Access)
5. Get connection string: `mongodb+srv://user:pass@cluster.mongodb.net/jia-db`

### 2. Firebase

1. Create project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Google Authentication
3. Get web app config (Project Settings)
4. Generate service account key (Service Accounts tab)

### 3. OpenAI

1. Create account at [OpenAI Platform](https://platform.openai.com/)
2. Add payment method and credits
3. Generate API key

### 4. Configure .env

```bash
# OpenAI
OPENAI_API_KEY=sk-proj-xxxxx

# MongoDB
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/jia-db

# Firebase Admin (single line JSON)
FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}

# Firebase Client
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaxxxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456:web:abc123
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXX

# Core API (DO NOT CHANGE)
NEXT_PUBLIC_CORE_API_URL=https://jia-jvx-1a0eba0de6dd.herokuapp.com
```

## 🏥 Health Check

Verify all services are connected:

```bash
# Visit in browser
http://localhost:3000/api/health-check

# Or use curl
curl http://localhost:3000/api/health-check
```

Expected response:
```json
{
  "status": "healthy",
  "services": {
    "mongodb": { "status": "connected" },
    "firebase": { "status": "connected" },
    "openai": { "status": "connected" },
    "coreApi": { "status": "connected" }
  }
}
```

## 📁 Project Structure

```
launchpadjia/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/                # API routes
│   │   ├── recruiter-dashboard/# Recruiter portal
│   │   ├── job-portal/         # Applicant portal
│   │   └── direct-interview/   # Interview interface
│   └── lib/
│       ├── components/         # React components
│       ├── firebase/           # Firebase config
│       ├── mongoDB/            # Database utilities
│       └── utils/              # Helper functions
├── public/                     # Static assets
├── .env                        # Environment variables
└── package.json
```

## 🎯 Key Features

### For Recruiters
- **Auto-Registration**: Any Gmail user can access recruiter dashboard
- **Career Management**: Create, edit, and manage job postings
- **Applicant Tracking**: View and manage applications
- **AI Screening**: Automated CV analysis and candidate scoring
- **Team Collaboration**: Multi-user organization support

### For Applicants
- **Job Search**: Browse available positions
- **Easy Apply**: Upload CV and apply with one click
- **AI Interview**: Automated pre-screening interviews
- **Application Tracking**: Monitor application status

### Security Features
- **XSS Protection**: DOMPurify sanitization on all user inputs
- **Secure Authentication**: Firebase Google OAuth
- **Role-Based Access**: Admin, Member, and Applicant roles

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Push to GitHub
git push origin main

# Deploy on Vercel
1. Import repository at vercel.com
2. Add environment variables
3. Deploy
```

### Other Platforms
- **Render.com**: Auto-detects Next.js
- **Railway.app**: One-click deployment
- **AWS/Azure**: Use Docker container

## 🐛 Troubleshooting

### MongoDB Connection Failed
- Check username/password
- Verify IP whitelist (0.0.0.0/0)
- URL encode special characters in password

### Firebase Auth Error
- Ensure service account JSON is single line
- Check Firebase project settings
- Verify Google auth is enabled

### OpenAI API Error
- Verify API key starts with `sk-`
- Check account has credits
- Ensure key hasn't been revoked

### Build Errors
```bash
npm run clean
npm install
npm run dev
```

## 📝 Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run clean        # Clean build artifacts
```

## 🔒 Security Notes

- Never commit `.env` to Git
- Rotate API keys regularly
- Use environment variables for all secrets
- Keep dependencies updated

## 🤝 Contributing

This project follows [Conventional Commits](https://www.conventionalcommits.org/):

```bash
feat: add new feature
fix: bug fix
docs: documentation
style: formatting
refactor: code restructuring
```

## 📄 License

White Cloak Launchpad Sprint Round Project

---

**Built with ❤️ by Michael**

Last Updated: November 11, 2025
