const express = require('express');
const multer = require('multer');
const AWS = require('aws-sdk');
const db = require('../config/database');
const { authenticateToken, requireProducer, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('audio/') || file.mimetype.startsWith('video/') || file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
});

// Upload beat (Producer only)
router.post('/upload', authenticateToken, requireProducer, upload.fields([
  { name: 'preview', maxCount: 1 },
  { name: 'fullBeat', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 }
]), async (req, res) => {
  try {
    const { title, description, genre, bpm, key, price, tags } = req.body;

    if (!title || !price || !req.files.preview) {
      return res.status(400).json({ error: 'Title, price, and preview file are required' });
    }

    const uploadedFiles = {};

    // Upload files to S3
    for (const [fieldName, files] of Object.entries(req.files)) {
      const file = files[0];
      const fileExtension = file.originalname.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`;
      const key = `beats/${req.user.id}/${fileName}`;

      const uploadParams = {
        Bucket: process.env.AWS_S3_BUCKET || 'beatcrest-storage',
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read'
      };

      const result = await s3.upload(uploadParams).promise();
      uploadedFiles[fieldName] = result.Location;
    }

    // Create beat in database
    const result = await db.query(
      `INSERT INTO beats (
        producer_id, title, description, genre, bpm, key, price,
        preview_url, full_beat_url, thumbnail_url, tags
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        req.user.id, title, description, genre, bpm, key, price,
        uploadedFiles.preview, uploadedFiles.fullBeat || null,
        uploadedFiles.thumbnail || null, tags ? tags.split(',') : []
      ]
    );

    res.status(201).json({
      message: 'Beat uploaded successfully',
      beat: result.rows[0]
    });

  } catch (error) {
    console.error('Upload beat error:', error);
    res.status(500).json({ error: 'Failed to upload beat' });
  }
});

// Get all beats (with optional filtering)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      genre, 
      minPrice, 
      maxPrice, 
      bpm, 
      search,
      producer_id 
    } = req.query;

    const offset = (page - 1) * limit;
    let whereConditions = ['b.is_active = TRUE'];
    let params = [];
    let paramCount = 0;

    // Add filters
    if (genre) {
      paramCount++;
      whereConditions.push(`b.genre = $${paramCount}`);
      params.push(genre);
    }

    if (minPrice) {
      paramCount++;
      whereConditions.push(`b.price >= $${paramCount}`);
      params.push(minPrice);
    }

    if (maxPrice) {
      paramCount++;
      whereConditions.push(`b.price <= $${paramCount}`);
      params.push(maxPrice);
    }

    if (bpm) {
      paramCount++;
      whereConditions.push(`b.bpm = $${paramCount}`);
      params.push(bpm);
    }

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

    // Get beats with producer info
    const beatsQuery = `
      SELECT b.*, u.username as producer_name, u.profile_picture as producer_picture
      FROM beats b
      JOIN users u ON b.producer_id = u.id
      ${whereClause}
      ORDER BY b.created_at DESC
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;

    params.push(limit, offset);

    const beatsResult = await db.query(beatsQuery, params);

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM beats b
      JOIN users u ON b.producer_id = u.id
      ${whereClause}
    `;

    const countResult = await db.query(countQuery, params.slice(0, -2));
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
    console.error('Get beats error:', error);
    res.status(500).json({ error: 'Failed to get beats' });
  }
});

// Get single beat by ID
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `SELECT b.*, u.username as producer_name, u.profile_picture as producer_picture
       FROM beats b
       JOIN users u ON b.producer_id = u.id
       WHERE b.id = $1 AND b.is_active = TRUE`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Beat not found' });
    }

    const beat = result.rows[0];

    // Add like status for authenticated users
    if (req.user) {
      const likeResult = await db.query(
        'SELECT id FROM likes WHERE user_id = $1 AND beat_id = $2',
        [req.user.id, beat.id]
      );
      beat.is_liked = likeResult.rows.length > 0;
    }

    // Increment play count
    await db.query(
      'UPDATE beats SET plays_count = plays_count + 1 WHERE id = $1',
      [id]
    );

    res.json({ beat });

  } catch (error) {
    console.error('Get beat error:', error);
    res.status(500).json({ error: 'Failed to get beat' });
  }
});

