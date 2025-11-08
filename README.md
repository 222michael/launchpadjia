# 🚀 Jia Web Application

Jia is an AI-powered recruitment platform built with Next.js that provides intelligent interview assistance, candidate management, and automated screening tools. This application helps recruiters streamline their hiring process with AI-driven insights.

## 📋 Table of Contents

- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Detailed Setup Guide](#detailed-setup-guide)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [Health Check](#health-check)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

## 🛠️ Tech Stack

- **Frontend**:
  - Next.js 15.x (with App Router)
  - React 19.x
  - TypeScript
  - SASS for styling

- **Backend**:
  - Next.js API Routes (serverless functions)
  - MongoDB for database
  - Firebase for authentication and storage

- **APIs & Services**:
  - OpenAI API integration
  - Socket.io for real-time communication
  - Core API: https://jia-jvx-1a0eba0de6dd.herokuapp.com

- **DevOps**:
  - Vercel for deployment
  - Git for version control

## ✅ Prerequisites

Before you begin, ensure you have the following installed and configured:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** package manager
- **Git** for version control

You will also need accounts for the following services:

- **MongoDB Atlas** (free tier available) - [Sign up](https://www.mongodb.com/cloud/atlas/register)
- **Firebase** (free tier available) - [Sign up](https://firebase.google.com/)
- **OpenAI** (requires API credits) - [Sign up](https://platform.openai.com/signup)

## 🚀 Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/222michael/launchpadjia.git
cd launchpadjia

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your credentials (see Detailed Setup Guide below)

# 4. Run the development server
npm run dev

# 5. Check health status
# Visit http://localhost:3000/api/health-check
```

## 📖 Detailed Setup Guide

### Step 1: MongoDB Setup

1. **Create a MongoDB Atlas Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
   - Sign up for a free account
   - Verify your email

2. **Create a New Cluster**
   - Click "Build a Database"
   - Choose "FREE" tier (M0 Sandbox)
   - Select your preferred cloud provider and region
   - Click "Create Cluster"

3. **Configure Database Access**
   - Go to "Database Access" in the left sidebar
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Create a username and strong password (save these!)
   - Set user privileges to "Read and write to any database"
   - Click "Add User"

4. **Configure Network Access**
   - Go to "Network Access" in the left sidebar
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - Click "Confirm"

5. **Get Connection String**
   - Go to "Database" in the left sidebar
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with `jia-db`
   - Example: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/jia-db`

### Step 2: Firebase Setup

1. **Create a Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Add project"
   - Enter project name (e.g., "jia-recruitment")
   - Disable Google Analytics (optional)
   - Click "Create project"

2. **Enable Authentication**
   - In your Firebase project, go to "Authentication"
   - Click "Get started"
   - Enable "Google" sign-in method
   - Add your email as an authorized domain
   - Click "Save"

3. **Get Firebase Client Configuration**
   - Go to Project Settings (gear icon)
   - Scroll down to "Your apps"
   - Click the web icon (</>)
   - Register your app with a nickname
   - Copy the `firebaseConfig` object values:
     ```javascript
     apiKey: "AIza..."
     authDomain: "your-project.firebaseapp.com"
     projectId: "your-project"
     storageBucket: "your-project.appspot.com"
     messagingSenderId: "123456789"
     appId: "1:123456789:web:abc123"
     measurementId: "G-XXXXXXXXXX"
     ```

4. **Generate Service Account Key (for Backend)**
   - Go to Project Settings > Service Accounts
   - Click "Generate new private key"
   - Click "Generate key" (downloads a JSON file)
   - **Important**: Keep this file secure!
   - Copy the entire JSON content (you'll need it for `.env`)

### Step 3: OpenAI Setup

1. **Create an OpenAI Account**
   - Go to [OpenAI Platform](https://platform.openai.com/signup)
   - Sign up or log in

2. **Add Payment Method**
   - Go to [Billing](https://platform.openai.com/account/billing)
   - Add a payment method
   - Add credits (minimum $5 recommended)

3. **Create API Key**
   - Go to [API Keys](https://platform.openai.com/api-keys)
   - Click "Create new secret key"
   - Give it a name (e.g., "Jia Development")
   - Copy the key immediately (you won't see it again!)
   - Store it securely

### Step 4: Configure Environment Variables

1. **Create `.env` file**
   ```bash
   cp .env.example .env
   ```

2. **Fill in all variables** (open `.env` in your editor):

```bash
# OpenAI Configuration
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxx

# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/jia-db

# Firebase Admin SDK (Backend) - Paste entire JSON on one line
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"your-project",...}

# Firebase Client SDK (Frontend)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# Core API Configuration (DO NOT CHANGE)
NEXT_PUBLIC_CORE_API_URL=https://jia-jvx-1a0eba0de6dd.herokuapp.com
```

3. **Verify Configuration**
   - Make sure there are no spaces around `=` signs
   - Ensure `FIREBASE_SERVICE_ACCOUNT` is on a single line
   - Double-check all values are correct

## 🏃 Running the Application

### Install Dependencies

```bash
npm install
# or
yarn install
```

### Development Mode

```bash
npm run dev
# or
yarn dev
```

The application will be available at:
- **Main App**: http://localhost:3000
- **Health Check**: http://localhost:3000/api/health-check

### Production Build

```bash
# Build the application
npm run build

# Start production server
npm start
```

### Additional Scripts

```bash
# Clean project (removes node_modules, .next, etc.)
npm run clean
```

## 🏥 Health Check

After starting the application, verify all services are connected:

### Using Browser
Visit: http://localhost:3000/api/health-check

### Using cURL
```bash
curl http://localhost:3000/api/health-check
```

### Expected Response (All Services Healthy)
```json
{
  "timestamp": "2025-11-07T...",
  "status": "healthy",
  "services": {
    "mongodb": {
      "status": "connected",
      "message": "MongoDB connection successful"
    },
    "firebase": {
      "status": "connected",
      "message": "Firebase Admin SDK initialized successfully"
    },
    "openai": {
      "status": "connected",
      "message": "OpenAI API key valid"
    },
    "coreApi": {
      "status": "connected",
      "message": "Core API reachable at https://jia-jvx-1a0eba0de6dd.herokuapp.com"
    }
  }
}
```

### Troubleshooting Health Check

If any service shows `"status": "error"`:

1. **MongoDB Error**
   - Verify `MONGODB_URI` is correct
   - Check if IP address is whitelisted in MongoDB Atlas
   - Ensure password doesn't contain special characters (or URL encode them)

2. **Firebase Error**
   - Verify `FIREBASE_SERVICE_ACCOUNT` is valid JSON
   - Check if the service account has proper permissions
   - Ensure the JSON is on a single line in `.env`

3. **OpenAI Error**
   - Verify `OPENAI_API_KEY` starts with `sk-`
   - Check if you have available credits
   - Ensure the key hasn't been revoked

4. **Core API Error**
   - Check your internet connection
   - Verify the URL is correct
   - The Core API might be temporarily down (check status)

## Project Structure

```
jia-web-app/
├── .env                 # Environment variables
├── .env.example         # Example environment configuration
├── .gitignore           # Git ignore file
├── next-env.d.ts        # TypeScript declarations for Next.js
├── package.json         # Project dependencies and scripts
├── public/              # Static assets
├── src/                 # Source code
│   ├── app/             # Next.js App Router structure
│   │   ├── api/         # API routes
│   │   ├── dashboard/   # Dashboard page
│   │   ├── interview/   # Interview related pages
│   │   ├── login/       # Authentication pages
│   │   ├── my-interviews/ # User interviews management
│   │   ├── applicant/ # Applicant tracking
│   │   ├── talk/        # Communication features
│   │   ├── layout.tsx   # Root layout
│   │   └── page.tsx     # Home page
│   ├── contexts/        # React contexts
│   └── lib/             # Shared libraries and utilities
│       ├── components/  # Reusable UI components
│       ├── context/     # Context providers
│       ├── firebase/    # Firebase configuration
│       ├── mongoDB/     # MongoDB utilities
│       ├── styles/      # Global styles
│       ├── Modal/       # Modal components
│       ├── Loader/      # Loading UI components
│       ├── PageComponent/ # Page-specific components
│       └── VoiceAssistant/ # Voice interaction features
└── tsconfig.json        # TypeScript configuration
```

## Key Features

- App Router-based routing system
- Authentication with Firebase
- Data storage with MongoDB
- Real-time communication with Socket.io
- AI-powered features using OpenAI

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. **Prepare Your Repository**
   ```bash
   git add .
   git commit -m "feat: initial setup with environment configuration"
   git push origin main
   ```

2. **Create Vercel Account**
   - Go to [Vercel](https://vercel.com)
   - Sign up with GitHub

3. **Import Project**
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js

4. **Configure Environment Variables**
   - In the deployment settings, add all environment variables from your `.env` file
   - **Important**: Add each variable individually
   - Click "Deploy"

5. **Verify Deployment**
   - Once deployed, visit: `https://your-app.vercel.app/api/health-check`
   - Ensure all services show "connected"

### Deploy to Other Platforms

<details>
<summary>Render.com</summary>

1. Create a new Web Service
2. Connect your GitHub repository
3. Set build command: `npm run build`
4. Set start command: `npm start`
5. Add environment variables
6. Deploy

</details>

<details>
<summary>Railway.app</summary>

1. Create a new project
2. Connect your GitHub repository
3. Add environment variables
4. Railway will auto-detect and deploy

</details>

### Post-Deployment Checklist

- [ ] Health check endpoint returns all services as "connected"
- [ ] Can log in with Google authentication
- [ ] Can access recruiter dashboard
- [ ] Can create a new career posting
- [ ] No console errors in browser

## 🐛 Troubleshooting

### Common Issues and Solutions

#### MongoDB Connection Issues

**Problem**: `MongoServerError: bad auth`
```bash
Solution:
1. Verify username and password are correct
2. Ensure password doesn't contain special characters
3. If it does, URL encode them:
   @ → %40
   : → %3A
   / → %2F
```

**Problem**: `MongooseServerSelectionError: connect ETIMEDOUT`
```bash
Solution:
1. Check Network Access in MongoDB Atlas
2. Add 0.0.0.0/0 to IP whitelist
3. Wait 2-3 minutes for changes to propagate
```

#### Firebase Issues

**Problem**: `Error: Failed to parse service account`
```bash
Solution:
1. Ensure FIREBASE_SERVICE_ACCOUNT is valid JSON
2. Remove any line breaks (must be single line)
3. Escape quotes if needed
```

**Problem**: `Firebase: Error (auth/popup-blocked)`
```bash
Solution:
1. Allow popups in your browser
2. Try using a different browser
3. Check if third-party cookies are enabled
```

#### OpenAI Issues

**Problem**: `Error: Incorrect API key provided`
```bash
Solution:
1. Verify API key starts with 'sk-'
2. Check for extra spaces in .env file
3. Generate a new API key if needed
```

**Problem**: `Error: You exceeded your current quota`
```bash
Solution:
1. Add credits to your OpenAI account
2. Check usage at platform.openai.com/usage
3. Upgrade to a paid plan if needed
```

#### Build Issues

**Problem**: `Module not found` errors
```bash
Solution:
npm run clean
npm install
npm run dev
```

**Problem**: TypeScript errors
```bash
Solution:
1. Delete .next folder
2. Run: npm run build
3. Check tsconfig.json is correct
```

### Getting Help

If you encounter issues not covered here:

1. Check the [Next.js Documentation](https://nextjs.org/docs)
2. Review error messages in browser console
3. Check server logs for API errors
4. Verify all environment variables are set correctly

## 📁 Project Structure

```
jia-web-app/
├── .env                          # Environment variables (DO NOT COMMIT)
├── .env.example                  # Environment template
├── public/                       # Static assets
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── api/                  # API routes
│   │   │   ├── health-check/     # Service health check
│   │   │   ├── add-career/       # Create job posting
│   │   │   ├── update-career/    # Update job posting
│   │   │   └── ...
│   │   ├── recruiter-dashboard/  # Recruiter portal
│   │   ├── applicant/            # Applicant portal
│   │   ├── interview/            # Interview interface
│   │   └── layout.tsx            # Root layout
│   ├── lib/
│   │   ├── components/           # Reusable components
│   │   ├── firebase/             # Firebase configuration
│   │   ├── mongoDB/              # MongoDB utilities
│   │   ├── utils/                # Helper functions
│   │   │   └── envValidator.ts   # Environment validation
│   │   └── styles/               # Global styles
│   └── middleware.ts             # Next.js middleware
├── package.json
├── tsconfig.json
└── README.md
```

## 🔒 Security Best Practices

- ✅ Never commit `.env` file to Git
- ✅ Use environment variables for all secrets
- ✅ Rotate API keys regularly
- ✅ Enable Firebase security rules
- ✅ Use MongoDB user with minimal required permissions
- ✅ Keep dependencies updated

## 📝 Development Guidelines

### Commit Message Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
feat: add new feature
fix: bug fix
docs: documentation changes
style: formatting, missing semicolons, etc.
refactor: code restructuring
test: adding tests
chore: maintenance tasks
```

### Code Style

- Use TypeScript for type safety
- Follow existing code organization
- Add comments for complex logic
- Keep components small and focused
- Use meaningful variable names

## 📄 License

This project is part of the White Cloak Launchpad Sprint Round.

## 🙏 Acknowledgments

- White Cloak Philippines for the opportunity
- Next.js team for the amazing framework
- All open-source contributors

---

**Built with ❤️ for White Cloak Launchpad Sprint Round**

Last Updated: November 7, 2025
