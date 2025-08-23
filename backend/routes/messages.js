const express = require('express');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get conversations list (specific route first)
router.get('/conversations', authenticateToken, async (req, res) => {
  try {
    // TODO: Implement MongoDB conversations retrieval
    // For now, return mock conversations data
    const mockConversations = [
      {
        other_user_id: 'user1',
        username: 'producer1',
        profile_picture: 'https://example.com/user1.jpg',
        last_message: 'Hey, I love your beat!',
        last_message_time: new Date().toISOString(),
        unread_count: 2
      },
      {
        other_user_id: 'user2',
        username: 'artist1',
        profile_picture: 'https://example.com/user2.jpg',
        last_message: 'Thanks for the collaboration!',
        last_message_time: new Date().toISOString(),
        unread_count: 0
      }
    ];

    res.json({ conversations: mockConversations });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Failed to get conversations' });
  }
});

// Get unread count (specific route)
router.get('/unread-count', authenticateToken, async (req, res) => {
  try {
    // TODO: Implement MongoDB unread count
    // For now, return mock count
    res.json({ unreadCount: 5 });

  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ error: 'Failed to get unread count' });
  }
});

// Get messages with a specific user (parameterized route)
router.get('/conversation/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // TODO: Implement MongoDB messages retrieval
    // For now, return mock messages data
    const mockMessages = [
      {
        id: 'msg1',
        sender_id: req.user.userId,
        recipient_id: userId,
        content: 'Hey, I love your beat!',
        is_read: true,
        created_at: new Date().toISOString(),
        username: 'currentuser',
        profile_picture: 'https://example.com/currentuser.jpg'
      },
      {
        id: 'msg2',
        sender_id: userId,
        recipient_id: req.user.userId,
        content: 'Thanks! I appreciate it.',
        is_read: true,
        created_at: new Date().toISOString(),
        username: 'otheruser',
        profile_picture: 'https://example.com/otheruser.jpg'
      }
    ];

    res.json({ messages: mockMessages });
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

    // TODO: Implement MongoDB message creation
    // For now, return mock message data
    const mockMessage = {
      id: 'new-msg-id',
      sender_id: req.user.userId,
      recipient_id: recipientId,
      content: content.trim(),
      is_read: false,
      created_at: new Date().toISOString(),
      username: 'currentuser',
      profile_picture: 'https://example.com/currentuser.jpg'
    };

    res.status(201).json({
      message: 'Message sent successfully',
      data: mockMessage
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

    // TODO: Implement MongoDB mark as read
    // For now, return mock response
    res.json({ message: 'Messages marked as read' });

  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ error: 'Failed to mark messages as read' });
  }
});

module.exports = router; 