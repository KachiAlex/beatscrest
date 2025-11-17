const { getFirestore, COLLECTIONS, admin } = require('../config/firebase');

const db = getFirestore();

// Helper function to convert Firestore timestamp to ISO string
const toDate = (timestamp) => {
  if (!timestamp) return null;
  if (timestamp.toDate) {
    return timestamp.toDate().toISOString();
  }
  if (timestamp instanceof Date) {
    return timestamp.toISOString();
  }
  return timestamp;
};

// Helper function to convert Firestore document reference to ID
const refToId = (ref) => {
  if (!ref) return null;
  if (typeof ref === 'string') return ref;
  if (ref.id) return ref.id;
  if (ref._path) return ref._path.segments[ref._path.segments.length - 1];
  return null;
};

// Helper function to convert document to plain object
const docToObject = (doc) => {
  if (!doc || !doc.exists) return null;
  const data = doc.data();
  const result = {
    id: doc.id,
    ...data,
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt)
  };
  
  // Convert document references to IDs
  if (result.producer) result.producer = refToId(result.producer);
  if (result.buyer) result.buyer = refToId(result.buyer);
  if (result.seller) result.seller = refToId(result.seller);
  if (result.beat) result.beat = refToId(result.beat);
  if (result.user) result.user = refToId(result.user);
  if (result.sender) result.sender = refToId(result.sender);
  if (result.receiver) result.receiver = refToId(result.receiver);
  if (result.relatedId) result.relatedId = refToId(result.relatedId);
  
  // Convert arrays of references
  if (result.followers && Array.isArray(result.followers)) {
    result.followers = result.followers.map(refToId);
  }
  if (result.following && Array.isArray(result.following)) {
    result.following = result.following.map(refToId);
  }
  if (result.likes && Array.isArray(result.likes)) {
    result.likes = result.likes.map(refToId);
  }
  
  return result;
};

