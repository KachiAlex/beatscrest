const express = require('express');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { User, Beat, Purchase } = require('../models');
const { getFirestore, COLLECTIONS } = require('../config/firebase');

const router = express.Router();
const db = getFirestore();

// Apply admin middleware to all routes
router.use(authenticateToken, requireAdmin);

// Get platform statistics
router.get('/stats', async (req, res) => {
  try {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get all users
    const usersSnapshot = await db.collection(COLLECTIONS.USERS).get();
    const allUsers = usersSnapshot.docs.map(doc => doc.data());
    
    const totalUsers = allUsers.length;
    const producers = allUsers.filter(u => u.accountType === 'Producer').length;
    const artists = allUsers.filter(u => u.accountType === 'Artist').length;
    
    // New users (simplified - would need timestamp comparison)
    const newUsersWeek = 0; // Placeholder - would need to compare createdAt
    const newUsersMonth = 0; // Placeholder

    // Get all beats
    const beatsSnapshot = await db.collection(COLLECTIONS.BEATS)
      .where('isDeleted', '==', false)
      .get();
    const allBeats = beatsSnapshot.docs.map(doc => doc.data());
    
    const totalBeats = allBeats.length;
    const totalLikes = allBeats.reduce((sum, beat) => sum + (beat.likes?.length || 0), 0);
    const totalPlays = allBeats.reduce((sum, beat) => sum + (beat.playCount || 0), 0);
    const avgPrice = allBeats.length > 0
      ? allBeats.reduce((sum, beat) => sum + (beat.price || 0), 0) / allBeats.length
      : 0;
    
    const newBeatsWeek = 0; // Placeholder
    const newBeatsMonth = 0; // Placeholder

    // Get all purchases
    const purchasesSnapshot = await db.collection(COLLECTIONS.PURCHASES)
      .where('status', '==', 'completed')
      .get();
    const allPurchases = purchasesSnapshot.docs.map(doc => doc.data());
    
    const totalSales = allPurchases.length;
    const totalRevenue = allPurchases.reduce((sum, p) => sum + (p.amount || 0), 0);
    const totalPlatformFees = allPurchases.reduce((sum, p) => sum + (p.platformFee || 0), 0);
    const avgSaleAmount = allPurchases.length > 0
      ? totalRevenue / allPurchases.length
      : 0;
    
    const salesWeek = 0; // Placeholder
    const salesMonth = 0; // Placeholder

    res.json({
      userStats: {
        total_users: totalUsers,
        producers: producers,
        artists: artists,
        new_users_week: newUsersWeek,
        new_users_month: newUsersMonth
      },
      beatStats: {
        total_beats: totalBeats,
        new_beats_week: newBeatsWeek,
        new_beats_month: newBeatsMonth,
        avg_price: Math.round(avgPrice),
        total_likes: totalLikes,
        total_plays: totalPlays
      },
      salesStats: {
        total_sales: totalSales,
        sales_week: salesWeek,
        sales_month: salesMonth,
        total_revenue: totalRevenue,
        total_platform_fees: totalPlatformFees,
        avg_sale_amount: Math.round(avgSaleAmount)
      },
      monthlyRevenue: [] // Placeholder - would need date-based aggregation
    });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to get statistics', details: error.message });
  }
});

// Get all users with pagination
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 20, search, account_type } = req.query;

    let query = db.collection(COLLECTIONS.USERS);

    // Apply filters
    if (account_type) {
      const accountType = account_type.charAt(0).toUpperCase() + account_type.slice(1);
      query = query.where('accountType', '==', accountType);
    }

    if (search) {
      query = query.where('username', '>=', search)
                   .where('username', '<=', search + '\uf8ff');
    }

    const snapshot = await query.get();
    let users = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        account_type: data.accountType?.toLowerCase(),
        followers_count: data.followers?.length || 0,
        following_count: data.following?.length || 0,
        created_at: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
      };
    });

    // Pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const paginatedUsers = users.slice(offset, offset + parseInt(limit));

    res.json({
      users: paginatedUsers.map(u => ({
        id: u.id,
        username: u.username,
        email: u.email,
        account_type: u.account_type,
        is_verified: true, // Placeholder
        followers_count: u.followers_count,
        following_count: u.following_count,
        created_at: u.created_at
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: users.length,
        pages: Math.ceil(users.length / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to get users', details: error.message });
  }
});

// Update user status
router.put('/users/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { is_verified, account_type } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updates = {};
    if (account_type) {
      const accountType = account_type.charAt(0).toUpperCase() + account_type.slice(1);
      updates.accountType = accountType;
    }

    // Note: is_verified field would need to be added to User model
    const updatedUser = await User.update(id, updates);

    res.json({
      message: 'User status updated successfully',
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        account_type: updatedUser.accountType?.toLowerCase(),
        is_verified: is_verified !== undefined ? is_verified : true
      }
    });

  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ error: 'Failed to update user status', details: error.message });
  }
});

