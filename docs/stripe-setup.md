# Stripe Integration Setup Guide

## Overview
This guide will help you set up Stripe payment processing for BeatCrest, enabling users to purchase beats securely.

## Step 1: Create Stripe Account

1. **Go to [Stripe.com](https://stripe.com)**
2. **Sign up** for a new account
3. **Complete verification** (business details, bank account, etc.)
4. **Wait for approval** (usually instant for test mode)

## Step 2: Get API Keys

### Test Mode (Development)
1. **Go to [Stripe Dashboard](https://dashboard.stripe.com)**
2. **Navigate to Developers** → **API Keys**
3. **Copy your keys:**
   - **Publishable Key**: `pk_test_...`
   - **Secret Key**: `sk_test_...`

### Live Mode (Production)
1. **Switch to Live mode** in Stripe Dashboard
2. **Get live keys:**
   - **Publishable Key**: `pk_live_...`
   - **Secret Key**: `sk_live_...`

## Step 3: Configure Environment Variables

### Backend (Render)
Update your Render environment variables:

```yaml
STRIPE_SECRET_KEY: sk_test_your_secret_key_here
STRIPE_PUBLISHABLE_KEY: pk_test_your_publishable_key_here
STRIPE_WEBHOOK_SECRET: whsec_your_webhook_secret_here
```

### Frontend (Netlify)
Update your Netlify environment variables:

```yaml
VITE_STRIPE_PUBLISHABLE_KEY: pk_test_your_publishable_key_here
```

## Step 4: Set Up Webhooks (Optional)

1. **Go to Stripe Dashboard** → **Developers** → **Webhooks**
2. **Add endpoint**: `https://your-backend.onrender.com/api/payments/webhook`
3. **Select events:**
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `transfer.created`
4. **Copy webhook secret** and add to environment variables

## Step 5: Test the Integration

### Test Cards
Use these test card numbers:
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0025 0000 3155`

### Test the Flow
1. **Upload a beat** (as producer)
2. **Browse marketplace** (as buyer)
3. **Click "Buy Beat"**
4. **Complete payment** with test card
5. **Verify purchase** in dashboard

## Step 6: Connect Bank Accounts (Producers)

For producers to receive payments:

1. **Create Stripe Connect accounts** for producers
2. **Collect bank account details**
3. **Verify accounts**
4. **Store account IDs** in your database

## Security Best Practices

1. **Never expose secret keys** in frontend code
2. **Use webhooks** for payment confirmation
3. **Validate amounts** server-side
4. **Implement idempotency** for payment operations
5. **Log all payment events** for debugging

## Troubleshooting

### Common Issues
- **"Payment service not configured"**: Check environment variables
- **"Invalid API key"**: Verify key format and mode (test/live)
- **"Amount too small"**: Ensure amount is in cents (e.g., $45.00 = 4500)

### Testing Checklist
- [ ] API keys are correct
- [ ] Environment variables are set
- [ ] CORS is configured
- [ ] Webhooks are working (if enabled)
- [ ] Test payments succeed
- [ ] Error handling works

## Next Steps

1. **Set up MongoDB** for storing payment records
2. **Implement producer onboarding** with Stripe Connect
3. **Add payment analytics** and reporting
4. **Set up automated payouts** to producers
5. **Implement refund handling**

## Support

- **Stripe Documentation**: https://stripe.com/docs
- **Stripe Support**: https://support.stripe.com
- **BeatCrest Issues**: Create GitHub issue 