// User Model
const User = {
  collection: db.collection(COLLECTIONS.USERS),

  async create(userData) {
    const userRef = this.collection.doc();
    const newUser = {
      ...userData,
      followers: [], // Store user IDs, not references
      following: [], // Store user IDs, not references
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    await userRef.set(newUser);
    const created = await userRef.get();
    return docToObject(created);
  },

  async findById(userId) {
    const doc = await this.collection.doc(userId).get();
    return docToObject(doc);
  },

  async findByEmail(email) {
    const snapshot = await this.collection.where('email', '==', email).limit(1).get();
    if (snapshot.empty) return null;
    return docToObject(snapshot.docs[0]);
  },

  async findByUsername(username) {
    const snapshot = await this.collection.where('username', '==', username).limit(1).get();
    if (snapshot.empty) return null;
    return docToObject(snapshot.docs[0]);
  },

  async update(userId, updates) {
    const userRef = this.collection.doc(userId);
    await userRef.update({
      ...updates,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    return this.findById(userId);
  },

  async search(query, limit = 20) {
    const snapshot = await this.collection
      .where('username', '>=', query)
      .where('username', '<=', query + '\uf8ff')
      .limit(limit)
      .get();
    
    return snapshot.docs.map(doc => docToObject(doc));
  },

  async follow(followerId, followeeId) {
    const follower = await this.findById(followerId);
    const followee = await this.findById(followeeId);
    
    if (!follower || !followee) {
      throw new Error('User not found');
    }
    
    const followerFollowing = follower.following || [];
    const followeeFollowers = followee.followers || [];
    
    if (followerFollowing.includes(followeeId)) {
      return { followed: false, message: 'Already following' };
    }
    
    // Add to follower's following list
    await this.collection.doc(followerId).update({
      following: admin.firestore.FieldValue.arrayUnion(followeeId)
    });
    
    // Add to followee's followers list
    await this.collection.doc(followeeId).update({
      followers: admin.firestore.FieldValue.arrayUnion(followerId)
    });
    
    return { followed: true };
  },

  async unfollow(followerId, followeeId) {
    const follower = await this.findById(followerId);
    const followee = await this.findById(followeeId);
    
    if (!follower || !followee) {
      throw new Error('User not found');
    }
    
    const followerFollowing = follower.following || [];
    const followeeFollowers = followee.followers || [];
    
    if (!followerFollowing.includes(followeeId)) {
      return { unfollowed: false, message: 'Not following' };
    }
    
    // Remove from follower's following list
    const updatedFollowing = followerFollowing.filter(id => id !== followeeId);
    await this.collection.doc(followerId).update({ following: updatedFollowing });
    
    // Remove from followee's followers list
    const updatedFollowers = followeeFollowers.filter(id => id !== followerId);
    await this.collection.doc(followeeId).update({ followers: updatedFollowers });
    
    return { unfollowed: true };
  }
};

// Beat Model
const Beat = {
  collection: db.collection(COLLECTIONS.BEATS),

  async create(beatData) {
    const beatRef = this.collection.doc();
    const db = getFirestore();
    // Convert producer ID to document reference
    const producerRef = db.doc(`${COLLECTIONS.USERS}/${beatData.producer}`);
    const newBeat = {
      ...beatData,
      producer: producerRef,
      playCount: 0,
      likes: [], // Store user IDs
      isDeleted: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    await beatRef.set(newBeat);
    const created = await beatRef.get();
    return docToObject(created);
  },

  async findById(beatId) {
    const doc = await this.collection.doc(beatId).get();
    return docToObject(doc);
  },

  async findMany(filters = {}, page = 1, limit = 20) {
    let query = this.collection.where('isDeleted', '==', false);
    
    if (filters.genre) {
      query = query.where('genre', '==', filters.genre);
    }
    if (filters.minPrice !== undefined) {
      query = query.where('price', '>=', parseFloat(filters.minPrice));
    }
    if (filters.maxPrice !== undefined) {
      query = query.where('price', '<=', parseFloat(filters.maxPrice));
    }
    if (filters.bpm) {
      query = query.where('bpm', '==', parseInt(filters.bpm));
    }
    if (filters.producerId) {
      const db = getFirestore();
      const producerRef = db.doc(`${COLLECTIONS.USERS}/${filters.producerId}`);
      query = query.where('producer', '==', producerRef);
    }

    // Note: Firestore requires an index for multiple where clauses with orderBy
    // For now, we'll do filtering in memory if needed
    const snapshot = await query.orderBy('createdAt', 'desc').get();
    
    let beats = snapshot.docs.map(doc => docToObject(doc));
    
    // Populate producer info
    beats = await Promise.all(beats.map(async (beat) => {
      if (beat.producer) {
        const producer = await User.findById(beat.producer);
        if (producer) {
          beat.producer = {
            id: producer.id,
            username: producer.username,
            profilePicture: producer.profilePicture
          };
        }
      }
      return beat;
    }));
    
    // Apply text search if provided
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      beats = beats.filter(beat => 
        beat.title?.toLowerCase().includes(searchTerm) ||
        beat.description?.toLowerCase().includes(searchTerm) ||
        beat.genre?.toLowerCase().includes(searchTerm)
      );
    }
    
    // Manual pagination
    const offset = (page - 1) * limit;
    return beats.slice(offset, offset + limit);
  },

  async update(beatId, updates) {
    const beatRef = this.collection.doc(beatId);
    await beatRef.update({
      ...updates,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    return this.findById(beatId);
  },

  async delete(beatId) {
    return this.update(beatId, { isDeleted: true });
  },

  async like(beatId, userId) {
    const beatRef = this.collection.doc(beatId);
    const beat = await this.findById(beatId);
    
    if (!beat) throw new Error('Beat not found');
    
    const likes = beat.likes || [];
    
    if (likes.includes(userId)) {
      // Unlike - remove user ID from array
      const updatedLikes = likes.filter(id => id !== userId);
      await beatRef.update({ likes: updatedLikes });
      return { liked: false };
    } else {
      // Like - add user ID to array
      await beatRef.update({
        likes: admin.firestore.FieldValue.arrayUnion(userId)
      });
      return { liked: true };
    }
  }
};

// Purchase Model
const Purchase = {
  collection: db.collection(COLLECTIONS.PURCHASES),

  async create(purchaseData) {
    const purchaseRef = this.collection.doc();
    const db = getFirestore();
    // Convert IDs to document references
    const beatRef = db.doc(`${COLLECTIONS.BEATS}/${purchaseData.beat}`);
    const buyerRef = db.doc(`${COLLECTIONS.USERS}/${purchaseData.buyer}`);
    const sellerRef = db.doc(`${COLLECTIONS.USERS}/${purchaseData.seller}`);
    
    // Generate license ID: BC-YYYYMMDD-XXXXX (e.g., BC-20240125-A1B2C)
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');
    const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
    const licenseId = `BC-${dateStr}-${randomStr}`;
    
    const newPurchase = {
      ...purchaseData,
      beat: beatRef,
      buyer: buyerRef,
      seller: sellerRef,
      licenseId: licenseId,
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };
    await purchaseRef.set(newPurchase);
    const created = await purchaseRef.get();
    return docToObject(created);
  },

  async findById(purchaseId) {
    const doc = await this.collection.doc(purchaseId).get();
    return docToObject(doc);
  },

  async findByBuyer(buyerId, status = null) {
    const db = getFirestore();
    const buyerRef = db.doc(`${COLLECTIONS.USERS}/${buyerId}`);
    let query = this.collection.where('buyer', '==', buyerRef);
    if (status) {
      query = query.where('status', '==', status);
    }
    const snapshot = await query.orderBy('createdAt', 'desc').get();
    return snapshot.docs.map(doc => docToObject(doc));
  },

  async findBySeller(sellerId, status = null) {
    const db = getFirestore();
    const sellerRef = db.doc(`${COLLECTIONS.USERS}/${sellerId}`);
    let query = this.collection.where('seller', '==', sellerRef);
    if (status) {
      query = query.where('status', '==', status);
    }
    const snapshot = await query.orderBy('createdAt', 'desc').get();
    return snapshot.docs.map(doc => docToObject(doc));
  },

  async update(purchaseId, updates) {
    const purchaseRef = this.collection.doc(purchaseId);
    await purchaseRef.update(updates);
    return this.findById(purchaseId);
  }
};

// Comment Model
const Comment = {
  collection: db.collection(COLLECTIONS.COMMENTS),

  async create(commentData) {
    const commentRef = this.collection.doc();
    const db = getFirestore();
    // Convert IDs to document references
    const beatRef = db.doc(`${COLLECTIONS.BEATS}/${commentData.beat}`);
    const userRef = db.doc(`${COLLECTIONS.USERS}/${commentData.user}`);
    const newComment = {
      ...commentData,
      beat: beatRef,
      user: userRef,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };
    await commentRef.set(newComment);
    const created = await commentRef.get();
    return docToObject(created);
  },

  async findByBeat(beatId) {
    const db = getFirestore();
    const beatRef = db.doc(`${COLLECTIONS.BEATS}/${beatId}`);
    const snapshot = await this.collection
      .where('beat', '==', beatRef)
      .orderBy('createdAt', 'desc')
      .get();
    return snapshot.docs.map(doc => docToObject(doc));
  }
};

// Message Model
const Message = {
  collection: db.collection(COLLECTIONS.MESSAGES),

  async create(messageData) {
    const messageRef = this.collection.doc();
    const db = getFirestore();
    // Convert IDs to document references
    const senderRef = db.doc(`${COLLECTIONS.USERS}/${messageData.sender}`);
    const receiverRef = db.doc(`${COLLECTIONS.USERS}/${messageData.receiver}`);
    const newMessage = {
      ...messageData,
      sender: senderRef,
      receiver: receiverRef,
      isRead: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };
    await messageRef.set(newMessage);
    const created = await messageRef.get();
    return docToObject(created);
  },

  async getConversation(userId1, userId2) {
    const db = getFirestore();
    // Firestore doesn't support OR queries easily, so we'll get both and filter
    const user1Ref = db.doc(`${COLLECTIONS.USERS}/${userId1}`);
    const user2Ref = db.doc(`${COLLECTIONS.USERS}/${userId2}`);
    
    const sentMessages = await this.collection
      .where('sender', '==', user1Ref)
      .where('receiver', '==', user2Ref)
      .orderBy('createdAt', 'asc')
      .get();
    
    const receivedMessages = await this.collection
      .where('sender', '==', user2Ref)
      .where('receiver', '==', user1Ref)
      .orderBy('createdAt', 'asc')
      .get();
    
    const allMessages = [...sentMessages.docs, ...receivedMessages.docs]
      .map(doc => docToObject(doc))
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    
    return allMessages;
  },

  async getConversations(userId) {
    const db = getFirestore();
    const userRef = db.doc(`${COLLECTIONS.USERS}/${userId}`);
    
    // Get messages where user is sender or receiver
    const sentMessages = await this.collection.where('sender', '==', userRef).get();
    const receivedMessages = await this.collection.where('receiver', '==', userRef).get();
    
    const conversationMap = new Map();
    
    // Process sent messages
    sentMessages.docs.forEach(doc => {
      const message = docToObject(doc);
      const otherUserId = message.receiver;
      if (otherUserId && !conversationMap.has(otherUserId)) {
        conversationMap.set(otherUserId, {
          lastMessage: message.content,
          lastMessageTime: message.createdAt,
          unreadCount: 0
        });
      }
    });
    
    // Process received messages
    receivedMessages.docs.forEach(doc => {
      const message = docToObject(doc);
      const otherUserId = message.sender;
      if (!otherUserId) return;
      
      const existing = conversationMap.get(otherUserId) || {
        lastMessage: message.content,
        lastMessageTime: message.createdAt,
        unreadCount: 0
      };
      
      if (!message.isRead) {
        existing.unreadCount++;
      }
      
      if (new Date(message.createdAt) > new Date(existing.lastMessageTime || 0)) {
        existing.lastMessage = message.content;
        existing.lastMessageTime = message.createdAt;
      }
      
      conversationMap.set(otherUserId, existing);
    });
    
    return Array.from(conversationMap.entries()).map(([otherUserId, data]) => ({
      other_user_id: otherUserId,
      ...data
    }));
  },

  async markAsRead(userId, otherUserId) {
    const db = getFirestore();
    const userRef = db.doc(`${COLLECTIONS.USERS}/${userId}`);
    const otherUserRef = db.doc(`${COLLECTIONS.USERS}/${otherUserId}`);
    
    const snapshot = await this.collection
      .where('sender', '==', otherUserRef)
      .where('receiver', '==', userRef)
      .where('isRead', '==', false)
      .get();
    
    const batch = db.batch();
    snapshot.docs.forEach(doc => {
      batch.update(doc.ref, { isRead: true });
    });
    await batch.commit();
    
    return snapshot.size;
  }
};

// Notification Model
const Notification = {
  collection: db.collection(COLLECTIONS.NOTIFICATIONS),

  async create(notificationData) {
    const notificationRef = this.collection.doc();
    const db = getFirestore();
    // Convert user ID to document reference
    const userRef = db.doc(`${COLLECTIONS.USERS}/${notificationData.user}`);
    const newNotification = {
      ...notificationData,
      user: userRef,
      isRead: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };
    if (notificationData.relatedId) {
      // Convert relatedId to reference based on type (could be beat, user, etc.)
      // For simplicity, we'll store it as string for now
      newNotification.relatedId = notificationData.relatedId;
    }
    await notificationRef.set(newNotification);
    const created = await notificationRef.get();
    return docToObject(created);
  },

  async findByUser(userId, unreadOnly = false) {
    const db = getFirestore();
    const userRef = db.doc(`${COLLECTIONS.USERS}/${userId}`);
    let query = this.collection.where('user', '==', userRef);
    
    if (unreadOnly) {
      query = query.where('isRead', '==', false);
    }
    
    try {
      const snapshot = await query.orderBy('createdAt', 'desc').get();
      return snapshot.docs.map(doc => docToObject(doc));
    } catch (error) {
      // If orderBy fails (needs index), try without orderBy
      if (error.code === 9) { // FAILED_PRECONDITION - index needed
        const snapshot = await query.get();
        const notifications = snapshot.docs.map(doc => docToObject(doc));
        // Sort in memory
        return notifications.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
      }
      throw error;
    }
  }
};

// Tenant Model
const Tenant = {
  collection: db.collection(COLLECTIONS.TENANTS),

  async create(tenantData) {
    const tenantRef = this.collection.doc();
    const db = getFirestore();
    const newTenant = {
      ...tenantData,
      adminIds: tenantData.adminIds || [], // Array of user IDs who are tenant admins
      isActive: tenantData.isActive !== undefined ? tenantData.isActive : true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    await tenantRef.set(newTenant);
    const created = await tenantRef.get();
    return docToObject(created);
  },

  async findById(tenantId) {
    const doc = await this.collection.doc(tenantId).get();
    return docToObject(doc);
  },

  async findByName(name) {
    const snapshot = await this.collection.where('name', '==', name).limit(1).get();
    if (snapshot.empty) return null;
    return docToObject(snapshot.docs[0]);
  },

  async findAll(filters = {}) {
    let query = this.collection;
    
    if (filters.isActive !== undefined) {
      query = query.where('isActive', '==', filters.isActive);
    }
    
    const snapshot = await query.orderBy('createdAt', 'desc').get();
    return snapshot.docs.map(doc => docToObject(doc));
  },

  async update(tenantId, updates) {
    const tenantRef = this.collection.doc(tenantId);
    await tenantRef.update({
      ...updates,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    return this.findById(tenantId);
  },

  async addAdmin(tenantId, userId) {
    const tenantRef = this.collection.doc(tenantId);
    await tenantRef.update({
      adminIds: admin.firestore.FieldValue.arrayUnion(userId),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    return this.findById(tenantId);
  },

  async removeAdmin(tenantId, userId) {
    const tenant = await this.findById(tenantId);
    if (!tenant) throw new Error('Tenant not found');
    
    const adminIds = tenant.adminIds || [];
    const updatedAdminIds = adminIds.filter(id => id !== userId);
    
    const tenantRef = this.collection.doc(tenantId);
    await tenantRef.update({
      adminIds: updatedAdminIds,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    return this.findById(tenantId);
  },

  async delete(tenantId) {
    return this.update(tenantId, { isActive: false });
  }
};

module.exports = {
  User,
  Beat,
  Purchase,
  Comment,
  Message,
  Notification,
  Tenant,
  docToObject
};

