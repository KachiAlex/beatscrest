const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
let db = null;

const initializeFirebase = () => {
  try {
    // Check if Firebase is already initialized
    if (admin.apps.length > 0) {
      console.log('✅ Firebase already initialized');
      db = admin.firestore();
      return db;
    }

    // Option 1: Initialize with service account JSON (recommended for production)
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      console.log('✅ Firebase initialized with service account');
    }
    // Option 2: Initialize with individual credentials from env vars
    else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
        })
      });
      console.log('✅ Firebase initialized with environment variables');
    }
    // Option 3: Initialize with default credentials (for local development with gcloud)
    else {
      admin.initializeApp({
        credential: admin.credential.applicationDefault()
      });
      console.log('✅ Firebase initialized with default credentials');
    }

    db = admin.firestore();
    
    // Configure Firestore settings
    db.settings({
      timestampsInSnapshots: true
    });

    console.log('✅ Firestore database initialized');
    return db;
  } catch (error) {
    console.error('❌ Firebase initialization error:', error.message);
    throw error;
  }
};

// Get Firestore instance
const getFirestore = () => {
  if (!db) {
    return initializeFirebase();
  }
  return db;
};

// Collection names
const COLLECTIONS = {
  USERS: 'users',
  BEATS: 'beats',
  PURCHASES: 'purchases',
  COMMENTS: 'comments',
  MESSAGES: 'messages',
  NOTIFICATIONS: 'notifications'
};

module.exports = {
  initializeFirebase,
  getFirestore,
  admin,
  COLLECTIONS
};

