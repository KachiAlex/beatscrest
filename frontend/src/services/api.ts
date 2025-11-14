import axios from 'axios';
import { User, Beat, Purchase, Comment, Message, Conversation, Notification, RegisterData, LoginData, ApiResponse, PaginatedResponse } from '../types';
import { mockBeats as localMockBeats } from '../data/mockBeats';

// Simple API configuration
const baseURL = (import.meta as any).env?.VITE_API_URL ?? (import.meta.env.DEV ? '/api' : 'https://beatscrest.onrender.com/api');
const api = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log('🚀 API Request:', config.method?.toUpperCase(), config.url);
    // Attach auth token if present
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = config.headers || {};
      (config.headers as any)['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('❌ API Response Error:', error.response?.status, error.message);
    return Promise.reject(error);
  }
);

// Prefer real backend, fallback to local mock where needed
const getProfile = async () => {
  try {
    const res = await api.get('/auth/me');
    return { user: res.data.user as User };
  } catch (err) {
    // Fallback to locally persisted mock
    const storedUser = localStorage.getItem('mockUser');
    if (storedUser) {
      return { user: JSON.parse(storedUser) as User };
    }
    throw err;
  }
};

const login = async (credentials: { email: string; password: string }) => {
  try {
    const { data } = await api.post('/auth/login', credentials);
    return { user: data.user as User, token: data.token as string };
  } catch (err) {
    // Dev fallback: minimal local mock so UI remains usable
    const userData = {
      id: 1,
      username: credentials.email.split('@')[0],
      email: credentials.email,
      full_name: credentials.email.split('@')[0].replace(/[0-9]/g, '').replace(/[^a-zA-Z]/g, ' ') || 'User',
      profile_picture: null,
      bio: '',
      headline: '',
      rating: 0,
      total_ratings: 0,
      account_type: 'producer' as const,
      is_verified: false,
      followers_count: 0,
      following_count: 0,
      created_at: new Date().toISOString()
    } as unknown as User;
    return { user: userData, token: 'mock_jwt_token_' + Date.now() };
  }
};

const register = async (userData: any) => {
  try {
    const { data } = await api.post('/auth/register', userData);
    return { user: data.user as User, token: data.token as string };
  } catch (err) {
    // Dev fallback similar to previous implementation
    const newUser = {
      id: 1,
      username: userData.username || 'new_user',
      email: userData.email,
      full_name: userData.full_name || userData.username || 'New User',
      profile_picture: null,
      bio: '',
      headline: '',
      rating: 0,
      total_ratings: 0,
      account_type: userData.account_type || 'producer',
      is_verified: false,
      followers_count: 0,
      following_count: 0,
      created_at: new Date().toISOString()
    } as unknown as User;
    return { user: newUser, token: 'mock_jwt_token_' + Date.now() };
  }
};

const uploadBeat = async (beatData: any) => {
  try {
    const { data } = await api.post('/beats/upload', beatData);
    return { data };
  } catch (err) {
    // Fallback mock response
    return {
      data: {
        beat: {
          id: Math.floor(Math.random() * 10000),
          ...beatData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      }
    };
  }
};

const updateProfile = async (profileData: any) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Get current user data
  const storedUser = localStorage.getItem('mockUser');
  const currentUser = storedUser ? JSON.parse(storedUser) : {};
  
  // Update user data with new profile information
  const updatedUser = {
    ...currentUser,
    username: profileData.username || currentUser.username,
    email: profileData.email || currentUser.email,
    full_name: profileData.fullName || currentUser.full_name,
    bio: profileData.bio || currentUser.bio,
    headline: profileData.headline || currentUser.headline,
    profile_picture: profileData.profilePicture || currentUser.profile_picture,
    // Add social links if needed
  };
  
  // Store updated user data
  localStorage.setItem('mockUser', JSON.stringify(updatedUser));
  
  console.log('Profile updated:', updatedUser);
  
  return {
    user: updatedUser,
    message: 'Profile updated successfully'
  };
};

// Beat-related API methods
const getBeat = async (beatId: number) => {
  try {
    const { data } = await api.get(`/beats/${beatId}`);
    return { beat: data.beat as any };
  } catch (err) {
    // Fallback: derive from local mock if exists
    const local = localMockBeats.find(b => b.id === beatId);
    if (local) {
      return {
        beat: {
          id: local.id,
          title: local.title,
          description: local.description,
          genre: local.genre,
          bpm: local.bpm,
          key: local.key,
          price: local.price,
          preview_url: local.cover,
          full_beat_url: local.cover,
          thumbnail_url: local.cover,
          likes_count: local.likes,
          plays_count: local.plays,
          is_active: true,
          created_at: new Date().toISOString(),
          producer_name: local.producerUsername,
          producer_picture: undefined,
          is_liked: local.isLiked,
        }
      } as any;
    }
    throw err;
  }
};

