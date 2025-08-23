const express = require('express');
const db = require('../config/database');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Get user profile by username
router.get('/profile/:username', optionalAuth, async (req, res) => {
  try {
    const { username } = req.params;

    const result = await db.query(
      `SELECT id, username, profile_picture, bio, account_type, 
              is_verified, followers_count, following_count, created_at
       FROM users WHERE username = $1`,
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];

    // Check if current user is following this user
    if (req.user) {
      const followResult = await db.query(
        'SELECT id FROM followers WHERE follower_id = $1 AND following_id = $2',
        [req.user.id, user.id]
      );
      user.is_following = followResult.rows.length > 0;
    }

    res.json({ user });

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
    const offset = (page - 1) * limit;

    // Get user ID
    const userResult = await db.query(
      'SELECT id FROM users WHERE username = $1',
      [username]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userId = userResult.rows[0].id;

    // Get beats
    const beatsResult = await db.query(
      `SELECT b.*, u.username as producer_name, u.profile_picture as producer_picture
       FROM beats b
       JOIN users u ON b.producer_id = u.id
       WHERE b.producer_id = $1 AND b.is_active = TRUE
       ORDER BY b.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    // Get total count
    const countResult = await db.query(
      'SELECT COUNT(*) as total FROM beats WHERE producer_id = $1 AND is_active = TRUE',
      [userId]
    );

    const total = parseInt(countResult.rows[0].total);

    // Add like status for authenticated users
    if (req.user) {
      for (let beat of beatsResult.rows) {
        const likeResult = await db.query(
          'SELECT id FROM likes WHERE user_id = $1 AND beat_id = $2',
          [req.user.id, beat.id]
        );
        beat.is_liked = likeResult.rows.length > 0;
      }
    }

    res.json({
      beats: beatsResult.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get user beats error:', error);
    res.status(500).json({ error: 'Failed to get user beats' });
  }
});

// Follow/Unfollow user
router.post('/:username/follow', authenticateToken, async (req, res) => {
  try {
    const { username } = req.params;

    // Get user to follow
    const userResult = await db.query(
      'SELECT id FROM users WHERE username = $1',
      [username]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userToFollow = userResult.rows[0];

    // Check if trying to follow self
    if (userToFollow.id === req.user.id) {
      return res.status(400).json({ error: 'Cannot follow yourself' });
    }

    // Check if already following
    const existingFollow = await db.query(
      'SELECT id FROM followers WHERE follower_id = $1 AND following_id = $2',
      [req.user.id, userToFollow.id]
    );

    if (existingFollow.rows.length > 0) {
      // Unfollow
      await db.query(
        'DELETE FROM followers WHERE follower_id = $1 AND following_id = $2',
        [req.user.id, userToFollow.id]
      );

      // Update follower counts
      await db.query(
        'UPDATE users SET followers_count = followers_count - 1 WHERE id = $1',
        [userToFollow.id]
      );
      await db.query(
        'UPDATE users SET following_count = following_count - 1 WHERE id = $1',
        [req.user.id]
      );

      res.json({ message: 'User unfollowed', following: false });
    } else {
      // Follow
      await db.query(
        'INSERT INTO followers (follower_id, following_id) VALUES ($1, $2)',
        [req.user.id, userToFollow.id]
      );

      // Update follower counts
      await db.query(
        'UPDATE users SET followers_count = followers_count + 1 WHERE id = $1',
        [userToFollow.id]
      );
      await db.query(
        'UPDATE users SET following_count = following_count + 1 WHERE id = $1',
        [req.user.id]
      );

      // Send notification
      await db.query(
        `INSERT INTO notifications (user_id, type, title, message, related_id)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          userToFollow.id,
          'follow',
          'New Follower',
          `${req.user.username} started following you`,
          req.user.id
        ]
      );

      res.json({ message: 'User followed', following: true });
    }

  } catch (error) {
    console.error('Follow user error:', error);
    res.status(500).json({ error: 'Failed to follow/unfollow user' });
  }
});

// Get user's followers
router.get('/:username/followers', async (req, res) => {
  try {
    const { username } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    // Get user ID
    const userResult = await db.query(
      'SELECT id FROM users WHERE username = $1',
      [username]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userId = userResult.rows[0].id;

    // Get followers
    const result = await db.query(
      `SELECT u.id, u.username, u.profile_picture, u.bio, f.created_at as followed_at
       FROM followers f
       JOIN users u ON f.follower_id = u.id
       WHERE f.following_id = $1
       ORDER BY f.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    // Get total count
    const countResult = await db.query(
      'SELECT COUNT(*) as total FROM followers WHERE following_id = $1',
      [userId]
    );

    const total = parseInt(countResult.rows[0].total);

    res.json({
      followers: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get followers error:', error);
    res.status(500).json({ error: 'Failed to get followers' });
  }
});

// Get user's following
router.get('/:username/following', async (req, res) => {
  try {
    const { username } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    // Get user ID
    const userResult = await db.query(
      'SELECT id FROM users WHERE username = $1',
      [username]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userId = userResult.rows[0].id;

    // Get following
    const result = await db.query(
      `SELECT u.id, u.username, u.profile_picture, u.bio, f.created_at as followed_at
       FROM followers f
       JOIN users u ON f.following_id = u.id
       WHERE f.follower_id = $1
       ORDER BY f.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    // Get total count
    const countResult = await db.query(
      'SELECT COUNT(*) as total FROM followers WHERE follower_id = $1',
      [userId]
    );

    const total = parseInt(countResult.rows[0].total);

    res.json({
      following: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get following error:', error);
    res.status(500).json({ error: 'Failed to get following' });
  }
});

// Search users
router.get('/search', async (req, res) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const result = await db.query(
      `SELECT id, username, profile_picture, bio, account_type, 
              followers_count, following_count
       FROM users 
       WHERE username ILIKE $1 OR bio ILIKE $1
       ORDER BY followers_count DESC, username ASC
       LIMIT $2 OFFSET $3`,
      [`%${q.trim()}%`, limit, offset]
    );

    // Get total count
    const countResult = await db.query(
      'SELECT COUNT(*) as total FROM users WHERE username ILIKE $1 OR bio ILIKE $1',
      [`%${q.trim()}%`]
    );

    const total = parseInt(countResult.rows[0].total);

    res.json({
      users: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ error: 'Failed to search users' });
  }
});

// Get trending producers
router.get('/trending/producers', async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const result = await db.query(
      `SELECT u.id, u.username, u.profile_picture, u.bio, u.followers_count,
              COUNT(b.id) as beats_count,
              SUM(b.likes_count) as total_likes,
              SUM(b.plays_count) as total_plays
       FROM users u
       LEFT JOIN beats b ON u.id = b.producer_id AND b.is_active = TRUE
       WHERE u.account_type = 'producer'
       GROUP BY u.id, u.username, u.profile_picture, u.bio, u.followers_count
       ORDER BY u.followers_count DESC, total_likes DESC
       LIMIT $1`,
      [limit]
    );

    res.json({ producers: result.rows });

  } catch (error) {
    console.error('Get trending producers error:', error);
    res.status(500).json({ error: 'Failed to get trending producers' });
  }
});

module.exports = router; 