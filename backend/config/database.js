const mongoose = require('mongoose');

// MongoDB connection function
const connectDatabase = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/beatcrest';
    
    await mongoose.connect(mongoURI);
    
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

// Initialize database with schemas
const initializeDatabase = async () => {
  try {
    // User Schema
    const userSchema = new mongoose.Schema({
      username: { type: String, required: true, unique: true },
      email: { type: String, required: true, unique: true },
      password: { type: String, required: true },
      profilePicture: { type: String, default: '' },
      bio: { type: String, default: '' },
      accountType: { 
        type: String, 
        enum: ['Producer', 'Artist', 'Fan'], 
        default: 'Fan' 
      },
      followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now }
    });

    // Beat Schema
    const beatSchema = new mongoose.Schema({
      title: { type: String, required: true },
      description: { type: String },
      genre: { type: String, required: true },
      bpm: { type: Number },
      key: { type: String },
      price: { type: Number, required: true },
      producer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      previewUrl: { type: String, required: true },
      fullBeatUrl: { type: String, required: true },
      thumbnailUrl: { type: String },
      playCount: { type: Number, default: 0 },
      likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      isDeleted: { type: Boolean, default: false },
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now }
    });

    // Purchase Schema
    const purchaseSchema = new mongoose.Schema({
      beat: { type: mongoose.Schema.Types.ObjectId, ref: 'Beat', required: true },
      buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      amount: { type: Number, required: true },
      platformFee: { type: Number, required: true },
      sellerAmount: { type: Number, required: true },
      downloadUrl: { type: String },
      paymentIntentId: { type: String },
      status: { 
        type: String, 
        enum: ['pending', 'completed', 'failed'], 
        default: 'pending' 
      },
      createdAt: { type: Date, default: Date.now }
    });

    // Comment Schema
    const commentSchema = new mongoose.Schema({
      beat: { type: mongoose.Schema.Types.ObjectId, ref: 'Beat', required: true },
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      content: { type: String, required: true },
      createdAt: { type: Date, default: Date.now }
    });

    // Message Schema
    const messageSchema = new mongoose.Schema({
      sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      content: { type: String, required: true },
      isRead: { type: Boolean, default: false },
      createdAt: { type: Date, default: Date.now }
    });

    // Notification Schema
    const notificationSchema = new mongoose.Schema({
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      type: { 
        type: String, 
        enum: ['like', 'comment', 'follow', 'purchase', 'message'], 
        required: true 
      },
      title: { type: String, required: true },
      message: { type: String, required: true },
      relatedId: { type: mongoose.Schema.Types.ObjectId },
      isRead: { type: Boolean, default: false },
      createdAt: { type: Date, default: Date.now }
    });

    // Create models if they don't exist
    const User = mongoose.models.User || mongoose.model('User', userSchema);
    const Beat = mongoose.models.Beat || mongoose.model('Beat', beatSchema);
    const Purchase = mongoose.models.Purchase || mongoose.model('Purchase', purchaseSchema);
    const Comment = mongoose.models.Comment || mongoose.model('Comment', commentSchema);
    const Message = mongoose.models.Message || mongoose.model('Message', messageSchema);
    const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);

    console.log('✅ Database schemas initialized');
    
    return { User, Beat, Purchase, Comment, Message, Notification };
  } catch (error) {
    console.error('❌ Database initialization error:', error.message);
    throw error;
  }
};

module.exports = { connectDatabase, initializeDatabase }; 