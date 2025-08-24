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
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// CORS configuration - more permissive
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'https://beatscrest.netlify.app',
      'https://68aa6038b0f0dcb34d8adc83--beatscrest.netlify.app',
      'https://*.netlify.app',
      'https://*.onrender.com'
    ];
    
    // Check if origin is allowed
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (allowedOrigin.includes('*')) {
        return origin.includes(allowedOrigin.replace('*', ''));
      }
      return origin === allowedOrigin;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(null, true); // Allow anyway for development
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files
app.use(express.static('public'));

// Handle CORS preflight requests
app.options('*', cors(corsOptions));

// Routes - Add back one by one
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const beatRoutes = require('./routes/beats');
const paymentRoutes = require('./routes/payments');
const messageRoutes = require('./routes/messages');
const adminRoutes = require('./routes/admin');

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/beats', beatRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/admin', adminRoutes);

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

// Simple test endpoint for CORS debugging
app.get('/cors-test', (req, res) => {
  console.log('✅ /cors-test endpoint hit!');
  console.log('Origin:', req.headers.origin);
  res.json({
    message: 'CORS test successful',
    origin: req.headers.origin,
    timestamp: new Date().toISOString(),
    server: 'BeatCrest Backend',
    cors: 'enabled'
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
      'GET /api/ip',
      'GET /cors-test'
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
      console.log(`🔗 Available endpoints:`);
      console.log(`   - GET /`);
      console.log(`   - GET /api/health`);
      console.log(`   - GET /api/test`);
      console.log(`   - GET /api/ip`);
      console.log(`   - GET /cors-test`);
      console.log(`🔗 Test URLs:`);
      console.log(`   - http://localhost:${PORT}/`);
      console.log(`   - http://localhost:${PORT}/api/health`);
      console.log(`   - http://localhost:${PORT}/api/test`);
      console.log(`   - http://localhost:${PORT}/cors-test`);
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = { app, io }; 