// Get all beats with pagination
router.get('/beats', async (req, res) => {
  try {
    const { page = 1, limit = 20, search, producer_id } = req.query;

    const filters = {};
    if (producer_id) filters.producerId = producer_id;

    const beats = await Beat.findMany(filters, parseInt(page), parseInt(limit));

    // Populate producer names
    const beatsWithProducers = await Promise.all(beats.map(async (beat) => {
      const producer = beat.producer ? await User.findById(beat.producer) : null;
      return {
        id: beat.id,
        title: beat.title,
        description: beat.description,
        genre: beat.genre,
        price: beat.price,
        producer_name: producer?.username || 'Unknown',
        created_at: beat.createdAt
      };
    }));

    res.json({
      beats: beatsWithProducers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: beats.length,
        pages: Math.ceil(beats.length / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Get beats error:', error);
    res.status(500).json({ error: 'Failed to get beats', details: error.message });
  }
});

// Toggle beat status
router.put('/beats/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    const beat = await Beat.findById(id);
    if (!beat) {
      return res.status(404).json({ error: 'Beat not found' });
    }

    // Update beat - soft delete if is_active is false
    if (is_active === false) {
      await Beat.delete(id);
    } else if (is_active === true && beat.isDeleted) {
      await Beat.update(id, { isDeleted: false });
    }

    const updatedBeat = await Beat.findById(id);

    res.json({
      message: 'Beat status updated successfully',
      beat: {
        id: updatedBeat.id,
        title: updatedBeat.title,
        is_active: !updatedBeat.isDeleted
      }
    });

  } catch (error) {
    console.error('Update beat status error:', error);
    res.status(500).json({ error: 'Failed to update beat status', details: error.message });
  }
});

// Get all purchases
router.get('/purchases', async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;

    let query = db.collection(COLLECTIONS.PURCHASES);
    if (status) {
      query = query.where('status', '==', status);
    }

    const snapshot = await query.orderBy('createdAt', 'desc').get();
    let purchases = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        created_at: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
      };
    });

    // Pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const paginatedPurchases = purchases.slice(offset, offset + parseInt(limit));

    // Populate beat, buyer, and seller info
    const populatedPurchases = await Promise.all(paginatedPurchases.map(async (purchase) => {
      const beat = purchase.beat ? await Beat.findById(purchase.beat) : null;
      const buyer = purchase.buyer ? await User.findById(purchase.buyer) : null;
      const seller = purchase.seller ? await User.findById(purchase.seller) : null;

      return {
        id: purchase.id,
        beat_title: beat?.title || 'Unknown',
        buyer_name: buyer?.username || 'Unknown',
        producer_name: seller?.username || 'Unknown',
        amount: purchase.amount,
        payment_status: purchase.status,
        created_at: purchase.created_at
      };
    }));

    res.json({
      purchases: populatedPurchases,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: purchases.length,
        pages: Math.ceil(purchases.length / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Get purchases error:', error);
    res.status(500).json({ error: 'Failed to get purchases', details: error.message });
  }
});

// Get top producers
router.get('/top-producers', async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    // Get all producers
    const producersSnapshot = await db.collection(COLLECTIONS.USERS)
      .where('accountType', '==', 'Producer')
      .get();
    
    const producers = producersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Get sales for each producer
    const producersWithStats = await Promise.all(producers.map(async (producer) => {
      const sales = await Purchase.findBySeller(producer.id, 'completed');
      const beats = await Beat.findMany({ producerId: producer.id }, 1, 1000);

      const totalEarnings = sales.reduce((sum, s) => sum + (s.sellerAmount || 0), 0);
      const totalLikes = beats.reduce((sum, b) => sum + (b.likes?.length || 0), 0);
      const totalPlays = beats.reduce((sum, b) => sum + (b.playCount || 0), 0);

      return {
        id: producer.id,
        username: producer.username,
        profile_picture: producer.profilePicture || '',
        beats_count: beats.length,
        total_likes: totalLikes,
        total_plays: totalPlays,
        total_earnings: totalEarnings,
        sales_count: sales.length
      };
    }));

    // Sort by total earnings and limit
    const topProducers = producersWithStats
      .sort((a, b) => b.total_earnings - a.total_earnings)
      .slice(0, parseInt(limit));

    res.json({ producers: topProducers });

  } catch (error) {
    console.error('Get top producers error:', error);
    res.status(500).json({ error: 'Failed to get top producers', details: error.message });
  }
});

// Get platform revenue breakdown
router.get('/revenue', async (req, res) => {
  try {
    const { period = '30' } = req.query; // days

    const purchasesSnapshot = await db.collection(COLLECTIONS.PURCHASES)
      .where('status', '==', 'completed')
      .get();

    const purchases = purchasesSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        createdAt: data.createdAt?.toDate?.() || new Date()
      };
    });

    // Group by date (simplified - would need proper date grouping)
    const revenueMap = new Map();
    purchases.forEach(purchase => {
      const date = purchase.createdAt.toISOString().split('T')[0];
      if (!revenueMap.has(date)) {
        revenueMap.set(date, {
          date: date,
          daily_revenue: 0,
          daily_fees: 0,
          daily_sales: 0
        });
      }
      const dayData = revenueMap.get(date);
      dayData.daily_revenue += purchase.amount || 0;
      dayData.daily_fees += purchase.platformFee || 0;
      dayData.daily_sales += 1;
    });

    const revenue = Array.from(revenueMap.values())
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json({ revenue: revenue });

  } catch (error) {
    console.error('Get revenue error:', error);
    res.status(500).json({ error: 'Failed to get revenue data', details: error.message });
  }
});

module.exports = router; 