// New: get beats list
const getBeats = async (params?: { page?: number; limit?: number; genre?: string; search?: string }) => {
  try {
    const { data } = await api.get('/beats', { params });
    return data;
  } catch (err) {
    // Fallback to local mock list
    return { beats: localMockBeats, pagination: { page: 1, limit: localMockBeats.length, total: localMockBeats.length, pages: 1 } };
  }
};

const getBeatComments = async (beatId: number) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Mock comments data
  const comments = [
    {
      id: 1,
      user_id: 2,
      beat_id: beatId,
      content: 'Amazing beat! Love the bass line.',
      created_at: '2024-01-20T15:30:00Z',
      username: 'MusicLover',
      profile_picture: 'https://via.placeholder.com/40'
    },
    {
      id: 2,
      user_id: 3,
      beat_id: beatId,
      content: 'Perfect for my next track!',
      created_at: '2024-01-19T12:15:00Z',
      username: 'Producer123',
      profile_picture: 'https://via.placeholder.com/40'
    }
  ];
  
  return { comments };
};

const likeBeat = async (beatId: number) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 200));
  
  return { success: true };
};

const addComment = async (beatId: number, content: string) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const comment = {
    id: Math.floor(Math.random() * 1000),
    user_id: 1,
    beat_id: beatId,
    content,
    created_at: new Date().toISOString(),
    username: 'CurrentUser',
    profile_picture: 'https://via.placeholder.com/40',
    is_producer: false,
    responses: []
  };
  
  return { comment };
};

const addCommentResponse = async (commentId: number, content: string) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const response = {
    id: Math.floor(Math.random() * 1000),
    comment_id: commentId,
    user_id: 1,
    content,
    created_at: new Date().toISOString(),
    username: 'CurrentUser',
    profile_picture: 'https://via.placeholder.com/40',
    is_producer: true
  };
  
  return { response };
};

const getCommentResponses = async (commentId: number) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Mock responses data
  const responses = [
    {
      id: 1,
      comment_id: commentId,
      user_id: 1,
      content: 'Thank you for the feedback! I\'m glad you liked the beat.',
      created_at: '2024-01-21T10:30:00Z',
      username: 'DJ ProBeat',
      profile_picture: 'https://via.placeholder.com/40',
      is_producer: true
    }
  ];
  
  return { responses };
};

// Feedback-related API methods
const getBeatFeedback = async (beatId: number) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Mock feedback data
  const feedback = [
    {
      id: 1,
      beat_id: beatId,
      user_id: 2,
      rating: 5,
      comment: 'Absolutely love this beat! The production quality is top-notch and the melody is catchy.',
      created_at: '2024-01-20T15:30:00Z',
      username: 'MusicLover',
      profile_picture: 'https://via.placeholder.com/40',
      is_verified: true
    },
    {
      id: 2,
      beat_id: beatId,
      user_id: 3,
      rating: 4,
      comment: 'Great beat, perfect for my style. Would definitely buy more from this producer.',
      created_at: '2024-01-19T12:15:00Z',
      username: 'Producer123',
      profile_picture: 'https://via.placeholder.com/40',
      is_verified: false
    },
    {
      id: 3,
      beat_id: beatId,
      user_id: 4,
      rating: 5,
      comment: 'Incredible work! The bass hits hard and the arrangement is perfect.',
      created_at: '2024-01-18T09:45:00Z',
      username: 'BeatMaker',
      profile_picture: 'https://via.placeholder.com/40',
      is_verified: true
    }
  ];
  
  return { feedback };
};

const getFeedbackStats = async (beatId: number) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 200));
  
  // Mock feedback stats
  const stats = {
    average_rating: 4.7,
    total_ratings: 3,
    rating_distribution: {
      1: 0,
      2: 0,
      3: 0,
      4: 1,
      5: 2
    }
  };
  
  return { stats };
};

const submitFeedback = async (beatId: number, rating: number, comment: string) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const feedback = {
    id: Math.floor(Math.random() * 1000),
    beat_id: beatId,
    user_id: 1,
    rating,
    comment,
    created_at: new Date().toISOString(),
    username: 'CurrentUser',
    profile_picture: 'https://via.placeholder.com/40',
    is_verified: false
  };
  
  return { feedback };
};

const updateFeedback = async (feedbackId: number, rating: number, comment: string) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const feedback = {
    id: feedbackId,
    beat_id: 1,
    user_id: 1,
    rating,
    comment,
    created_at: new Date().toISOString(),
    username: 'CurrentUser',
    profile_picture: 'https://via.placeholder.com/40',
    is_verified: false
  };
  
  return { feedback };
};

const deleteFeedback = async (feedbackId: number) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return { success: true };
};

