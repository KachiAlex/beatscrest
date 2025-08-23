# 🍃 MongoDB Setup for BeatCrest

## **Why MongoDB for BeatCrest?**

MongoDB is perfect for BeatCrest because:
- ✅ **Flexible schema** - Easy to add new fields to beats/users
- ✅ **JSON-like documents** - Natural fit for music metadata
- ✅ **Scalable** - Handles large amounts of beat data
- ✅ **Free tier available** - MongoDB Atlas offers free cloud database

## **Option 1: MongoDB Atlas (Recommended - Free)**

### **Step 1: Create MongoDB Atlas Account**
1. **Go to [mongodb.com/atlas](https://mongodb.com/atlas)**
2. **Click "Try Free"**
3. **Sign up with Google/GitHub**
4. **Create a free account**

### **Step 2: Create Database Cluster**
1. **Click "Build a Database"**
2. **Choose "FREE" tier (M0)**
3. **Select cloud provider** (AWS/Google Cloud/Azure)
4. **Choose region** (closest to your users)
5. **Click "Create"**

### **Step 3: Set Up Database Access**
1. **Go to "Database Access"**
2. **Click "Add New Database User"**
3. **Username:** `beatcrest-user`
4. **Password:** Create a strong password
5. **Role:** "Read and write to any database"
6. **Click "Add User"**

### **Step 4: Set Up Network Access**
1. **Go to "Network Access"**
2. **Click "Add IP Address"**
3. **Click "Allow Access from Anywhere"** (for development)
4. **Click "Confirm"**

### **Step 5: Get Connection String**
1. **Go to "Database"**
2. **Click "Connect"**
3. **Choose "Connect your application"**
4. **Copy the connection string**
5. **Replace `<password>` with your database password**

**Example connection string:**
```
mongodb+srv://beatcrest-user:yourpassword@cluster0.xxxxx.mongodb.net/beatcrest?retryWrites=true&w=majority
```

## **Option 2: Local MongoDB (Development)**

### **Install MongoDB Locally**
1. **Download MongoDB Community Server**
2. **Install with default settings**
3. **Start MongoDB service**
4. **Use connection string:** `mongodb://localhost:27017/beatcrest`

## **Environment Variables Setup**

### **For Local Development (.env file):**
```bash
MONGODB_URI=mongodb://localhost:27017/beatcrest
```

### **For Production (Render):**
```bash
MONGODB_URI=mongodb+srv://beatcrest-user:yourpassword@cluster0.xxxxx.mongodb.net/beatcrest?retryWrites=true&w=majority
```

## **Render Deployment with MongoDB**

### **Step 1: Update Environment Variables**
In your Render dashboard, set:
```bash
MONGODB_URI=mongodb+srv://beatcrest-user:yourpassword@cluster0.xxxxx.mongodb.net/beatcrest?retryWrites=true&w=majority
```

### **Step 2: Deploy**
1. **Push your code to GitHub**
2. **Render will automatically redeploy**
3. **Check logs for MongoDB connection success**

## **Database Collections**

BeatCrest will automatically create these collections:
- **users** - User accounts and profiles
- **beats** - Beat metadata and file URLs
- **purchases** - Transaction records
- **comments** - Beat comments
- **messages** - Direct messages
- **notifications** - User notifications

## **Benefits of MongoDB for BeatCrest**

### **Flexible Schema:**
```javascript
// Easy to add new fields to beats
{
  title: "Amazing Beat",
  genre: "Hip Hop",
  bpm: 140,
  // Can easily add: tags, mood, instruments, etc.
}
```

### **Rich Queries:**
```javascript
// Find beats by multiple criteria
db.beats.find({
  genre: "Hip Hop",
  bpm: { $gte: 130, $lte: 150 },
  price: { $lte: 50 }
})
```

### **Scalability:**
- Handles millions of beats
- Automatic indexing
- Sharding for large datasets

## **Security Best Practices**

1. **Use strong passwords**
2. **Enable network access restrictions**
3. **Use environment variables**
4. **Regular backups**
5. **Monitor database usage**

## **Troubleshooting**

### **Connection Issues:**
- Check network access settings
- Verify connection string
- Ensure database user has correct permissions

### **Performance Issues:**
- Add indexes for frequently queried fields
- Use connection pooling
- Monitor query performance

## **Next Steps**

1. **Set up MongoDB Atlas account**
2. **Get your connection string**
3. **Update environment variables**
4. **Deploy to Render**
5. **Test your application**

Your BeatCrest application will now use MongoDB for all data storage! 🎵 