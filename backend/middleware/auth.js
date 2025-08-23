const jwt = require('jsonwebtoken');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // TODO: Implement MongoDB user retrieval
    // For now, use mock user data
    const mockUser = {
      id: decoded.userId,
      userId: decoded.userId, // Keep both for compatibility
      username: 'mockuser',
      email: 'mock@example.com',
      account_type: 'artist',
      is_verified: true
    };

    req.user = mockUser;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Authentication error' });
  }
};

const requireProducer = (req, res, next) => {
  if (req.user.account_type !== 'producer') {
    return res.status(403).json({ error: 'Producer account required' });
  }
  next();
};

const requireAdmin = (req, res, next) => {
  if (req.user.account_type !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      
      // TODO: Implement MongoDB user retrieval
      // For now, use mock user data
      const mockUser = {
        id: decoded.userId,
        userId: decoded.userId,
        username: 'mockuser',
        email: 'mock@example.com',
        account_type: 'artist'
      };
      
      req.user = mockUser;
    }
    next();
  } catch (error) {
    // Continue without authentication for optional routes
    next();
  }
};

module.exports = {
  authenticateToken,
  requireProducer,
  requireAdmin,
  optionalAuth
}; 