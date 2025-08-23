const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, account_type = 'artist' } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // TODO: Implement MongoDB user creation
    // For now, return mock response
    const mockUser = {
      id: 'mock-user-id',
      username,
      email,
      account_type,
      created_at: new Date().toISOString()
    };

    // Generate JWT token
    const token = jwt.sign(
      { userId: mockUser.id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: mockUser.id,
        username: mockUser.username,
        email: mockUser.email,
        account_type: mockUser.account_type
      },
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // TODO: Implement MongoDB user authentication
    // For now, return mock response
    const mockUser = {
      id: 'mock-user-id',
      username: 'mockuser',
      email,
      account_type: 'artist',
      is_verified: true
    };

    // Generate JWT token
    const token = jwt.sign(
      { userId: mockUser.id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: mockUser.id,
        username: mockUser.username,
        email: mockUser.email,
        account_type: mockUser.account_type
      },
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get current user profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    // TODO: Implement MongoDB user retrieval
    // For now, return mock user data
    const mockUser = {
      id: req.user.userId,
      username: 'mockuser',
      email: 'mock@example.com',
      account_type: 'artist',
      profile_picture: 'https://example.com/profile.jpg',
      bio: 'Mock user bio',
      followers_count: 0,
      following_count: 0,
      created_at: new Date().toISOString()
    };

    res.json({ user: mockUser });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { username, bio, profile_picture } = req.body;

    // TODO: Implement MongoDB profile update
    // For now, return mock response
    const updatedUser = {
      id: req.user.userId,
      username: username || 'mockuser',
      bio: bio || 'Mock user bio',
      profile_picture: profile_picture || 'https://example.com/profile.jpg'
    };

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Change password
router.put('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    // TODO: Implement MongoDB password change
    // For now, return mock response
    res.json({ message: 'Password changed successfully' });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// Google OAuth (placeholder)
router.get('/google', (req, res) => {
  res.json({ message: 'Google OAuth not implemented yet' });
});

// Facebook OAuth (placeholder)
router.get('/facebook', (req, res) => {
  res.json({ message: 'Facebook OAuth not implemented yet' });
});

module.exports = router; 