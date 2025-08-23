# BeatCrest Environment Variables Setup

## Quick Setup

### 1. Backend Environment
```bash
cd backend
cp env.example .env
# Edit .env with your actual values
```

### 2. Frontend Environment
```bash
cd frontend
# Create .env file with:
VITE_API_URL=http://localhost:5000/api
VITE_WS_URL=ws://localhost:5000
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key
VITE_APP_NAME=BeatCrest
VITE_APP_VERSION=1.0.0
```

### 3. Netlify Environment Variables
Go to Netlify Dashboard → Site Settings → Environment Variables

Add:
- VITE_API_URL=https://your-backend-url.com/api
- VITE_WS_URL=wss://your-backend-url.com
- VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key

### 4. Backend Deployment
For Render/Railway/Heroku, add these environment variables:

**Required:**
- PORT=5000
- NODE_ENV=production
- JWT_SECRET=your-secure-secret
- DB_HOST=your-db-host
- DB_NAME=your-db-name
- DB_USER=your-db-user
- DB_PASSWORD=your-db-password

**Optional (for full features):**
- AWS_ACCESS_KEY_ID=your-aws-key
- AWS_SECRET_ACCESS_KEY=your-aws-secret
- AWS_REGION=us-east-1
- AWS_S3_BUCKET=your-bucket-name
- STRIPE_SECRET_KEY=sk_live_your-stripe-key
- EMAIL_HOST=smtp.gmail.com
- EMAIL_USER=your-email@gmail.com
- EMAIL_PASS=your-app-password

## Development vs Production

### Development (.env files)
- Use local database
- Use test API keys
- Use localhost URLs

### Production (Platform environment variables)
- Use production database
- Use live API keys
- Use production URLs
- Never commit .env files to Git 