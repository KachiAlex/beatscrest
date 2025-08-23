const express = require('express');
const db = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Apply admin middleware to all routes
router.use(authenticateToken, requireAdmin);

// Get platform statistics
router.get('/stats', async (req, res) => {
  try {
    // User statistics
    const userStats = await db.query(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN account_type = 'producer' THEN 1 END) as producers,
        COUNT(CASE WHEN account_type = 'artist' THEN 1 END) as artists,
        COUNT(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as new_users_week,
        COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as new_users_month
      FROM users
    `);

    // Beat statistics
    const beatStats = await db.query(`
      SELECT 
        COUNT(*) as total_beats,
        COUNT(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as new_beats_week,
        COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as new_beats_month,
        AVG(price) as avg_price,
        SUM(likes_count) as total_likes,
        SUM(plays_count) as total_plays
      FROM beats WHERE is_active = TRUE
    `);

    // Sales statistics
    const salesStats = await db.query(`
      SELECT 
        COUNT(*) as total_sales,
        COUNT(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as sales_week,
        COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as sales_month,
        SUM(amount) as total_revenue,
        SUM(platform_fee) as total_platform_fees,
        AVG(amount) as avg_sale_amount
      FROM purchases WHERE payment_status = 'completed'
    `);

    // Revenue by month (last 12 months)
    const monthlyRevenue = await db.query(`
      SELECT 
        DATE_TRUNC('month', created_at) as month,
        SUM(amount) as revenue,
        SUM(platform_fee) as platform_fees,
        COUNT(*) as sales_count
      FROM purchases 
      WHERE payment_status = 'completed' 
        AND created_at >= NOW() - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month DESC
    `);

    res.json({
      userStats: userStats.rows[0],
      beatStats: beatStats.rows[0],
      salesStats: salesStats.rows[0],
      monthlyRevenue: monthlyRevenue.rows
    });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to get statistics' });
  }
});

// Get all users with pagination
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 20, search, account_type } = req.query;
    const offset = (page - 1) * limit;

    let whereConditions = [];
    let params = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      whereConditions.push(`(username ILIKE $${paramCount} OR email ILIKE $${paramCount})`);
      params.push(`%${search}%`);
    }

    if (account_type) {
      paramCount++;
      whereConditions.push(`account_type = $${paramCount}`);
      params.push(account_type);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const result = await db.query(
      `SELECT id, username, email, account_type, is_verified, 
              followers_count, following_count, created_at
       FROM users 
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`,
      [...params, limit, offset]
    );

    // Get total count
    const countResult = await db.query(
      `SELECT COUNT(*) as total FROM users ${whereClause}`,
      params
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
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

// Update user status
router.put('/users/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { is_verified, account_type } = req.body;

    const result = await db.query(
      `UPDATE users 
       SET is_verified = COALESCE($1, is_verified),
           account_type = COALESCE($2, account_type)
       WHERE id = $3
       RETURNING id, username, email, account_type, is_verified`,
      [is_verified, account_type, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'User status updated successfully',
      user: result.rows[0]
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
    const offset = (page - 1) * limit;

    let whereConditions = [];
    let params = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      whereConditions.push(`(b.title ILIKE $${paramCount} OR b.description ILIKE $${paramCount})`);
      params.push(`%${search}%`);
    }

    if (producer_id) {
      paramCount++;
      whereConditions.push(`b.producer_id = $${paramCount}`);
      params.push(producer_id);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const result = await db.query(
      `SELECT b.*, u.username as producer_name
       FROM beats b
       JOIN users u ON b.producer_id = u.id
       ${whereClause}
       ORDER BY b.created_at DESC
       LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`,
      [...params, limit, offset]
    );

    // Get total count
    const countResult = await db.query(
      `SELECT COUNT(*) as total FROM beats b ${whereClause}`,
      params
    );

    const total = parseInt(countResult.rows[0].total);

    res.json({
      beats: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
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

    const result = await db.query(
      `UPDATE beats 
       SET is_active = $1
       WHERE id = $2
       RETURNING id, title, is_active`,
      [is_active, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Beat not found' });
    }

    res.json({
      message: 'Beat status updated successfully',
      beat: result.rows[0]
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
    const offset = (page - 1) * limit;

    let whereConditions = [];
    let params = [];
    let paramCount = 0;

    if (status) {
      paramCount++;
      whereConditions.push(`p.payment_status = $${paramCount}`);
      params.push(status);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const result = await db.query(
      `SELECT p.*, b.title as beat_title, 
              buyer.username as buyer_name, 
              producer.username as producer_name
       FROM purchases p
       JOIN beats b ON p.beat_id = b.id
       JOIN users buyer ON p.buyer_id = buyer.id
       JOIN users producer ON p.producer_id = producer.id
       ${whereClause}
       ORDER BY p.created_at DESC
       LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`,
      [...params, limit, offset]
    );

    // Get total count
    const countResult = await db.query(
      `SELECT COUNT(*) as total FROM purchases p ${whereClause}`,
      params
    );

    const total = parseInt(countResult.rows[0].total);

    res.json({
      purchases: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
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

    const result = await db.query(
      `SELECT u.id, u.username, u.profile_picture,
              COUNT(b.id) as beats_count,
              SUM(b.likes_count) as total_likes,
              SUM(b.plays_count) as total_plays,
              SUM(p.producer_amount) as total_earnings,
              COUNT(p.id) as sales_count
       FROM users u
       LEFT JOIN beats b ON u.id = b.producer_id AND b.is_active = TRUE
       LEFT JOIN purchases p ON u.id = p.producer_id AND p.payment_status = 'completed'
       WHERE u.account_type = 'producer'
       GROUP BY u.id, u.username, u.profile_picture
       ORDER BY total_earnings DESC, sales_count DESC
       LIMIT $1`,
      [limit]
    );

    res.json({ producers: result.rows });

  } catch (error) {
    console.error('Get top producers error:', error);
    res.status(500).json({ error: 'Failed to get top producers' });
  }
});

// Get platform revenue breakdown
router.get('/revenue', async (req, res) => {
  try {
    const { period = '30' } = req.query; // days

    const result = await db.query(
      `SELECT 
        DATE_TRUNC('day', created_at) as date,
        SUM(amount) as daily_revenue,
        SUM(platform_fee) as daily_fees,
        COUNT(*) as daily_sales
       FROM purchases 
       WHERE payment_status = 'completed' 
         AND created_at >= NOW() - INTERVAL '${period} days'
       GROUP BY DATE_TRUNC('day', created_at)
       ORDER BY date DESC`
    );

    res.json({ revenue: result.rows });

  } catch (error) {
    console.error('Get revenue error:', error);
    res.status(500).json({ error: 'Failed to get revenue data' });
  }
});

module.exports = router; 