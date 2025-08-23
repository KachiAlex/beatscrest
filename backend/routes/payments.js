const express = require('express');
const { authenticateToken } = require('../middleware/auth');

// Initialize Stripe only if API key is provided
let stripe = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
} else {
  console.log('⚠️ Stripe API key not provided - payment features will be disabled');
}

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

const router = express.Router();

// Create payment intent for beat purchase
router.post('/create-payment-intent', authenticateToken, async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({ error: 'Payment service not configured' });
    }

    const { beatId } = req.body;

    if (!beatId) {
      return res.status(400).json({ error: 'Beat ID is required' });
    }

    // For now, return a mock response since we're using MongoDB
    // TODO: Implement MongoDB queries when database is set up
    res.json({
      clientSecret: 'mock_client_secret',
      amount: 45000,
      platformFee: 2250,
      producerAmount: 42750
    });

  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
});

// Confirm payment and deliver beat
router.post('/confirm-payment', authenticateToken, async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({ error: 'Payment service not configured' });
    }

    const { paymentIntentId, beatId } = req.body;

    if (!paymentIntentId || !beatId) {
      return res.status(400).json({ error: 'Payment intent ID and beat ID are required' });
    }

    // For now, return a mock response
    res.json({
      success: true,
      downloadUrl: 'https://example.com/mock-download-url',
      message: 'Payment confirmed and beat delivered'
    });

  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({ error: 'Failed to confirm payment' });
  }
});

// Get user's purchase history
router.get('/purchases', authenticateToken, async (req, res) => {
  try {
    // TODO: Implement MongoDB queries
    res.json({
      purchases: []
    });
  } catch (error) {
    console.error('Get purchases error:', error);
    res.status(500).json({ error: 'Failed to get purchases' });
  }
});

// Get user's sales history
router.get('/sales', authenticateToken, async (req, res) => {
  try {
    // TODO: Implement MongoDB queries
    res.json({
      sales: []
    });
  } catch (error) {
    console.error('Get sales error:', error);
    res.status(500).json({ error: 'Failed to get sales' });
  }
});

// Regenerate download link
router.post('/regenerate-download', authenticateToken, async (req, res) => {
  try {
    const { purchaseId } = req.body;

    if (!purchaseId) {
      return res.status(400).json({ error: 'Purchase ID is required' });
    }

    // TODO: Implement download link regeneration
    res.json({
      downloadUrl: 'https://example.com/regenerated-download-url',
      message: 'Download link regenerated'
    });

  } catch (error) {
    console.error('Regenerate download error:', error);
    res.status(500).json({ error: 'Failed to regenerate download link' });
  }
});

module.exports = router; 