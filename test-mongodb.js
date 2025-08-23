const mongoose = require('mongoose');
require('dotenv').config();

async function testMongoDBConnection() {
  try {
    console.log('🔌 Testing MongoDB connection...');
    
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/beatcrest';
    console.log('📡 Connecting to:', mongoURI.replace(/\/\/.*@/, '//***:***@'));
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ MongoDB connected successfully!');
    
    // Test creating a collection
    const testSchema = new mongoose.Schema({ name: String });
    const Test = mongoose.model('Test', testSchema);
    
    // Create a test document
    const testDoc = new Test({ name: 'BeatCrest Test' });
    await testDoc.save();
    console.log('✅ Test document created successfully!');
    
    // Clean up
    await Test.deleteOne({ name: 'BeatCrest Test' });
    console.log('✅ Test document cleaned up!');
    
    await mongoose.disconnect();
    console.log('✅ MongoDB connection closed successfully!');
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
}

testMongoDBConnection(); 