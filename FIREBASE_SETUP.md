# Firebase Setup Guide for BeatCrest

This guide will help you set up Firebase Firestore for the BeatCrest application.

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Follow the setup wizard:
   - Enter project name: `beatcrest` (or your preferred name)
   - Enable/disable Google Analytics (optional)
   - Click "Create project"

## Step 2: Set Up Firestore Database

1. In Firebase Console, click on "Firestore Database" in the left sidebar
2. Click "Create database"
3. Choose "Start in production mode" (you can add security rules later)
4. Select a location closest to your users
5. Click "Enable"

## Step 3: Create Service Account

1. In Firebase Console, click on the gear icon ⚙️ next to "Project Overview"
2. Go to "Project settings"
3. Click on "Service accounts" tab
4. Click "Generate new private key"
5. Save the JSON file securely (this contains your credentials)

## Step 4: Configure Environment Variables

You have three options to configure Firebase:

### Option 1: Service Account JSON (Recommended)

Add the entire service account JSON as a single-line string in your `.env` file:

```bash
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"your-project-id","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"...","client_id":"...","auth_uri":"...","token_uri":"...","auth_provider_x509_cert_url":"...","client_x509_cert_url":"..."}
```

### Option 2: Individual Credentials

Extract values from the service account JSON and add to `.env`:

```bash
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nYour Private Key Here\n-----END PRIVATE KEY-----\n
```

**Important:** The private key must include the `\n` characters for newlines as shown.

### Option 3: Default Credentials (Local Development)

For local development with gcloud CLI:

1. Install [Google Cloud SDK](https://cloud.google.com/sdk/docs/install)
2. Run: `gcloud auth application-default login`
3. No environment variables needed - Firebase will use default credentials

## Step 5: Install Dependencies

```bash
cd backend
npm install
```

## Step 6: Create .env File

Copy `env.example` to `.env` and fill in your Firebase credentials:

```bash
cp env.example .env
```

Edit `.env` and add your Firebase configuration.

## Step 7: Start the Server

```bash
npm run dev
```

You should see:
```
✅ Firebase initialized with service account
✅ Firestore database initialized
🚀 BeatCrest API Server running on port 5000
```

## Security Rules (Recommended)

Add these Firestore security rules in Firebase Console > Firestore Database > Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if true; // Anyone can read user profiles
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Beats collection
    match /beats/{beatId} {
      allow read: if true; // Anyone can read beats
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
        resource.data.producer == request.auth.uid;
    }
    
    // Purchases collection
    match /purchases/{purchaseId} {
      allow read: if request.auth != null && 
        (resource.data.buyer == request.auth.uid || 
         resource.data.seller == request.auth.uid);
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
        (resource.data.buyer == request.auth.uid || 
         resource.data.seller == request.auth.uid);
    }
    
    // Comments collection
    match /comments/{commentId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
        resource.data.user == request.auth.uid;
    }
    
    // Messages collection
    match /messages/{messageId} {
      allow read: if request.auth != null && 
        (resource.data.sender == request.auth.uid || 
         resource.data.receiver == request.auth.uid);
      allow create: if request.auth != null;
    }
    
    // Notifications collection
    match /notifications/{notificationId} {
      allow read: if request.auth != null && 
        resource.data.user == request.auth.uid;
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
        resource.data.user == request.auth.uid;
    }
  }
}
```

## Troubleshooting

### Error: "Failed to initialize Firebase"
- Check that your service account JSON is valid
- Verify environment variables are set correctly
- Ensure private key format includes `\n` characters

### Error: "Permission denied"
- Check Firestore security rules
- Verify service account has proper permissions in Google Cloud Console

### Connection Issues
- Verify your project ID is correct
- Check internet connection
- Ensure Firestore is enabled in your Firebase project

## Collections Created Automatically

The app will automatically create these collections:
- `users` - User accounts and profiles
- `beats` - Beat information and metadata
- `purchases` - Transaction records
- `comments` - Beat comments
- `messages` - Direct messages
- `notifications` - User notifications

## Next Steps

1. Test authentication endpoints
2. Test beat upload and retrieval
3. Set up Firebase Storage for file uploads (optional)
4. Configure security rules for production
5. Set up Firebase Indexes for complex queries

## Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)

