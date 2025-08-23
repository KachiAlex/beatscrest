const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const AWS = require('aws-sdk');

const router = express.Router();

// Configure AWS S3 for generating download links
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

// Create payment intent for beat purchase
router.post('/create-payment-intent', authenticateToken, async (req, res) => {
  try {
    const { beatId } = req.body;

    if (!beatId) {
      return res.status(400).json({ error: 'Beat ID is required' });
    }

    // Get beat details
    const beatResult = await db.query(
      `SELECT b.*, u.username as producer_name 
       FROM beats b 
       JOIN users u ON b.producer_id = u.id 
       WHERE b.id = $1 AND b.is_active = TRUE`,
      [beatId]
    );

    if (beatResult.rows.length === 0) {
      return res.status(404).json({ error: 'Beat not found' });
    }

    const beat = beatResult.rows[0];

    // Check if user is trying to buy their own beat
    if (beat.producer_id === req.user.id) {
      return res.status(400).json({ error: 'Cannot purchase your own beat' });
    }

    // Check if already purchased
    const existingPurchase = await db.query(
      'SELECT id FROM purchases WHERE buyer_id = $1 AND beat_id = $2 AND payment_status = $3',
      [req.user.id, beatId, 'completed']
    );

    if (existingPurchase.rows.length > 0) {
      return res.status(400).json({ error: 'Beat already purchased' });
    }

    const amount = parseFloat(beat.price);
    const platformFee = amount * 0.05; // 5% platform fee
    const producerAmount = amount - platformFee;

    // Create payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'ngn', // Nigerian Naira
      metadata: {
        beatId: beatId.toString(),
        buyerId: req.user.id.toString(),
        producerId: beat.producer_id.toString(),
        platformFee: platformFee.toString(),
        producerAmount: producerAmount.toString()
      }
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      amount: amount,
      platformFee: platformFee,
      producerAmount: producerAmount
    });

  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
});