// Admin API methods
const getAdminStats = async () => {
  try {
    const { data } = await api.get('/admin/stats');
    return data;
  } catch (err) {
    console.error('Get admin stats error:', err);
    throw err;
  }
};

const getAdminUsers = async (params?: { page?: number; limit?: number; search?: string; account_type?: string }) => {
  try {
    const { data } = await api.get('/admin/users', { params });
    return data;
  } catch (err) {
    console.error('Get admin users error:', err);
    throw err;
  }
};

const updateUserStatus = async (userId: string, updates: { account_type?: string; is_verified?: boolean }) => {
  try {
    const { data } = await api.put(`/admin/users/${userId}/status`, updates);
    return data;
  } catch (err) {
    console.error('Update user status error:', err);
    throw err;
  }
};

const getAdminBeats = async (params?: { page?: number; limit?: number; search?: string; producer_id?: string }) => {
  try {
    const { data } = await api.get('/admin/beats', { params });
    return data;
  } catch (err) {
    console.error('Get admin beats error:', err);
    throw err;
  }
};

const updateBeatStatus = async (beatId: string, is_active: boolean) => {
  try {
    const { data } = await api.put(`/admin/beats/${beatId}/status`, { is_active });
    return data;
  } catch (err) {
    console.error('Update beat status error:', err);
    throw err;
  }
};

const getAdminPurchases = async (params?: { page?: number; limit?: number; status?: string }) => {
  try {
    const { data } = await api.get('/admin/purchases', { params });
    return data;
  } catch (err) {
    console.error('Get admin purchases error:', err);
    throw err;
  }
};

const getAdminRevenue = async (period?: number) => {
  try {
    const { data } = await api.get('/admin/revenue', { params: { period } });
    return data;
  } catch (err) {
    console.error('Get admin revenue error:', err);
    throw err;
  }
};

const getTopProducers = async (limit?: number) => {
  try {
    const { data } = await api.get('/admin/top-producers', { params: { limit } });
    return data;
  } catch (err) {
    console.error('Get top producers error:', err);
    throw err;
  }
};

// Notifications API methods
const getNotifications = async (params?: { unread_only?: boolean; limit?: number }) => {
  try {
    const { data } = await api.get('/notifications', { params });
    return { notifications: data.notifications || [] };
  } catch (err) {
    console.error('Get notifications error:', err);
    return { notifications: [] };
  }
};

const getUnreadNotificationCount = async () => {
  try {
    const { data } = await api.get('/notifications/unread-count');
    return { unreadCount: data.unreadCount || 0 };
  } catch (err) {
    console.error('Get unread notification count error:', err);
    return { unreadCount: 0 };
  }
};

const markNotificationAsRead = async (notificationId: string) => {
  try {
    const { data } = await api.put(`/notifications/${notificationId}/read`);
    return data;
  } catch (err) {
    console.error('Mark notification as read error:', err);
    throw err;
  }
};

const markAllNotificationsAsRead = async () => {
  try {
    const { data } = await api.put('/notifications/read-all');
    return data;
  } catch (err) {
    console.error('Mark all notifications as read error:', err);
    throw err;
  }
};

const deleteNotification = async (notificationId: string) => {
  try {
    const { data } = await api.delete(`/notifications/${notificationId}`);
    return data;
  } catch (err) {
    console.error('Delete notification error:', err);
    throw err;
  }
};

// Messages API methods
const getConversations = async () => {
  try {
    const { data } = await api.get('/messages/conversations');
    return { conversations: data.conversations || [] };
  } catch (err) {
    console.error('Get conversations error:', err);
    return { conversations: [] };
  }
};

const getConversation = async (userId: string) => {
  try {
    const { data } = await api.get(`/messages/conversation/${userId}`);
    return { messages: data.messages || [] };
  } catch (err) {
    console.error('Get conversation error:', err);
    return { messages: [] };
  }
};

const sendMessage = async (recipientId: string, content: string) => {
  try {
    const { data } = await api.post('/messages/send', { recipientId, content });
    return data;
  } catch (err) {
    console.error('Send message error:', err);
    throw err;
  }
};

// Add all methods to the api object
const apiService = {
  ...api,
  getProfile,
  login,
  register,
  getBeats,
  uploadBeat,
  updateProfile,
  getBeat,
  getBeatComments,
  likeBeat,
  addComment,
  addCommentResponse,
  getCommentResponses,
  getBeatFeedback,
  getFeedbackStats,
  submitFeedback,
  updateFeedback,
  deleteFeedback,
  // Admin methods
  getAdminStats,
  getAdminUsers,
  updateUserStatus,
  getAdminBeats,
  updateBeatStatus,
  getAdminPurchases,
  getAdminRevenue,
  getTopProducers,
  // Messages methods
  getConversations,
  getConversation,
  sendMessage,
  // Notification methods
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification
};

export default apiService; 