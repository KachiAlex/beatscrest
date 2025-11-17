const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { authenticateToken } = require('../middleware/auth');
const { User } = require('../models');

const router = express.Router();

// Helper: get JWT secret, falling back to a default for demo environments
const getJwtSecret = () => {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
  console.warn('JWT_SECRET not set; using insecure default dev secret. Configure JWT_SECRET in production.');
  return 'beatcrest-dev-jwt-secret';
};

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, account_type = 'artist' } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Validate username format (alphanumeric, underscore, hyphen, 3-20 chars)
    const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
    if (!usernameRegex.test(username)) {
      return res.status(400).json({ error: 'Username must be 3-20 characters and contain only letters, numbers, underscores, or hyphens' });
    }

    // Validate password strength (minimum 8 characters)
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    // Check password complexity (at least one letter and one number)
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    if (!hasLetter || !hasNumber) {
      return res.status(400).json({ error: 'Password must contain at least one letter and one number' });
    }

    // Check if user already exists
    const existingUserByEmail = await User.findByEmail(email);
    if (existingUserByEmail) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const existingUserByUsername = await User.findByUsername(username);
    if (existingUserByUsername) {
      return res.status(400).json({ error: 'Username already taken' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      accountType: account_type === 'producer' ? 'Producer' : account_type === 'artist' ? 'Artist' : 'Fan',
      profilePicture: '',
      bio: ''
    });

    const token = jwt.sign(
      { userId: newUser.id },
      getJwtSecret(),
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        account_type: newUser.accountType
      },
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed', details: error.message });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Find user by email in Firestore user collection
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // If this user was created without a password (e.g. via promote-admin or a script),
    // treat the first successful login as a password setup: hash and store it.
    if (!user.password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      const updated = await User.update(user.id, { password: hashedPassword });
      user.password = updated.password || hashedPassword;
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { userId: user.id },
      getJwtSecret(),
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        account_type: user.accountType?.toLowerCase() || 'artist'
      },
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed', details: error.message });
  }
});

// Get current user profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Remove password from response
    const { password, ...userData } = user;

    res.json({
      user: {
        ...userData,
        followers_count: user.followers?.length || 0,
        following_count: user.following?.length || 0,
        account_type: user.accountType?.toLowerCase() || 'artist'
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile', details: error.message });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { username, bio, profile_picture } = req.body;
    const updates = {};

    // Check if username is being changed and if it's available
    if (username) {
      const existingUser = await User.findByUsername(username);
      if (existingUser && existingUser.id !== req.user.userId) {
        return res.status(400).json({ error: 'Username already taken' });
      }
      updates.username = username;
    }

    if (bio !== undefined) updates.bio = bio;
    if (profile_picture !== undefined) updates.profilePicture = profile_picture;

    const updatedUser = await User.update(req.user.userId, updates);

    // Remove password from response
    const { password, ...userData } = updatedUser;

    res.json({
      message: 'Profile updated successfully',
      user: userData
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile', details: error.message });
  }
});

// Change password
router.put('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new password are required' });
    }

    // Validate password strength (minimum 8 characters)
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters long' });
    }

    // Check password complexity (at least one letter and one number)
    const hasLetter = /[a-zA-Z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    if (!hasLetter || !hasNumber) {
      return res.status(400).json({ error: 'New password must contain at least one letter and one number' });
    }

    // Get user and verify current password
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password and update
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.update(req.user.userId, { password: hashedPassword });

    res.json({ message: 'Password changed successfully' });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password', details: error.message });
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

// Promote user to admin (requires master key)
router.post('/promote-admin', async (req, res) => {
  try {
    const { email, masterKey } = req.body;

    if (!email || !masterKey) {
      return res.status(400).json({ error: 'Email and master key are required' });
    }

    // Check master key (should be set in environment variables)
    const expectedMasterKey = process.env.ADMIN_MASTER_KEY || 'beatcrest-admin-2024';
    if (masterKey !== expectedMasterKey) {
      return res.status(403).json({ error: 'Invalid master key' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Find user by email (or create if not exists)
    let user = await User.findByEmail(email);
    if (!user) {
      // Auto-create a minimal user record so admin promotion works even if
      // the account was only created via mock login on the frontend.
      const usernameFromEmail = email.split('@')[0];
      user = await User.create({
        username: usernameFromEmail,
        email,
        password: '', // no password stored; real auth handled separately
        accountType: 'Admin',
        profilePicture: '',
        bio: ''
      });
    } else {
      // Update existing user to admin
      await User.update(user.id, {
        accountType: 'Admin'
      });
      user = await User.findById(user.id);
    }

    res.json({
      message: 'User promoted to admin successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        account_type: user.accountType?.toLowerCase() || 'admin'
      }
    });

  } catch (error) {
    console.error('Promote admin error:', error);
    res.status(500).json({ error: 'Failed to promote user to admin', details: error.message });
  }
});

module.exports = router; 