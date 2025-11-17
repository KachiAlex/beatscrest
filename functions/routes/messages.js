const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { Message, User } = require('../models');

const router = express.Router();

// Get conversations list (specific route first)
router.get('/conversations', authenticateToken, async (req, res) => {
  try {
    const conversations = await Message.getConversations(req.user.userId);

    // Populate user info for each conversation
    const populatedConversations = await Promise.all(conversations.map(async (conv) => {
      const otherUser = await User.findById(conv.other_user_id);
      if (!otherUser) return null;

      return {
        other_user_id: conv.other_user_id,
        username: otherUser.username,
        profile_picture: otherUser.profilePicture,
        last_message: conv.lastMessage,
        last_message_time: conv.lastMessageTime,
        unread_count: conv.unreadCount
      };
    }));

    res.json({ 
      conversations: populatedConversations.filter(c => c !== null)
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Failed to get conversations', details: error.message });
  }
});

// Get unread count (specific route)
router.get('/unread-count', authenticateToken, async (req, res) => {
  try {
    const conversations = await Message.getConversations(req.user.userId);
    const totalUnread = conversations.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);
    
    res.json({ unreadCount: totalUnread });

  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ error: 'Failed to get unread count', details: error.message });
  }
});

// Get messages with a specific user (parameterized route)
router.get('/conversation/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Verify other user exists
    const otherUser = await User.findById(userId);
    if (!otherUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const messages = await Message.getConversation(req.user.userId, userId);

    // Pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const paginatedMessages = messages.slice(offset, offset + parseInt(limit));

    // Populate sender info
    const populatedMessages = await Promise.all(paginatedMessages.map(async (msg) => {
      const sender = await User.findById(msg.sender);
      return {
        id: msg.id,
        sender_id: msg.sender,
        recipient_id: msg.receiver,
        content: msg.content,
        is_read: msg.isRead,
        created_at: msg.createdAt,
        username: sender?.username || 'Unknown',
        profile_picture: sender?.profilePicture || ''
      };
    }));

    res.json({ messages: populatedMessages });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to get messages', details: error.message });
  }
});

// Send message
router.post('/send', authenticateToken, async (req, res) => {
  try {
    const { recipientId, content } = req.body;

    if (!recipientId || !content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Recipient ID and message content are required' });
    }

    // Verify recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ error: 'Recipient not found' });
    }

    // Don't allow sending messages to yourself
    if (recipientId === req.user.userId) {
      return res.status(400).json({ error: 'Cannot send message to yourself' });
    }

    // Create message
    const newMessage = await Message.create({
      sender: req.user.userId,
      receiver: recipientId,
      content: content.trim()
    });

    // Populate sender info
    const sender = await User.findById(req.user.userId);

    res.status(201).json({
      message: 'Message sent successfully',
      data: {
        id: newMessage.id,
        sender_id: newMessage.sender,
        recipient_id: newMessage.receiver,
        content: newMessage.content,
        is_read: newMessage.isRead,
        created_at: newMessage.createdAt,
        username: sender?.username || 'Unknown',
        profile_picture: sender?.profilePicture || ''
      }
    });

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message', details: error.message });
  }
});

// Mark conversation as read
router.put('/conversation/:userId/read', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    // Verify user exists
    const otherUser = await User.findById(userId);
    if (!otherUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const markedCount = await Message.markAsRead(req.user.userId, userId);

    res.json({ 
      message: 'Messages marked as read',
      markedCount: markedCount
    });

  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ error: 'Failed to mark messages as read', details: error.message });
  }
});

module.exports = router; 