const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS - Allow everything
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test endpoints
app.get('/', (req, res) => {
  res.json({
    message: 'BeatCrest API is running!',
    timestamp: new Date().toISOString(),
    cors: 'enabled'
  });
});

app.get('/ping', (req, res) => {
  res.json({
    message: 'pong',
    timestamp: new Date().toISOString(),
    cors: 'enabled'
  });
});

app.get('/api/test', (req, res) => {
  res.json({
    message: 'API test successful!',
    timestamp: new Date().toISOString(),
    cors: 'enabled',
    origin: req.headers.origin
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Server is healthy',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    availableEndpoints: ['GET /', 'GET /ping', 'GET /api/test', 'GET /api/health']
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 CORS enabled for all origins`);
  console.log(`🔗 Test URL: http://localhost:${PORT}/api/test`);
});

module.exports = app; 