// Confirm payment and deliver beat
router.post('/confirm-payment', authenticateToken, async (req, res) => {
  try {
    const { paymentIntentId, beatId } = req.body;

    if (!paymentIntentId || !beatId) {
      return res.status(400).json({ error: 'Payment intent ID and beat ID are required' });
    }

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ error: 'Payment not completed' });
    }

    // Get beat details
    const beatResult = await db.query(
      'SELECT * FROM beats WHERE id = $1 AND is_active = TRUE',
      [beatId]
    );

    if (beatResult.rows.length === 0) {
      return res.status(404).json({ error: 'Beat not found' });
    }

    const beat = beatResult.rows[0];
    const amount = parseFloat(beat.price);
    const platformFee = amount * 0.05;
    const producerAmount = amount - platformFee;

    // Check if purchase already exists
    const existingPurchase = await db.query(
      'SELECT id FROM purchases WHERE buyer_id = $1 AND beat_id = $2',
      [req.user.id, beatId]
    );

    if (existingPurchase.rows.length > 0) {
      return res.status(400).json({ error: 'Purchase already exists' });
    }

    // Generate download link for full beat
    let downloadLink = null;
    if (beat.full_beat_url) {
      try {
        const signedUrl = await s3.getSignedUrlPromise('getObject', {
          Bucket: process.env.AWS_S3_BUCKET || 'beatcrest-storage',
          Key: beat.full_beat_url.split('/').slice(-2).join('/'), // Extract key from URL
          Expires: 604800 // 7 days
        });
        downloadLink = signedUrl;
      } catch (error) {
        console.error('Error generating download link:', error);
        downloadLink = beat.full_beat_url; // Fallback to direct URL
      }
    }

    // Create purchase record
    const purchaseResult = await db.query(
      `INSERT INTO purchases (
        buyer_id, beat_id, producer_id, amount, platform_fee, 
        producer_amount, payment_status, payment_method, 
        transaction_id, download_link, is_delivered
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        req.user.id, beatId, beat.producer_id, amount, platformFee,
        producerAmount, 'completed', 'stripe', paymentIntentId,
        downloadLink, true
      ]
    );

    const purchase = purchaseResult.rows[0];

    // Send notification to producer
    await db.query(
      `INSERT INTO notifications (user_id, type, title, message, related_id)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        beat.producer_id,
        'purchase',
        'Beat Sold!',
        `Your beat "${beat.title}" was purchased for ₦${amount.toLocaleString()}`,
        purchase.id
      ]
    );

    // Send notification to buyer
    await db.query(
      `INSERT INTO notifications (user_id, type, title, message, related_id)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        req.user.id,
        'purchase',
        'Purchase Complete!',
        `You successfully purchased "${beat.title}"`,
        purchase.id
      ]
    );

    res.json({
      message: 'Payment confirmed and beat delivered',
      purchase: {
        id: purchase.id,
        amount: purchase.amount,
        downloadLink: purchase.download_link,
        purchasedAt: purchase.created_at
      }
    });

  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({ error: 'Failed to confirm payment' });
  }
});

// Get user's purchase history
router.get('/purchases', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const result = await db.query(
      `SELECT p.*, b.title as beat_title, b.thumbnail_url, u.username as producer_name
       FROM purchases p
       JOIN beats b ON p.beat_id = b.id
       JOIN users u ON p.producer_id = u.id
       WHERE p.buyer_id = $1
       ORDER BY p.created_at DESC
       LIMIT $2 OFFSET $3`,
      [req.user.id, limit, offset]
    );

    // Get total count
    const countResult = await db.query(
      'SELECT COUNT(*) as total FROM purchases WHERE buyer_id = $1',
      [req.user.id]
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

// Get producer's sales history
router.get('/sales', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const result = await db.query(
      `SELECT p.*, b.title as beat_title, u.username as buyer_name
       FROM purchases p
       JOIN beats b ON p.beat_id = b.id
       JOIN users u ON p.buyer_id = u.id
       WHERE p.producer_id = $1
       ORDER BY p.created_at DESC
       LIMIT $2 OFFSET $3`,
      [req.user.id, limit, offset]
    );

    // Get total count
    const countResult = await db.query(
      'SELECT COUNT(*) as total FROM purchases WHERE producer_id = $1',
      [req.user.id]
    );

    const total = parseInt(countResult.rows[0].total);

    // Calculate total earnings
    const earningsResult = await db.query(
      'SELECT SUM(producer_amount) as total_earnings FROM purchases WHERE producer_id = $1 AND payment_status = $2',
      [req.user.id, 'completed']
    );

    const totalEarnings = parseFloat(earningsResult.rows[0].total_earnings || 0);

    res.json({
      sales: result.rows,
      totalEarnings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get sales error:', error);
    res.status(500).json({ error: 'Failed to get sales' });
  }
});

// Get purchase details
router.get('/purchases/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `SELECT p.*, b.title as beat_title, b.description, b.genre, b.bpm,
              u.username as producer_name, u.profile_picture as producer_picture
       FROM purchases p
       JOIN beats b ON p.beat_id = b.id
       JOIN users u ON p.producer_id = u.id
       WHERE p.id = $1 AND p.buyer_id = $2`,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Purchase not found' });
    }

    res.json({ purchase: result.rows[0] });

  } catch (error) {
    console.error('Get purchase details error:', error);
    res.status(500).json({ error: 'Failed to get purchase details' });
  }
});

// Regenerate download link
router.post('/purchases/:id/regenerate-link', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Get purchase details
    const purchaseResult = await db.query(
      `SELECT p.*, b.full_beat_url
       FROM purchases p
       JOIN beats b ON p.beat_id = b.id
       WHERE p.id = $1 AND p.buyer_id = $2 AND p.payment_status = $3`,
      [id, req.user.id, 'completed']
    );

    if (purchaseResult.rows.length === 0) {
      return res.status(404).json({ error: 'Purchase not found or not completed' });
    }

    const purchase = purchaseResult.rows[0];

    if (!purchase.full_beat_url) {
      return res.status(400).json({ error: 'No full beat file available' });
    }

    // Generate new download link
    let downloadLink = null;
    try {
      const signedUrl = await s3.getSignedUrlPromise('getObject', {
        Bucket: process.env.AWS_S3_BUCKET || 'beatcrest-storage',
        Key: purchase.full_beat_url.split('/').slice(-2).join('/'),
        Expires: 604800 // 7 days
      });
      downloadLink = signedUrl;
    } catch (error) {
      console.error('Error generating download link:', error);
      downloadLink = purchase.full_beat_url; // Fallback
    }

    // Update purchase with new download link
    await db.query(
      'UPDATE purchases SET download_link = $1 WHERE id = $2',
      [downloadLink, id]
    );

    res.json({
      message: 'Download link regenerated',
      downloadLink
    });

  } catch (error) {
    console.error('Regenerate link error:', error);
    res.status(500).json({ error: 'Failed to regenerate download link' });
  }
});

// Webhook for Stripe events (for production)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      // Payment was successful - handle in confirm-payment endpoint
      break;
    case 'payment_intent.payment_failed':
      // Payment failed
      console.log('Payment failed:', event.data.object);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

module.exports = router; 