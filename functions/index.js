const functions = require('firebase-functions/v1');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');

// Initialize Firebase Admin (uses default credentials in Firebase Functions)
admin.initializeApp();

const app = express();

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialize Firebase models
const { initializeFirebase } = require('./config/firebase');
initializeFirebase();

// Health check (before /api prefix)
app.get('/', (req, res) => {
  res.json({
    message: 'BeatCrest API is running on Firebase Functions!',
    timestamp: new Date().toISOString(),
    status: 'OK',
    database: 'Firebase Firestore'
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    database: 'Firebase Firestore'
  });
});

// All API routes under /api prefix (Firebase Hosting sends /api/** to this function)
app.use('/api/auth', require('./routes/auth'));
app.use('/api/beats', require('./routes/beats'));
app.use('/api/users', require('./routes/users'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/admin', require('./routes/admin'));

// Also support routes without /api for direct function calls
app.use('/auth', require('./routes/auth'));
app.use('/beats', require('./routes/beats'));
app.use('/users', require('./routes/users'));
app.use('/payments', require('./routes/payments'));
app.use('/messages', require('./routes/messages'));
app.use('/notifications', require('./routes/notifications'));
app.use('/admin', require('./routes/admin'));

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

// Export as Firebase Function (simple v1 API for compatibility)
exports.api = functions.https.onRequest(app);