// Update beat (Producer only)
router.put('/:id', authenticateToken, requireProducer, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, genre, bpm, key, price, tags } = req.body;

    // Check if beat belongs to user
    const beatResult = await db.query(
      'SELECT * FROM beats WHERE id = $1 AND producer_id = $2',
      [id, req.user.id]
    );

    if (beatResult.rows.length === 0) {
      return res.status(404).json({ error: 'Beat not found or access denied' });
    }

    const result = await db.query(
      `UPDATE beats 
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           genre = COALESCE($3, genre),
           bpm = COALESCE($4, bpm),
           key = COALESCE($5, key),
           price = COALESCE($6, price),
           tags = COALESCE($7, tags),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $8 AND producer_id = $9
       RETURNING *`,
      [title, description, genre, bpm, key, price, tags ? tags.split(',') : null, id, req.user.id]
    );

    res.json({
      message: 'Beat updated successfully',
      beat: result.rows[0]
    });

  } catch (error) {
    console.error('Update beat error:', error);
    res.status(500).json({ error: 'Failed to update beat' });
  }
});

// Delete beat (Producer only)
router.delete('/:id', authenticateToken, requireProducer, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if beat belongs to user
    const beatResult = await db.query(
      'SELECT * FROM beats WHERE id = $1 AND producer_id = $2',
      [id, req.user.id]
    );

    if (beatResult.rows.length === 0) {
      return res.status(404).json({ error: 'Beat not found or access denied' });
    }

    // Soft delete by setting is_active to false
    await db.query(
      'UPDATE beats SET is_active = FALSE WHERE id = $1',
      [id]
    );

    res.json({ message: 'Beat deleted successfully' });

  } catch (error) {
    console.error('Delete beat error:', error);
    res.status(500).json({ error: 'Failed to delete beat' });
  }
});

// Like/Unlike beat
router.post('/:id/like', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if beat exists
    const beatResult = await db.query(
      'SELECT id FROM beats WHERE id = $1 AND is_active = TRUE',
      [id]
    );

    if (beatResult.rows.length === 0) {
      return res.status(404).json({ error: 'Beat not found' });
    }

    // Check if already liked
    const existingLike = await db.query(
      'SELECT id FROM likes WHERE user_id = $1 AND beat_id = $2',
      [req.user.id, id]
    );

    if (existingLike.rows.length > 0) {
      // Unlike
      await db.query(
        'DELETE FROM likes WHERE user_id = $1 AND beat_id = $2',
        [req.user.id, id]
      );
      await db.query(
        'UPDATE beats SET likes_count = likes_count - 1 WHERE id = $1',
        [id]
      );
      res.json({ message: 'Beat unliked', liked: false });
    } else {
      // Like
      await db.query(
        'INSERT INTO likes (user_id, beat_id) VALUES ($1, $2)',
        [req.user.id, id]
      );
      await db.query(
        'UPDATE beats SET likes_count = likes_count + 1 WHERE id = $1',
        [id]
      );
      res.json({ message: 'Beat liked', liked: true });
    }

  } catch (error) {
    console.error('Like beat error:', error);
    res.status(500).json({ error: 'Failed to like/unlike beat' });
  }
});

// Get beat comments
router.get('/:id/comments', async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const result = await db.query(
      `SELECT c.*, u.username, u.profile_picture
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.beat_id = $1
       ORDER BY c.created_at DESC
       LIMIT $2 OFFSET $3`,
      [id, limit, offset]
    );

    res.json({ comments: result.rows });

  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ error: 'Failed to get comments' });
  }
});

// Add comment to beat
router.post('/:id/comments', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Comment content is required' });
    }

    const result = await db.query(
      `INSERT INTO comments (user_id, beat_id, content)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [req.user.id, id, content.trim()]
    );

    // Get user info for the comment
    const userResult = await db.query(
      'SELECT username, profile_picture FROM users WHERE id = $1',
      [req.user.id]
    );

    const comment = {
      ...result.rows[0],
      username: userResult.rows[0].username,
      profile_picture: userResult.rows[0].profile_picture
    };

    res.status(201).json({
      message: 'Comment added successfully',
      comment
    });

  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

module.exports = router; 