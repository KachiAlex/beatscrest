const express = require('express');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { User, Beat } = require('../models');

const router = express.Router();

// Search users (specific route first)
router.get('/search', optionalAuth, async (req, res) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const users = await User.search(q, parseInt(limit) * parseInt(page));
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const paginatedUsers = users.slice(offset, offset + parseInt(limit));

    res.json({
      users: paginatedUsers.map(u => ({
        id: u.id,
        username: u.username,
        profile_picture: u.profilePicture,
        account_type: u.accountType?.toLowerCase() || 'artist'
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: users.length,
        pages: Math.ceil(users.length / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ error: 'Failed to search users', details: error.message });
  }
});

// Get user profile by username
router.get('/profile/:username', optionalAuth, async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findByUsername(username);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { password, ...userData } = user;
    const isFollowing = req.user && user.followers?.includes(req.user.userId);

    res.json({
      user: {
        ...userData,
        profile_picture: userData.profilePicture,
        account_type: userData.accountType?.toLowerCase() || 'artist',
        followers_count: userData.followers?.length || 0,
        following_count: userData.following?.length || 0,
        is_following: isFollowing || false
      }
    });

  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ error: 'Failed to get user profile', details: error.message });
  }
});

// Get user's beats
router.get('/:username/beats', optionalAuth, async (req, res) => {
  try {
    const { username } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const user = await User.findByUsername(username);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const beats = await Beat.findMany(
      { producerId: user.id },
      parseInt(page),
      parseInt(limit)
    );

    // Check if user has liked beats
    const beatsWithLikes = beats.map(beat => ({
      ...beat,
      preview_url: beat.previewUrl,
      thumbnail_url: beat.thumbnailUrl,
      is_liked: req.user && beat.likes?.includes(req.user.userId) || false
    }));

    res.json({
      beats: beatsWithLikes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: beats.length,
        pages: Math.ceil(beats.length / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Get user beats error:', error);
    res.status(500).json({ error: 'Failed to get user beats', details: error.message });
  }
});

// Follow user
router.post('/:username/follow', authenticateToken, async (req, res) => {
  try {
    const { username } = req.params;

    if (username === req.user.username) {
      return res.status(400).json({ error: 'Cannot follow yourself' });
    }

    const followee = await User.findByUsername(username);
    if (!followee) {
      return res.status(404).json({ error: 'User not found' });
    }

    const result = await User.follow(req.user.userId, followee.id);
    
    if (!result.followed) {
      return res.status(400).json({ error: result.message || 'Already following' });
    }

    res.json({ message: 'User followed successfully' });

  } catch (error) {
    console.error('Follow user error:', error);
    res.status(500).json({ error: 'Failed to follow user', details: error.message });
  }
});

// Unfollow user
router.delete('/:username/follow', authenticateToken, async (req, res) => {
  try {
    const { username } = req.params;

    const followee = await User.findByUsername(username);
    if (!followee) {
      return res.status(404).json({ error: 'User not found' });
    }

    const result = await User.unfollow(req.user.userId, followee.id);
    
    if (!result.unfollowed) {
      return res.status(400).json({ error: result.message || 'Not following' });
    }

    res.json({ message: 'User unfollowed successfully' });

  } catch (error) {
    console.error('Unfollow user error:', error);
    res.status(500).json({ error: 'Failed to unfollow user', details: error.message });
  }
});

// Get user's followers
router.get('/:username/followers', optionalAuth, async (req, res) => {
  try {
    const { username } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const user = await User.findByUsername(username);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const followerIds = user.followers || [];
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const paginatedIds = followerIds.slice(offset, offset + parseInt(limit));

    const followers = await Promise.all(
      paginatedIds.map(async (followerId) => {
        const follower = await User.findById(followerId);
        if (!follower) return null;
        const isFollowing = req.user && req.user.following?.includes(followerId);
        return {
          id: follower.id,
          username: follower.username,
          profile_picture: follower.profilePicture,
          is_following: isFollowing || false
        };
      })
    );

    res.json({
      followers: followers.filter(f => f !== null),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: followerIds.length,
        pages: Math.ceil(followerIds.length / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Get followers error:', error);
    res.status(500).json({ error: 'Failed to get followers', details: error.message });
  }
});

// Get user's following
router.get('/:username/following', optionalAuth, async (req, res) => {
  try {
    const { username } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const user = await User.findByUsername(username);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const followingIds = user.following || [];
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const paginatedIds = followingIds.slice(offset, offset + parseInt(limit));

    const following = await Promise.all(
      paginatedIds.map(async (followingId) => {
        const followee = await User.findById(followingId);
        if (!followee) return null;
        return {
          id: followee.id,
          username: followee.username,
          profile_picture: followee.profilePicture,
          is_following: true
        };
      })
    );

    res.json({
      following: following.filter(f => f !== null),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: followingIds.length,
        pages: Math.ceil(followingIds.length / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Get following error:', error);
    res.status(500).json({ error: 'Failed to get following', details: error.message });
  }
});

module.exports = router; 