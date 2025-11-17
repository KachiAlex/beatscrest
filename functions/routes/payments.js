const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { Purchase, Beat, User } = require('../models');

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

    // Get beat details
    const beat = await Beat.findById(beatId);
    if (!beat || beat.isDeleted) {
      return res.status(404).json({ error: 'Beat not found' });
    }

    // Check if user already purchased this beat
    const existingPurchase = await Purchase.findByBuyer(req.user.userId);
    const hasPurchased = existingPurchase.some(p => p.beat === beatId && p.status === 'completed');
    if (hasPurchased) {
      return res.status(400).json({ error: 'You have already purchased this beat' });
    }

    // Get producer info
    const producer = await User.findById(beat.producer);
    if (!producer) {
      return res.status(404).json({ error: 'Producer not found' });
    }

    const amount = Math.round(beat.price); // Convert to cents for Stripe
    const platformFee = Math.round(amount * 0.05); // 5% platform fee
    const producerAmount = amount - platformFee;

    // Create payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'ngn', // Nigerian Naira or change to 'usd' if needed
      metadata: {
        beatId: beatId,
        buyerId: req.user.userId,
        sellerId: producer.id,
        platformFee: platformFee,
        producerAmount: producerAmount
      },
      // Note: For direct transfers, you'd need Stripe Connect
      // For now, we'll use a simpler approach
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      amount: amount,
      platformFee: platformFee,
      producerAmount: producerAmount,
      beat: {
        id: beat.id,
        title: beat.title,
        price: beat.price
      }
    });

  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({ error: 'Failed to create payment intent', details: error.message });
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

    // Verify payment intent
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ error: 'Payment not completed' });
    }

    // Get beat details
    const beat = await Beat.findById(beatId);
    if (!beat || beat.isDeleted) {
      return res.status(404).json({ error: 'Beat not found' });
    }

    // Check if purchase already exists
    const existingPurchases = await Purchase.findByBuyer(req.user.userId);
    const existingPurchase = existingPurchases.find(
      p => p.beat === beatId && p.paymentIntentId === paymentIntentId
    );

    let purchase;
    if (existingPurchase) {
      // Update existing purchase
      purchase = await Purchase.update(existingPurchase.id, {
        status: 'completed',
        downloadUrl: beat.fullBeatUrl || beat.previewUrl
      });
    } else {
      // Create new purchase record
      const platformFee = Math.round(beat.price * 0.05);
      const sellerAmount = beat.price - platformFee;

      purchase = await Purchase.create({
        beat: beatId,
        buyer: req.user.userId,
        seller: beat.producer,
        amount: beat.price,
        platformFee: platformFee,
        sellerAmount: sellerAmount,
        downloadUrl: beat.fullBeatUrl || beat.previewUrl,
        paymentIntentId: paymentIntentId,
        status: 'completed'
      });
    }

    res.json({
      success: true,
      downloadUrl: purchase.downloadUrl,
      purchaseId: purchase.id,
      licenseId: purchase.licenseId,
      message: 'Payment confirmed and beat delivered'
    });

  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({ error: 'Failed to confirm payment', details: error.message });
  }
});

// Get user's purchase history
router.get('/purchases', authenticateToken, async (req, res) => {
  try {
    const { status } = req.query;
    const purchases = await Purchase.findByBuyer(req.user.userId, status || null);

    // Populate beat and seller info
    const populatedPurchases = await Promise.all(purchases.map(async (purchase) => {
      const beat = purchase.beat ? await Beat.findById(purchase.beat) : null;
      const seller = purchase.seller ? await User.findById(purchase.seller) : null;
      
      return {
        id: purchase.id,
        beat: beat ? {
          id: beat.id,
          title: beat.title,
          thumbnailUrl: beat.thumbnailUrl
        } : null,
        seller: seller ? {
          id: seller.id,
          username: seller.username
        } : null,
        amount: purchase.amount,
        platformFee: purchase.platformFee,
        status: purchase.status,
        downloadUrl: purchase.downloadUrl,
        createdAt: purchase.createdAt
      };
    }));

    res.json({
      purchases: populatedPurchases
    });
  } catch (error) {
    console.error('Get purchases error:', error);
    res.status(500).json({ error: 'Failed to get purchases', details: error.message });
  }
});

// Get user's sales history
router.get('/sales', authenticateToken, async (req, res) => {
  try {
    const { status } = req.query;
    const sales = await Purchase.findBySeller(req.user.userId, status || null);

    // Populate beat and buyer info
    const populatedSales = await Promise.all(sales.map(async (sale) => {
      const beat = sale.beat ? await Beat.findById(sale.beat) : null;
      const buyer = sale.buyer ? await User.findById(sale.buyer) : null;
      
      return {
        id: sale.id,
        beat: beat ? {
          id: beat.id,
          title: beat.title,
          thumbnailUrl: beat.thumbnailUrl
        } : null,
        buyer: buyer ? {
          id: buyer.id,
          username: buyer.username
        } : null,
        amount: sale.amount,
        platformFee: sale.platformFee,
        sellerAmount: sale.sellerAmount,
        status: sale.status,
        createdAt: sale.createdAt
      };
    }));

    res.json({
      sales: populatedSales
    });
  } catch (error) {
    console.error('Get sales error:', error);
    res.status(500).json({ error: 'Failed to get sales', details: error.message });
  }
});

