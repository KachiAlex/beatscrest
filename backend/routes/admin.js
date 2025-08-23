const express = require('express');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Apply admin middleware to all routes
router.use(authenticateToken, requireAdmin);

// Get platform statistics
router.get('/stats', async (req, res) => {
  try {
    // TODO: Implement MongoDB statistics
    // For now, return mock statistics
    const mockStats = {
      userStats: {
        total_users: 1250,
        producers: 450,
        artists: 800,
        new_users_week: 45,
        new_users_month: 180
      },
      beatStats: {
        total_beats: 3200,
        new_beats_week: 120,
        new_beats_month: 480,
        avg_price: 45000,
        total_likes: 15000,
        total_plays: 50000
      },
      salesStats: {
        total_sales: 850,
        sales_week: 35,
        sales_month: 140,
        total_revenue: 38250000,
        total_platform_fees: 1912500,
        avg_sale_amount: 45000
      },
      monthlyRevenue: [
        {
          month: '2024-01-01',
          revenue: 4500000,
          platform_fees: 225000,
          sales_count: 100
        }
      ]
    };

    res.json(mockStats);

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to get statistics' });
  }
});

// Get all users with pagination
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 20, search, account_type } = req.query;

    // TODO: Implement MongoDB users retrieval
    // For now, return mock users data
    const mockUsers = [
      {
        id: 'user1',
        username: 'producer1',
        email: 'producer1@example.com',
        account_type: 'producer',
        is_verified: true,
        followers_count: 150,
        following_count: 75,
        created_at: new Date().toISOString()
      },
      {
        id: 'user2',
        username: 'artist1',
        email: 'artist1@example.com',
        account_type: 'artist',
        is_verified: true,
        followers_count: 200,
        following_count: 100,
        created_at: new Date().toISOString()
      }
    ];

    res.json({
      users: mockUsers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: mockUsers.length,
        pages: 1
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

// Update user status
router.put('/users/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { is_verified, account_type } = req.body;

    // TODO: Implement MongoDB user status update
    // For now, return mock response
    const mockUser = {
      id,
      username: 'updateduser',
      email: 'user@example.com',
      account_type: account_type || 'artist',
      is_verified: is_verified !== undefined ? is_verified : true
    };

    res.json({
      message: 'User status updated successfully',
      user: mockUser
    });

  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ error: 'Failed to update user status' });
  }
});

// Get all beats with pagination
router.get('/beats', async (req, res) => {
  try {
    const { page = 1, limit = 20, search, producer_id } = req.query;

    // TODO: Implement MongoDB beats retrieval
    // For now, return mock beats data
    const mockBeats = [
      {
        id: 'beat1',
        title: 'Amazing Beat',
        description: 'A fire hip hop beat',
        genre: 'Hip Hop',
        price: 45000,
        producer_name: 'producer1',
        created_at: new Date().toISOString()
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
    console.error('Get beats error:', error);
    res.status(500).json({ error: 'Failed to get beats' });
  }
});

// Toggle beat status
router.put('/beats/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    // TODO: Implement MongoDB beat status update
    // For now, return mock response
    const mockBeat = {
      id,
      title: 'Updated Beat',
      is_active: is_active !== undefined ? is_active : true
    };

    res.json({
      message: 'Beat status updated successfully',
      beat: mockBeat
    });

  } catch (error) {
    console.error('Update beat status error:', error);
    res.status(500).json({ error: 'Failed to update beat status' });
  }
});

// Get all purchases
router.get('/purchases', async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;

    // TODO: Implement MongoDB purchases retrieval
    // For now, return mock purchases data
    const mockPurchases = [
      {
        id: 'purchase1',
        beat_title: 'Amazing Beat',
        buyer_name: 'buyer1',
        producer_name: 'producer1',
        amount: 45000,
        payment_status: 'completed',
        created_at: new Date().toISOString()
      }
    ];

    res.json({
      purchases: mockPurchases,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: mockPurchases.length,
        pages: 1
      }
    });

  } catch (error) {
    console.error('Get purchases error:', error);
    res.status(500).json({ error: 'Failed to get purchases' });
  }
});

// Get top producers
router.get('/top-producers', async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    // TODO: Implement MongoDB top producers retrieval
    // For now, return mock producers data
    const mockProducers = [
      {
        id: 'producer1',
        username: 'top_producer',
        profile_picture: 'https://example.com/producer1.jpg',
        beats_count: 25,
        total_likes: 1500,
        total_plays: 5000,
        total_earnings: 2250000,
        sales_count: 50
      }
    ];

    res.json({ producers: mockProducers });

  } catch (error) {
    console.error('Get top producers error:', error);
    res.status(500).json({ error: 'Failed to get top producers' });
  }
});

// Get platform revenue breakdown
router.get('/revenue', async (req, res) => {
  try {
    const { period = '30' } = req.query; // days

    // TODO: Implement MongoDB revenue retrieval
    // For now, return mock revenue data
    const mockRevenue = [
      {
        date: '2024-01-01',
        daily_revenue: 450000,
        daily_fees: 22500,
        daily_sales: 10
      }
    ];

    res.json({ revenue: mockRevenue });

  } catch (error) {
    console.error('Get revenue error:', error);
    res.status(500).json({ error: 'Failed to get revenue data' });
  }
});

module.exports = router; 