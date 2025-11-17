# Firebase Migration Guide

## Overview
This document describes the migration of the BeatCrest backend from Render to Firebase Functions, and all database operations to Firestore.

## What Changed

### 1. Firebase Functions Setup
- Created `functions/` directory with Firebase Functions structure
- Converted Express server to work as a Firebase Function
- All backend code moved to `functions/` directory

### 2. Database Migration
- **Already using Firestore**: The backend was already using Firebase Firestore via `firebase-admin`
- All models (`User`, `Beat`, `Purchase`, `Comment`, `Message`, `Notification`, `Tenant`) use Firestore
- No database migration needed - data is already in Firestore

### 3. File Storage Migration
- **Migrated from AWS S3 to Firebase Storage**
- Updated `functions/routes/beats.js` to use Firebase Storage instead of S3
- File uploads now go to Firebase Storage bucket
- Files are made publicly accessible via signed URLs

### 4. Frontend Updates
- Updated `frontend/src/services/api.ts` to use Firebase Functions URL in production
- API requests now go to `/api` which is rewritten to Firebase Function via Firebase Hosting
- In development, uses local proxy (`/api`)
- In production, uses Firebase Hosting rewrite to route to Functions

### 5. Firebase Configuration
- Updated `firebase.json` to include Functions configuration
- Added rewrite rules to route `/api/**` to the `api` function
- Functions configured to use Node.js 18 runtime

## Project Structure

```
beatcrest/
├── functions/           # Firebase Functions (backend)
│   ├── config/         # Firebase config
│   ├── models/         # Firestore models
│   ├── routes/         # Express routes
│   ├── middleware/     # Auth middleware
│   ├── index.js        # Functions entry point
│   └── package.json    # Functions dependencies
├── frontend/           # React frontend
└── firebase.json       # Firebase configuration
```

## Deployment

### Deploy Functions
```bash
cd functions
npm install
cd ..
firebase deploy --only functions
```

### Deploy Frontend + Functions Together
```bash
firebase deploy
```

### Deploy Just Functions
```bash
firebase deploy --only functions
```

### Deploy Just Hosting
```bash
firebase deploy --only hosting
```

## Environment Variables

Firebase Functions automatically have access to:
- Firebase Admin SDK (no credentials needed in Functions)
- All Firebase services (Firestore, Storage, etc.)

### Setting Environment Variables for Functions
```bash
firebase functions:config:set stripe.secret_key="sk_..."
firebase functions:config:set email.host="smtp.gmail.com"
```

Or use `.runtimeconfig.json` for local development.

## API URLs

### Development
- Frontend: `http://localhost:5173`
- API: `http://localhost:5000/api` (or via Firebase emulator)

### Production
- Frontend: `https://beatcrest.web.app`
- API: `https://beatcrest.web.app/api` (via Firebase Hosting rewrite to Functions)
- Direct Function URL: `https://us-central1-beatcrest.cloudfunctions.net/api`

## Benefits of Migration

1. **Unified Platform**: Everything on Firebase (Hosting, Functions, Firestore, Storage)
2. **Better Integration**: Seamless integration between frontend and backend
3. **Cost Efficiency**: No separate server costs (Functions are pay-per-use)
4. **Automatic Scaling**: Functions scale automatically
5. **Simplified Deployment**: Single command deploys everything
6. **No Cold Starts**: Functions can be kept warm
7. **Better Security**: Firebase handles authentication and authorization

## Next Steps

1. Deploy Functions to Firebase
2. Test all API endpoints
3. Update any hardcoded Render URLs
4. Monitor Functions logs
5. Set up environment variables for Functions
6. Configure Firebase Storage bucket rules

