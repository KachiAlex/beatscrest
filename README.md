# BeatCrest 🎵

A music-focused social media + marketplace platform where producers upload beats, artists can preview and buy them, and users can follow, comment, and message each other.

## 🌟 Features

### Core Features
- **Authentication**: Email, Google, Apple, Facebook login with JWT
- **User Profiles**: Username, photo, bio, follower/following system
- **Beat Marketplace**: Upload, preview, and purchase beats with automated delivery
- **Social Features**: Feed, likes, comments, direct messaging
- **Payment Integration**: Secure payment processing with Stripe
- **Admin Dashboard**: User management, analytics, revenue tracking

### Business Model
- Beat price average: ₦45,000
- Platform commission: 5%
- Automated delivery via cloud storage
- Revenue projection: 10,000+ beats/month by year 6

## 🛠 Tech Stack

### Backend
- **Node.js** + **Express.js** - API server
- **Firebase Firestore** - Database (NoSQL)
- **JWT** - Authentication
- **AWS S3** - File storage
- **Stripe** - Payment processing
- **Socket.io** - Real-time messaging
- **Multer** - File uploads

### Frontend
- **React 18** + **TypeScript** - Modern UI
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Axios** - API calls
- **Socket.io Client** - Real-time features
- **Lucide React** - Icons

## 📁 Project Structure

```
beatcrest/
├── backend/                 # Node.js API server
│   ├── config/             # Database configuration
│   ├── routes/             # API routes
│   ├── middleware/         # Authentication middleware
│   ├── models/             # Database models
│   └── utils/              # Utility functions
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React contexts
│   │   ├── services/       # API services
│   │   └── types/          # TypeScript types
│   └── public/             # Static assets
└── docs/                   # Documentation
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- Firebase account (Firestore)
- AWS S3 account (optional, for file storage)
- Stripe account (optional, for payments)

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp env.example .env
   ```
   
   Update `.env` with your configuration:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000

   # Firebase Configuration
   # Option 1: Service Account JSON (recommended for production)
   FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"your-project-id",...}

   # Option 2: Individual credentials (alternative)
   FIREBASE_PROJECT_ID=your-firebase-project-id
   FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
   FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nYour Private Key\n-----END PRIVATE KEY-----\n

   # JWT
   JWT_SECRET=your-super-secret-jwt-key

   # AWS S3 (optional - for file storage)
   AWS_ACCESS_KEY_ID=your_aws_access_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret_key
   AWS_REGION=us-east-1
   AWS_S3_BUCKET=beatcrest-storage

   # Stripe (optional - for payments)
   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

   The API will be available at `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:3000`

## 📱 Development Phases

### Phase 1: Core Features ✅
- [x] User authentication & profiles
- [x] Beat upload & marketplace
- [x] Payment integration
- [x] Basic social features

### Phase 2: Social Features 🚧
- [ ] Real-time messaging
- [ ] Notifications system
- [ ] Advanced social features
- [ ] Comments & likes

### Phase 3: Advanced Features 📋
- [ ] Admin dashboard
- [ ] Analytics & reporting
- [ ] Performance optimization
- [ ] Mobile app development

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Beats
- `GET /api/beats` - Get all beats with filters
- `GET /api/beats/:id` - Get single beat
- `POST /api/beats/upload` - Upload new beat
- `PUT /api/beats/:id` - Update beat
- `DELETE /api/beats/:id` - Delete beat
- `POST /api/beats/:id/like` - Like/unlike beat

### Users
- `GET /api/users/profile/:username` - Get user profile
- `GET /api/users/:username/beats` - Get user's beats
- `POST /api/users/:username/follow` - Follow/unfollow user
- `GET /api/users/search` - Search users

### Payments
- `POST /api/payments/create-payment-intent` - Create payment
- `POST /api/payments/confirm-payment` - Confirm payment
- `GET /api/payments/purchases` - Get purchase history
- `GET /api/payments/sales` - Get sales history

### Messages
- `GET /api/messages/conversations` - Get conversations
- `GET /api/messages/conversation/:userId` - Get messages
- `POST /api/messages/send` - Send message
- `PUT /api/messages/conversation/:userId/read` - Mark conversation as read

### Notifications
- `GET /api/notifications` - Get all notifications
- `GET /api/notifications/unread-count` - Get unread count
- `PUT /api/notifications/:id/read` - Mark notification as read
- `PUT /api/notifications/read-all` - Mark all notifications as read
- `DELETE /api/notifications/:id` - Delete notification

### Admin
- `GET /api/admin/stats` - Get platform statistics
- `GET /api/admin/users` - Get all users (paginated)
- `PUT /api/admin/users/:id/status` - Update user status
- `GET /api/admin/beats` - Get all beats (paginated)
- `PUT /api/admin/beats/:id/status` - Update beat status
- `GET /api/admin/purchases` - Get all purchases
- `GET /api/admin/revenue` - Get revenue breakdown
- `GET /api/admin/top-producers` - Get top producers

## 🎨 UI Components

The frontend uses a modern component library with:
- **Button**: Multiple variants and sizes
- **Card**: Flexible card components
- **Badge**: Status indicators
- **Modal**: Authentication and dialogs
- **Form**: Input fields and validation

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- CORS protection
- Helmet.js security headers
- Rate limiting
- Input validation and sanitization

## 📊 Database Schema

### Firebase Firestore Collections
- **users**: User accounts and profiles
- **beats**: Beat information and metadata
- **purchases**: Transaction records
- **comments**: Beat comments
- **messages**: Direct messages
- **notifications**: User notifications

### Data Structure
- Users contain arrays for `followers` and `following` (user IDs)
- Beats contain arrays for `likes` (user IDs)
- Messages are stored with sender/receiver references
- All collections use Firestore timestamps for `createdAt` and `updatedAt`

> **Note**: See `FIREBASE_SETUP.md` for detailed Firebase setup instructions and security rules.

## 🚀 Deployment

### Backend Deployment
1. Set up Firebase Firestore database
2. Configure Firebase service account credentials
3. Set environment variables in your hosting platform
4. Deploy to Heroku/Render/AWS/DigitalOcean
5. Set up SSL certificates

### Firebase Setup
See `FIREBASE_SETUP.md` for detailed instructions on:
- Creating a Firebase project
- Setting up Firestore
- Configuring service account
- Security rules

### Frontend Deployment
1. Build the application: `npm run build`
2. Deploy to Netlify/Vercel/AWS S3
3. Configure environment variables
4. Set up custom domain

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **KachiAlex** - Full Stack Developer
- BeatCrest Team

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Email: support@beatcrest.com
- Discord: [BeatCrest Community](https://discord.gg/beatcrest)

---

**BeatCrest** - Connecting producers and artists worldwide through music! 🎵 