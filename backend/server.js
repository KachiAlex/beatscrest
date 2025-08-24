const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || "http://localhost:3000",
    "https://*.netlify.app",
    "https://*.onrender.com"
  ],
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files
app.use(express.static('public'));

// Basic endpoints without route imports
app.get('/', (req, res) => {
  res.json({ 
    message: 'BeatCrest API Root',
    endpoints: {
      health: '/api/health',
      test: '/api/test',
      ip: '/api/ip'
    },
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'BeatCrest API is running',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Server is working!',
    timestamp: new Date().toISOString(),
    server: 'BeatCrest Backend',
    status: 'active'
  });
});

app.get('/api/ip', (req, res) => {
  const ip = req.ip || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket?.remoteAddress;
  res.json({ 
    ip: ip,
    xForwardedFor: req.headers['x-forwarded-for'],
    xRealIp: req.headers['x-real-ip'],
    message: 'Use this IP to whitelist in MongoDB Atlas'
  });
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler - only for unmatched routes
app.use('*', (req, res) => {
  console.log(`404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method,
    availableEndpoints: [
      'GET /',
      'GET /api/health',
      'GET /api/test',
      'GET /api/ip'
    ]
  });
});

const PORT = process.env.PORT || 5000;

// Start server
const startServer = async () => {
  try {
    console.log(`🔧 Starting server on port ${PORT}...`);
    
    server.listen(PORT, () => {
      console.log(`🚀 BeatCrest API server running on port ${PORT}`);
      console.log(`📱 Socket.io server initialized`);
      console.log(`🌐 Server ready to accept requests`);
      console.log(`🔗 Test URLs:`);
      console.log(`   - http://localhost:${PORT}/`);
      console.log(`   - http://localhost:${PORT}/api/health`);
      console.log(`   - http://localhost:${PORT}/api/test`);
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = { app, io }; 