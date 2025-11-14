const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { Notification } = require('../models');
const { getFirestore, COLLECTIONS } = require('../config/firebase');
const admin = require('firebase-admin');

const router = express.Router();
const db = getFirestore();

// Get all notifications for current user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { unread_only = false, limit = 50 } = req.query;
    
    const notifications = await Notification.findByUser(req.user.userId, unread_only === 'true');
    
    // Limit results
    const limitedNotifications = notifications.slice(0, parseInt(limit));
    
    // Convert to API format
    const formattedNotifications = limitedNotifications.map(notif => ({
      id: notif.id,
      user_id: notif.user,
      type: notif.type,
      title: notif.title,
      message: notif.message,
      related_id: notif.relatedId,
      is_read: notif.isRead,
      created_at: notif.createdAt
    }));
    
    res.json({ notifications: formattedNotifications });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Failed to get notifications', details: error.message });
  }
});

// Get unread notification count
router.get('/unread-count', authenticateToken, async (req, res) => {
  try {
    const notifications = await Notification.findByUser(req.user.userId, true);
    res.json({ unreadCount: notifications.length });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ error: 'Failed to get unread count', details: error.message });
  }
});

// Mark notification as read
router.put('/:id/read', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get notification
    const notificationRef = db.collection(COLLECTIONS.NOTIFICATIONS).doc(id);
    const notificationDoc = await notificationRef.get();
    
    if (!notificationDoc.exists) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    const notification = notificationDoc.data();
    
    // Verify notification belongs to user
    const userId = typeof notification.user === 'string' 
      ? notification.user 
      : notification.user?.id || notification.user?._path?.segments?.slice(-1)[0];
    
    if (userId !== req.user.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    // Update notification
    await notificationRef.update({
      isRead: true
    });
    
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({ error: 'Failed to mark notification as read', details: error.message });
  }
});

// Mark all notifications as read
router.put('/read-all', authenticateToken, async (req, res) => {
  try {
    const notifications = await Notification.findByUser(req.user.userId, true);
    
    if (notifications.length === 0) {
      return res.json({ message: 'No unread notifications', markedCount: 0 });
    }
    
    // Batch update all unread notifications
    const batch = db.batch();
    notifications.forEach(notif => {
      const notificationRef = db.collection(COLLECTIONS.NOTIFICATIONS).doc(notif.id);
      batch.update(notificationRef, { isRead: true });
    });
    
    await batch.commit();
    
    res.json({ 
      message: 'All notifications marked as read',
      markedCount: notifications.length
    });
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({ error: 'Failed to mark all notifications as read', details: error.message });
  }
});

// Delete notification
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get notification
    const notificationRef = db.collection(COLLECTIONS.NOTIFICATIONS).doc(id);
    const notificationDoc = await notificationRef.get();
    
    if (!notificationDoc.exists) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    const notification = notificationDoc.data();
    
    // Verify notification belongs to user
    const userId = typeof notification.user === 'string' 
      ? notification.user 
      : notification.user?.id || notification.user?._path?.segments?.slice(-1)[0];
    
    if (userId !== req.user.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    // Delete notification
    await notificationRef.delete();
    
    res.json({ message: 'Notification deleted' });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ error: 'Failed to delete notification', details: error.message });
  }
});

module.exports = router;

