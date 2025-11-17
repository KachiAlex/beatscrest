const express = require('express');
const multer = require('multer');
const admin = require('firebase-admin');
const { authenticateToken, requireProducer, optionalAuth } = require('../middleware/auth');
const { Beat, Comment, User } = require('../models');

const router = express.Router();

// Initialize Firebase Storage (gracefully handle missing bucket in some environments)
let bucket = null;
try {
  bucket = admin.storage().bucket();
} catch (err) {
  console.warn('Firebase Storage bucket not configured; beat uploads will be disabled:', err.message);
}

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

// Get all beats (with optional filtering) - ROOT ROUTE FIRST
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      genre, 
      minPrice, 
      maxPrice, 
      bpm, 
      search 
    } = req.query;

    const filters = {};
    if (genre) filters.genre = genre;
    if (minPrice) filters.minPrice = minPrice;
    if (maxPrice) filters.maxPrice = maxPrice;
    if (bpm) filters.bpm = bpm;
    if (search) filters.search = search;

    const beats = await Beat.findMany(filters, parseInt(page), parseInt(limit));
    
    // Get total count for pagination (simplified - in production you'd want a better count)
    const totalBeats = beats.length; // This is approximate

    res.json({
      beats,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalBeats,
        pages: Math.ceil(totalBeats / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Get beats error:', error);
    res.status(500).json({ error: 'Failed to get beats', details: error.message });
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

    if (!title || !price) {
      return res.status(400).json({ error: 'Title and price are required' });
    }

    let previewUrl = '';
    let fullBeatUrl = '';
    let thumbnailUrl = '';

    // Upload files to Firebase Storage (only if bucket is configured)
    if (req.files && bucket) {
      const uploadPromises = [];

      if (req.files.preview) {
        const previewFile = req.files.preview[0];
        const previewFileName = `beats/${req.user.userId}/${Date.now()}-preview.mp3`;
        const file = bucket.file(previewFileName);
        const stream = file.createWriteStream({
          metadata: {
            contentType: previewFile.mimetype,
          },
        });
        
        uploadPromises.push(
          new Promise((resolve, reject) => {
            stream.on('error', reject);
            stream.on('finish', async () => {
              await file.makePublic();
              previewUrl = `https://storage.googleapis.com/${bucket.name}/${previewFileName}`;
              resolve();
            });
            stream.end(previewFile.buffer);
          })
        );
      }

      if (req.files.fullBeat) {
        const fullBeatFile = req.files.fullBeat[0];
        const fullBeatFileName = `beats/${req.user.userId}/${Date.now()}-full.mp3`;
        const file = bucket.file(fullBeatFileName);
        const stream = file.createWriteStream({
          metadata: {
            contentType: fullBeatFile.mimetype,
          },
        });
        
        uploadPromises.push(
          new Promise((resolve, reject) => {
            stream.on('error', reject);
            stream.on('finish', async () => {
              await file.makePublic();
              fullBeatUrl = `https://storage.googleapis.com/${bucket.name}/${fullBeatFileName}`;
              resolve();
            });
            stream.end(fullBeatFile.buffer);
          })
        );
      }

      if (req.files.thumbnail) {
        const thumbnailFile = req.files.thumbnail[0];
        const thumbnailFileName = `beats/${req.user.userId}/${Date.now()}-thumbnail.jpg`;
        const file = bucket.file(thumbnailFileName);
        const stream = file.createWriteStream({
          metadata: {
            contentType: thumbnailFile.mimetype,
          },
        });
        
        uploadPromises.push(
          new Promise((resolve, reject) => {
            stream.on('error', reject);
            stream.on('finish', async () => {
              await file.makePublic();
              thumbnailUrl = `https://storage.googleapis.com/${bucket.name}/${thumbnailFileName}`;
              resolve();
            });
            stream.end(thumbnailFile.buffer);
          })
        );
      }

      await Promise.all(uploadPromises);
    } else if (!bucket && req.files) {
      return res.status(500).json({ error: 'File uploads are currently disabled (storage bucket not configured)' });
    } else {
      // Use provided URLs if files weren't uploaded
      previewUrl = req.body.previewUrl || '';
      fullBeatUrl = req.body.fullBeatUrl || '';
      thumbnailUrl = req.body.thumbnailUrl || '';
    }

    // Create beat in Firestore
    const newBeat = await Beat.create({
      title,
      description: description || '',
      genre: genre || 'Hip Hop',
      bpm: bpm ? parseInt(bpm) : null,
      key: key || '',
      price: parseFloat(price),
      previewUrl,
      fullBeatUrl: fullBeatUrl || previewUrl, // Fallback to preview if no full beat
      thumbnailUrl,
      producer: req.user.userId,
      tags: tags ? tags.split(',').map(t => t.trim()) : []
    });

    res.status(201).json({
      message: 'Beat uploaded successfully',
      beat: newBeat
    });

  } catch (error) {
    console.error('Upload beat error:', error);
    res.status(500).json({ error: 'Failed to upload beat', details: error.message });
  }
});

