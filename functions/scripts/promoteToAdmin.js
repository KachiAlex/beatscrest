/**
 * Script to promote a user to admin
 * Usage: node promoteToAdmin.js <email>
 * 
 * This script requires Firebase Admin SDK to be initialized
 */

const admin = require('firebase-admin');
const { COLLECTIONS } = require('../config/firebase');

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  try {
    // Try to use service account from environment
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    } else {
      // Use default credentials (from Firebase Functions environment)
      admin.initializeApp();
    }
  } catch (error) {
    console.error('Firebase initialization error:', error);
    process.exit(1);
  }
}

const db = admin.firestore();

async function promoteToAdmin(email) {
  try {
    console.log(`Searching for user with email: ${email}...`);
    
    // Find user by email
    const usersRef = db.collection(COLLECTIONS.USERS);
    const snapshot = await usersRef.where('email', '==', email).limit(1).get();
    
    if (snapshot.empty) {
      console.error(`❌ User with email ${email} not found.`);
      process.exit(1);
    }
    
    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();
    
    console.log(`Found user: ${userData.username} (${userData.email})`);
    console.log(`Current accountType: ${userData.accountType || 'not set'}`);
    
    // Update accountType to Admin
    await userDoc.ref.update({
      accountType: 'Admin',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log(`✅ Successfully promoted ${userData.username} to Admin!`);
    console.log(`   User ID: ${userDoc.id}`);
    console.log(`   Email: ${userData.email}`);
    console.log(`   New accountType: Admin`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error promoting user to admin:', error);
    process.exit(1);
  }
}

// Get email from command line arguments
const email = process.argv[2];

if (!email) {
  console.error('❌ Please provide an email address.');
  console.log('Usage: node promoteToAdmin.js <email>');
  process.exit(1);
}

// Validate email format
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  console.error('❌ Invalid email format.');
  process.exit(1);
}

promoteToAdmin(email);