// Get license for a purchase
router.get('/license/:purchaseId', authenticateToken, async (req, res) => {
  try {
    const { purchaseId } = req.params;

    // Get purchase
    const purchase = await Purchase.findById(purchaseId);
    if (!purchase) {
      return res.status(404).json({ error: 'Purchase not found' });
    }

    // Verify ownership
    const buyerId = typeof purchase.buyer === 'object' ? purchase.buyer.id : purchase.buyer;
    if (buyerId !== req.user.userId) {
      return res.status(403).json({ error: 'You can only view licenses for your own purchases' });
    }

    // Get beat details
    const beatId = typeof purchase.beat === 'object' ? purchase.beat.id : purchase.beat;
    const beat = await Beat.findById(beatId);
    if (!beat) {
      return res.status(404).json({ error: 'Beat not found' });
    }

    // Get producer details
    const producerId = typeof purchase.seller === 'object' ? purchase.seller.id : purchase.seller;
    const producer = await User.findById(producerId);
    if (!producer) {
      return res.status(404).json({ error: 'Producer not found' });
    }

    // Get buyer details
    const buyer = await User.findById(buyerId);
    if (!buyer) {
      return res.status(404).json({ error: 'Buyer not found' });
    }

    // Standard beat license terms
    const licenseTerms = [
      'This license grants the buyer (Licensee) a non-exclusive right to use the beat for commercial and non-commercial purposes.',
      'The Licensee may use the beat in unlimited commercial recordings, including but not limited to albums, singles, EPs, and mixtapes.',
      'The Licensee may distribute the beat in physical and digital formats, including streaming platforms, radio, and television.',
      'The Licensee may perform the beat publicly, including live performances, concerts, and shows.',
      'The Licensee may create derivative works based on the beat, including remixes and adaptations.',
      'The Licensee must credit the Producer (Licensor) in all uses of the beat, including "Produced by [Producer Name]" or similar attribution.',
      'The Licensee may not resell, lease, or transfer the beat to third parties without explicit written permission from the Producer.',
      'The Licensee may not claim ownership or authorship of the beat itself, only of the lyrics and vocal performances added to it.',
      'The Producer (Licensor) retains all rights to the beat and may continue to license it to other parties.',
      'This license is perpetual and worldwide, with no expiration date.',
      'Any disputes arising from this license shall be resolved through arbitration in accordance with applicable laws.',
      'This license does not grant the Licensee the right to use the beat in any way that is illegal, defamatory, or violates the rights of third parties.'
    ];

    const licenseData = {
      licenseId: purchase.licenseId || `BC-${purchase.id}`,
      beatTitle: beat.title,
      producerName: producer.username || producer.full_name || producer.email,
      producerEmail: producer.email,
      buyerName: buyer.username || buyer.full_name || buyer.email,
      buyerEmail: buyer.email,
      purchaseDate: purchase.createdAt?.toDate?.()?.toISOString() || purchase.createdAt || new Date().toISOString(),
      purchaseAmount: purchase.amount,
      licenseType: 'Standard Non-Exclusive License',
      terms: licenseTerms
    };

    res.json({
      license: licenseData
    });

  } catch (error) {
    console.error('Get license error:', error);
    res.status(500).json({ error: 'Failed to get license', details: error.message });
  }
});

// Regenerate download link
router.post('/regenerate-download', authenticateToken, async (req, res) => {
  try {
    const { purchaseId } = req.body;

    if (!purchaseId) {
      return res.status(400).json({ error: 'Purchase ID is required' });
    }

    // Get purchase
    const purchase = await Purchase.findById(purchaseId);
    if (!purchase) {
      return res.status(404).json({ error: 'Purchase not found' });
    }

    // Verify ownership
    if (purchase.buyer !== req.user.userId) {
      return res.status(403).json({ error: 'You can only regenerate links for your own purchases' });
    }

    // Get beat to regenerate download URL
    const beat = await Beat.findById(purchase.beat);
    if (!beat) {
      return res.status(404).json({ error: 'Beat not found' });
    }

    // If S3 is configured, generate a signed URL
    let downloadUrl = beat.fullBeatUrl || beat.previewUrl;
    
    if (s3 && downloadUrl.includes(process.env.AWS_S3_BUCKET)) {
      // Generate presigned URL that expires in 1 hour
      const params = {
        Bucket: process.env.AWS_S3_BUCKET,
        Key: downloadUrl.split('/').slice(-1)[0], // Extract key from URL
        Expires: 3600 // 1 hour
      };
      downloadUrl = s3.getSignedUrl('getObject', params);
    }

    // Update purchase with new download URL
    await Purchase.update(purchaseId, { downloadUrl });

    res.json({
      downloadUrl: downloadUrl,
      message: 'Download link regenerated'
    });

  } catch (error) {
    console.error('Regenerate download error:', error);
    res.status(500).json({ error: 'Failed to regenerate download link', details: error.message });
  }
});

module.exports = router; 