const express = require('express');
const multer = require('multer');
const { authenticateToken, requireProducer, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Initialize AWS S3 only if credentials are provided
let s3 = null;
if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
  const AWS = require('aws-sdk');
  s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'us-east-1'
  });
} else {
  console.log('⚠️ AWS credentials not provided - file upload features will be disabled');
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

// Upload beat (Producer only)
router.post('/upload', authenticateToken, requireProducer, upload.fields([
  { name: 'preview', maxCount: 1 },
  { name: 'fullBeat', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 }
]), async (req, res) => {
  try {
    if (!s3) {
      return res.status(503).json({ error: 'File upload service not configured' });
    }

    const { title, description, genre, bpm, key, price, tags } = req.body;

    if (!title || !price || !req.files.preview) {
      return res.status(400).json({ error: 'Title, price, and preview file are required' });
    }

    // For now, return a mock response since we're using MongoDB
    // TODO: Implement MongoDB queries when database is set up
    res.status(201).json({
      message: 'Beat uploaded successfully',
      beat: {
        id: 'mock-beat-id',
        title,
        description,
        genre,
        bpm,
        key,
        price: parseFloat(price),
        previewUrl: 'https://example.com/mock-preview.mp3',
        fullBeatUrl: req.files.fullBeat ? 'https://example.com/mock-full-beat.mp3' : null,
        thumbnailUrl: req.files.thumbnail ? 'https://example.com/mock-thumbnail.jpg' : null,
        producer: req.user.id
      }
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
      search 
    } = req.query;

    // TODO: Implement MongoDB queries
    // For now, return mock data
    const mockBeats = [
      {
        id: '1',
        title: 'Amazing Hip Hop Beat',
        description: 'A fire hip hop beat with heavy bass',
        genre: 'Hip Hop',
        bpm: 140,
        key: 'C',
        price: 45000,
        previewUrl: 'https://example.com/preview1.mp3',
        thumbnailUrl: 'https://example.com/thumbnail1.jpg',
        playCount: 150,
        likes: [],
        producer: {
          id: 'producer1',
          username: 'ProducerOne',
          profilePicture: 'https://example.com/producer1.jpg'
        },
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        title: 'R&B Vibes',
        description: 'Smooth R&B beat perfect for vocals',
        genre: 'R&B',
        bpm: 120,
        key: 'F',
        price: 35000,
        previewUrl: 'https://example.com/preview2.mp3',
        thumbnailUrl: 'https://example.com/thumbnail2.jpg',
        playCount: 89,
        likes: [],
        producer: {
          id: 'producer2',
          username: 'ProducerTwo',
          profilePicture: 'https://example.com/producer2.jpg'
        },
        createdAt: new Date().toISOString()
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

// Get single beat
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;

    // TODO: Implement MongoDB query
    // For now, return mock data
    const mockBeat = {
      id,
      title: 'Amazing Hip Hop Beat',
      description: 'A fire hip hop beat with heavy bass',
      genre: 'Hip Hop',
      bpm: 140,
      key: 'C',
      price: 45000,
      previewUrl: 'https://example.com/preview1.mp3',
      fullBeatUrl: 'https://example.com/full-beat1.mp3',
      thumbnailUrl: 'https://example.com/thumbnail1.jpg',
      playCount: 150,
      likes: [],
      producer: {
        id: 'producer1',
        username: 'ProducerOne',
        profilePicture: 'https://example.com/producer1.jpg'
      },
      createdAt: new Date().toISOString()
    };

    res.json({ beat: mockBeat });

  } catch (error) {
    console.error('Get beat error:', error);
    res.status(500).json({ error: 'Failed to get beat' });
  }
});

// Update beat
router.put('/:id', authenticateToken, requireProducer, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, genre, bpm, key, price, tags } = req.body;

    // TODO: Implement MongoDB update
    res.json({
      message: 'Beat updated successfully',
      beat: { id, title, description, genre, bpm, key, price }
    });

  } catch (error) {
    console.error('Update beat error:', error);
    res.status(500).json({ error: 'Failed to update beat' });
  }
});

// Delete beat
router.delete('/:id', authenticateToken, requireProducer, async (req, res) => {
  try {
    const { id } = req.params;

    // TODO: Implement MongoDB soft delete
    res.json({ message: 'Beat deleted successfully' });

  } catch (error) {
    console.error('Delete beat error:', error);
    res.status(500).json({ error: 'Failed to delete beat' });
  }
});

// Like/unlike beat
router.post('/:id/like', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // TODO: Implement MongoDB like/unlike
    res.json({ message: 'Beat liked successfully' });

  } catch (error) {
    console.error('Like beat error:', error);
    res.status(500).json({ error: 'Failed to like beat' });
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

    // TODO: Implement MongoDB comment creation
    res.status(201).json({
      message: 'Comment added successfully',
      comment: {
        id: 'comment1',
        content,
        user: req.user,
        createdAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

// Get beat comments
router.get('/:id/comments', async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;

    // TODO: Implement MongoDB comments query
    const mockComments = [
      {
        id: 'comment1',
        content: 'This beat is fire! 🔥',
        user: {
          id: 'user1',
          username: 'ArtistOne',
          profilePicture: 'https://example.com/user1.jpg'
        },
        createdAt: new Date().toISOString()
      }
    ];

    res.json({
      comments: mockComments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: mockComments.length,
        pages: 1
      }
    });

  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ error: 'Failed to get comments' });
  }
});

module.exports = router; 