// Get single beat (parameterized route)
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const beat = await Beat.findById(id);
    if (!beat || beat.isDeleted) {
      return res.status(404).json({ error: 'Beat not found' });
    }

    // Populate producer info
    if (beat.producer) {
      const producer = await User.findById(beat.producer);
      if (producer) {
        beat.producer = {
          id: producer.id,
          username: producer.username,
          profilePicture: producer.profilePicture
        };
      }
    }

    // Check if user has liked this beat
    if (req.user && beat.likes) {
      beat.isLiked = beat.likes.includes(req.user.userId);
    }
    beat.likesCount = beat.likes?.length || 0;

    res.json({ beat });

  } catch (error) {
    console.error('Get beat error:', error);
    res.status(500).json({ error: 'Failed to get beat', details: error.message });
  }
});

// Update beat
router.put('/:id', authenticateToken, requireProducer, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, genre, bpm, key, price } = req.body;

    // Verify beat belongs to user
    const beat = await Beat.findById(id);
    if (!beat || beat.isDeleted) {
      return res.status(404).json({ error: 'Beat not found' });
    }
    if (beat.producer !== req.user.userId) {
      return res.status(403).json({ error: 'You can only update your own beats' });
    }

    const updates = {};
    if (title) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (genre) updates.genre = genre;
    if (bpm) updates.bpm = parseInt(bpm);
    if (key) updates.key = key;
    if (price) updates.price = parseFloat(price);

    const updatedBeat = await Beat.update(id, updates);

    res.json({
      message: 'Beat updated successfully',
      beat: updatedBeat
    });

  } catch (error) {
    console.error('Update beat error:', error);
    res.status(500).json({ error: 'Failed to update beat', details: error.message });
  }
});

// Delete beat
router.delete('/:id', authenticateToken, requireProducer, async (req, res) => {
  try {
    const { id } = req.params;

    // Verify beat belongs to user
    const beat = await Beat.findById(id);
    if (!beat || beat.isDeleted) {
      return res.status(404).json({ error: 'Beat not found' });
    }
    if (beat.producer !== req.user.userId) {
      return res.status(403).json({ error: 'You can only delete your own beats' });
    }

    await Beat.delete(id);

    res.json({ message: 'Beat deleted successfully' });

  } catch (error) {
    console.error('Delete beat error:', error);
    res.status(500).json({ error: 'Failed to delete beat', details: error.message });
  }
});

// Like/unlike beat
router.post('/:id/like', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await Beat.like(id, req.user.userId);
    
    res.json({ 
      message: result.liked ? 'Beat liked successfully' : 'Beat unliked successfully',
      liked: result.liked
    });

  } catch (error) {
    console.error('Like beat error:', error);
    res.status(500).json({ error: 'Failed to like beat', details: error.message });
  }
});

// Add comment to beat
router.post('/:id/comments', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Comment content is required' });
    }

    // Verify beat exists
    const beat = await Beat.findById(id);
    if (!beat || beat.isDeleted) {
      return res.status(404).json({ error: 'Beat not found' });
    }

    const newComment = await Comment.create({
      beat: id,
      user: req.user.userId,
      content
    });

    // Populate user info
    const user = await User.findById(req.user.userId);
    if (user) {
      newComment.user = {
        id: user.id,
        username: user.username,
        profilePicture: user.profilePicture
      };
    }

    res.status(201).json({
      message: 'Comment added successfully',
      comment: newComment
    });

  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ error: 'Failed to add comment', details: error.message });
  }
});

// Get beat comments
router.get('/:id/comments', async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const comments = await Comment.findByBeat(id);
    
    // Populate user info for each comment
    const populatedComments = await Promise.all(comments.map(async (comment) => {
      if (comment.user) {
        const user = await User.findById(comment.user);
        if (user) {
          comment.user = {
            id: user.id,
            username: user.username,
            profilePicture: user.profilePicture
          };
        }
      }
      return comment;
    }));

    // Pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const paginatedComments = populatedComments.slice(offset, offset + parseInt(limit));

    res.json({
      comments: paginatedComments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: populatedComments.length,
        pages: Math.ceil(populatedComments.length / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ error: 'Failed to get comments', details: error.message });
  }
});

module.exports = router; 