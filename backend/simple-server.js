const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

console.log('🚀 Starting simple server...');
console.log('📦 CORS package loaded:', typeof cors);

// CORS - Allow everything with explicit configuration
app.use(cors({
  origin: '*',
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));

// Additional CORS headers for preflight
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

console.log('✅ Middleware configured');

// Test endpoints
app.get('/', (req, res) => {
  console.log('📍 Root endpoint hit');
  res.json({
    message: 'BeatCrest API is running!',
    timestamp: new Date().toISOString(),
    cors: 'enabled',
    server: 'simple-server.js'
  });
});

app.get('/ping', (req, res) => {
  console.log('📍 Ping endpoint hit');
  res.json({
    message: 'pong',
    timestamp: new Date().toISOString(),
    cors: 'enabled',
    server: 'simple-server.js'
  });
});

app.get('/api/test', (req, res) => {
  console.log('📍 API test endpoint hit');
  console.log('🌐 Origin:', req.headers.origin);
  res.json({
    message: 'API test successful!',
    timestamp: new Date().toISOString(),
    cors: 'enabled',
    origin: req.headers.origin,
    server: 'simple-server.js'
  });
});

app.get('/api/health', (req, res) => {
  console.log('📍 Health endpoint hit');
  res.json({
    status: 'OK',
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    server: 'simple-server.js'
  });
});

// 404 handler
app.use('*', (req, res) => {
  console.log('❌ 404 - Route not found:', req.originalUrl);
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    server: 'simple-server.js',
    availableEndpoints: ['GET /', 'GET /ping', 'GET /api/test', 'GET /api/health']
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Simple server running on port ${PORT}`);
  console.log(`🌐 CORS enabled for all origins`);
  console.log(`🔗 Test URL: http://localhost:${PORT}/api/test`);
  console.log(`📋 Available endpoints:`);
  console.log(`   - GET /`);
  console.log(`   - GET /ping`);
  console.log(`   - GET /api/test`);
  console.log(`   - GET /api/health`);
});

module.exports = app; 