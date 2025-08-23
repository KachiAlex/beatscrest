const express = require('express');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Search users (specific route first)
router.get('/search', optionalAuth, async (req, res) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    // TODO: Implement MongoDB user search
    // For now, return mock search results
    const mockSearchResults = [
      {
        id: 'user1',
        username: 'producer1',
        profile_picture: 'https://example.com/user1.jpg',
        account_type: 'producer'
      },
      {
        id: 'user2',
        username: 'artist1',
        profile_picture: 'https://example.com/user2.jpg',
        account_type: 'artist'
      }
    ];

    res.json({
      users: mockSearchResults,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: mockSearchResults.length,
        pages: 1
      }
    });

  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ error: 'Failed to search users' });
  }
});

// Get user profile by username
router.get('/profile/:username', optionalAuth, async (req, res) => {
  try {
    const { username } = req.params;

    // TODO: Implement MongoDB user retrieval
    // For now, return mock user data
    const mockUser = {
      id: 'mock-user-id',
      username,
      profile_picture: 'https://example.com/profile.jpg',
      bio: 'Mock user bio',
      account_type: 'artist',
      is_verified: true,
      followers_count: 150,
      following_count: 75,
      created_at: new Date().toISOString(),
      is_following: false
    };

    res.json({ user: mockUser });

  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ error: 'Failed to get user profile' });
  }
});

// Get user's beats
router.get('/:username/beats', optionalAuth, async (req, res) => {
  try {
    const { username } = req.params;
    const { page = 1, limit = 20 } = req.query;

    // TODO: Implement MongoDB beats retrieval
    // For now, return mock beats data
    const mockBeats = [
      {
        id: 'beat1',
        title: 'Amazing Beat',
        description: 'A fire beat',
        genre: 'Hip Hop',
        bpm: 140,
        price: 45000,
        preview_url: 'https://example.com/preview1.mp3',
        thumbnail_url: 'https://example.com/thumbnail1.jpg',
        created_at: new Date().toISOString(),
        is_liked: false
      },
      {
        id: 'beat2',
        title: 'R&B Vibes',
        description: 'Smooth R&B beat',
        genre: 'R&B',
        bpm: 120,
        price: 35000,
        preview_url: 'https://example.com/preview2.mp3',
        thumbnail_url: 'https://example.com/thumbnail2.jpg',
        created_at: new Date().toISOString(),
        is_liked: true
      }
    ];

    res.json({
      beats: mockBeats,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: mockBeats.length,
        pages: 1
      }
    });

  } catch (error) {
    console.error('Get user beats error:', error);
    res.status(500).json({ error: 'Failed to get user beats' });
  }
});

// Follow user
router.post('/:username/follow', authenticateToken, async (req, res) => {
  try {
    const { username } = req.params;

    // TODO: Implement MongoDB follow functionality
    // For now, return mock response
    res.json({ message: 'User followed successfully' });

  } catch (error) {
    console.error('Follow user error:', error);
    res.status(500).json({ error: 'Failed to follow user' });
  }
});

// Unfollow user
router.delete('/:username/follow', authenticateToken, async (req, res) => {
  try {
    const { username } = req.params;

    // TODO: Implement MongoDB unfollow functionality
    // For now, return mock response
    res.json({ message: 'User unfollowed successfully' });

  } catch (error) {
    console.error('Unfollow user error:', error);
    res.status(500).json({ error: 'Failed to unfollow user' });
  }
});

// Get user's followers
router.get('/:username/followers', optionalAuth, async (req, res) => {
  try {
    const { username } = req.params;
    const { page = 1, limit = 20 } = req.query;

    // TODO: Implement MongoDB followers retrieval
    // For now, return mock followers data
    const mockFollowers = [
      {
        id: 'follower1',
        username: 'follower1',
        profile_picture: 'https://example.com/follower1.jpg',
        created_at: new Date().toISOString()
      }
    ];

    res.json({
      followers: mockFollowers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: mockFollowers.length,
        pages: 1
      }
    });

  } catch (error) {
    console.error('Get followers error:', error);
    res.status(500).json({ error: 'Failed to get followers' });
  }
});

// Get user's following
router.get('/:username/following', optionalAuth, async (req, res) => {
  try {
    const { username } = req.params;
    const { page = 1, limit = 20 } = req.query;

    // TODO: Implement MongoDB following retrieval
    // For now, return mock following data
    const mockFollowing = [
      {
        id: 'following1',
        username: 'following1',
        profile_picture: 'https://example.com/following1.jpg',
        created_at: new Date().toISOString()
      }
    ];

    res.json({
      following: mockFollowing,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: mockFollowing.length,
        pages: 1
      }
    });

  } catch (error) {
    console.error('Get following error:', error);
    res.status(500).json({ error: 'Failed to get following' });
  }
});

module.exports = router; 