const express = require('express');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get conversations list
router.get('/conversations', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT DISTINCT 
        CASE 
          WHEN m.sender_id = $1 THEN m.recipient_id
          ELSE m.sender_id
        END as other_user_id,
        u.username, u.profile_picture,
        (SELECT content FROM messages 
         WHERE (sender_id = $1 AND recipient_id = other_user_id) 
            OR (sender_id = other_user_id AND recipient_id = $1)
         ORDER BY created_at DESC LIMIT 1) as last_message,
        (SELECT created_at FROM messages 
         WHERE (sender_id = $1 AND recipient_id = other_user_id) 
            OR (sender_id = other_user_id AND recipient_id = $1)
         ORDER BY created_at DESC LIMIT 1) as last_message_time,
        (SELECT COUNT(*) FROM messages 
         WHERE sender_id = other_user_id AND recipient_id = $1 AND is_read = FALSE) as unread_count
       FROM messages m
       JOIN users u ON (CASE 
         WHEN m.sender_id = $1 THEN m.recipient_id
         ELSE m.sender_id
       END) = u.id
       WHERE m.sender_id = $1 OR m.recipient_id = $1
       ORDER BY last_message_time DESC`,
      [req.user.id]
    );

    res.json({ conversations: result.rows });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Failed to get conversations' });
  }
});

// Get messages with a specific user
router.get('/conversation/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    // Mark messages as read
    await db.query(
      'UPDATE messages SET is_read = TRUE WHERE sender_id = $1 AND recipient_id = $2 AND is_read = FALSE',
      [userId, req.user.id]
    );

    const result = await db.query(
      `SELECT m.*, u.username, u.profile_picture
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       WHERE (m.sender_id = $1 AND m.recipient_id = $2) 
          OR (m.sender_id = $2 AND m.recipient_id = $1)
       ORDER BY m.created_at DESC
       LIMIT $3 OFFSET $4`,
      [req.user.id, userId, limit, offset]
    );

    res.json({ messages: result.rows.reverse() });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to get messages' });
  }
});

// Send message
router.post('/send', authenticateToken, async (req, res) => {
  try {
    const { recipientId, content } = req.body;

    if (!recipientId || !content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Recipient ID and message content are required' });
    }

    const result = await db.query(
      `INSERT INTO messages (sender_id, recipient_id, content)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [req.user.id, recipientId, content.trim()]
    );

    // Get sender info
    const senderResult = await db.query(
      'SELECT username, profile_picture FROM users WHERE id = $1',
      [req.user.id]
    );

    const message = {
      ...result.rows[0],
      username: senderResult.rows[0].username,
      profile_picture: senderResult.rows[0].profile_picture
    };

    res.status(201).json({
      message: 'Message sent successfully',
      data: message
    });

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Mark conversation as read
router.put('/conversation/:userId/read', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    await db.query(
      'UPDATE messages SET is_read = TRUE WHERE sender_id = $1 AND recipient_id = $2 AND is_read = FALSE',
      [userId, req.user.id]
    );

    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ error: 'Failed to mark messages as read' });
  }
});

// Get unread message count
router.get('/unread-count', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT COUNT(*) as count FROM messages WHERE recipient_id = $1 AND is_read = FALSE',
      [req.user.id]
    );

    res.json({ unreadCount: parseInt(result.rows[0].count) });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ error: 'Failed to get unread count' });
  }
});

module.exports = router; 