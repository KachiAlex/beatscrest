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

// Database connection
const { connectDatabase, initializeDatabase } = require('./config/database');

// Routes
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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'BeatCrest API is running',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint for testing
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

// Simple test endpoint
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Server is working!',
    timestamp: new Date().toISOString(),
    server: 'BeatCrest Backend',
    status: 'active'
  });
});

// Simple IP endpoint (works without database)
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
  
  // Join user to their personal room
  socket.on('join', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`User ${userId} joined their room`);
  });
  
  // Handle private messages
  socket.on('private_message', (data) => {
    const { recipientId, message } = data;
    io.to(`user_${recipientId}`).emit('new_message', message);
  });
  
  // Handle notifications
  socket.on('notification', (data) => {
    const { userId, notification } = data;
    io.to(`user_${userId}`).emit('new_notification', notification);
  });
  
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

// 404 handler
app.use('/*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

// Initialize database and start server
const startServer = async () => {
  try {
    // Start server immediately
    server.listen(PORT, () => {
      console.log(`🚀 BeatCrest API server running on port ${PORT}`);
      console.log(`📱 Socket.io server initialized`);
      console.log(`🌐 Server ready to accept requests`);
    });
    
    // Temporarily disable MongoDB connection for testing
    console.log('⚠️ MongoDB connection temporarily disabled for testing');
    
    // Try to connect to MongoDB in background (non-blocking)
    // setTimeout(async () => {
    //   try {
    //     await connectDatabase();
    //     console.log(`🍃 MongoDB connected successfully`);
    //   } catch (dbError) {
    //     console.error('❌ MongoDB connection failed, but server is running:', dbError.message);
    //     console.log('⚠️ Server is running without database connection');
    //   }
    // }, 1000);
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = { app, io }; 