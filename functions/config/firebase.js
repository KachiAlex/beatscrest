const admin = require('firebase-admin');

// Get Firestore instance (Firebase Functions auto-initializes admin)
const getFirestore = () => {
  return admin.firestore();
};

// Initialize Firebase (no-op in Functions, already initialized)
const initializeFirebase = () => {
  const db = admin.firestore();
  db.settings({
    timestampsInSnapshots: true
  });
  console.log('✅ Firestore database initialized');
  return db;
};

// Collection names
const COLLECTIONS = {
  USERS: 'users',
  BEATS: 'beats',
  PURCHASES: 'purchases',
  COMMENTS: 'comments',
  MESSAGES: 'messages',
  NOTIFICATIONS: 'notifications',
  TENANTS: 'tenants'
};

module.exports = {
  initializeFirebase,
  getFirestore,
  admin,
  COLLECTIONS
};

