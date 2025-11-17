import axios from 'axios';
import { User, Beat, Purchase, Comment, Message, Conversation, Notification, RegisterData, LoginData, ApiResponse, PaginatedResponse } from '../types';

// Simple API configuration - Use Firebase Functions in production
// Firebase Function URL: https://us-central1-beatcrest.cloudfunctions.net/api
// Firebase Hosting rewrite will handle /api/** to the function at beatcrest.web.app
// Always use /api - Firebase Hosting rewrite routes to Firebase Functions
// This ensures same-origin requests and proper routing
const baseURL = import.meta.env.DEV ? '/api' : '/api';
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
    if (import.meta.env.DEV) {
      console.log('🚀 API Request:', config.method?.toUpperCase(), config.url);
      
      // Log request data for login/register (without password)
      if (config.url?.includes('/auth/login') || config.url?.includes('/auth/register')) {
        try {
          const data = typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
          const safeData = { ...data };
          if (safeData.password) {
            safeData.password = '***hidden***';
          }
          console.log('🚀 Request payload:', safeData);
        } catch (e) {
          // Ignore parsing errors
        }
      }
    }
    // Attach auth token if present
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = config.headers || {};
      (config.headers as any)['Authorization'] = `Bearer ${token}`;
      if (import.meta.env.DEV) {
        console.log('🔑 Auth token attached:', token.substring(0, 20) + '...');
      }
    }
    return config;
  },
  (error) => {
    if (import.meta.env.DEV) {
      console.error('❌ API Request Error:', error);
    }
    return Promise.reject(error);
  }
);

// Response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
    console.log('✅ API Response:', response.status, response.config.url);
    }
    return response;
  },
  (error) => {
    // Enhanced error logging with full details
    if (import.meta.env.DEV || error.response?.status !== 404) {
      const errorDetails = {
        status: error.response?.status,
        statusText: error.response?.statusText,
        url: error.config?.url,
        method: error.config?.method?.toUpperCase(),
        message: error.message,
        code: error.code,
        responseData: error.response?.data,
        requestData: error.config?.data,
      };
      
      // Log error details in multiple ways to ensure visibility
      console.error('❌ API Response Error:', errorDetails);
      console.error('❌ Full Error Object:', error);
      console.error('❌ Error Details (JSON):', JSON.stringify(errorDetails, null, 2));
      
      // Check for common issues
      if (error.code === 'ECONNREFUSED' || error.message?.includes('Network Error')) {
        console.error('⚠️ Backend server appears to be down. Make sure the backend is running on port 5000.');
        console.error('⚠️ Check: Is the backend server running? Try: cd backend && npm start');
      } else if (error.response?.status === 401) {
        console.error('⚠️ Authentication failed. Token may be expired or invalid.');
        console.error('⚠️ Response data:', error.response?.data);
        const token = localStorage.getItem('token');
        console.error('⚠️ Current token exists:', !!token);
        if (token) {
          console.error('⚠️ Token preview:', token.substring(0, 20) + '...');
        }
      } else if (error.response?.status === 500) {
        console.error('⚠️ Server error (500). Check backend logs for details.');
        console.error('⚠️ URL that failed:', error.config?.url);
        if (error.response?.data) {
          console.error('⚠️ Server error response:', JSON.stringify(error.response.data, null, 2));
        }
      }
    }
    return Promise.reject(error);
  }
);

// Get user profile from backend
const getProfile = async () => {
  try {
    const res = await api.get('/auth/me');
    return { user: res.data.user as User };
  } catch (err) {
    // Check localStorage for cached user data (from previous login)
    const storedUser = localStorage.getItem('mockUser');
    if (storedUser) {
      return { user: JSON.parse(storedUser) as User };
    }
    throw err;
  }
};

const login = async (credentials: { email: string; password: string }) => {
  try {
    // Log login attempt (without password)
    console.log('🔐 Attempting login for:', credentials.email);
    console.log('🔐 Login request URL:', '/auth/login');
    
    const { data } = await api.post('/auth/login', credentials);
    
    console.log('✅ Login successful');
    console.log('✅ Received user:', data.user?.email || data.user?.username);
    console.log('✅ Token received:', !!data.token);
    
    return { user: data.user as User, token: data.token as string };
  } catch (err: any) {
    // Enhanced error logging for login
    const errorInfo = {
      message: err?.message || 'Unknown error',
      status: err?.response?.status,
      statusText: err?.response?.statusText,
      data: err?.response?.data,
      url: err?.config?.url,
      email: credentials.email, // Safe to log email
    };
    
    console.error('❌ Login failed:', errorInfo);
    console.error('❌ Full error object:', err);
    console.error('❌ Error JSON:', JSON.stringify(errorInfo, null, 2));
    
    // Log server response details
    if (err?.response?.data) {
      console.error('❌ Server response:', JSON.stringify(err.response.data, null, 2));
      console.error('❌ Server error message:', err.response.data?.error || err.response.data?.message);
    }
    
    // Check specific error cases
    if (err?.response?.status === 401) {
      console.error('⚠️ Login authentication failed. Possible reasons:');
      console.error('   - Email or password is incorrect');
      console.error('   - User does not exist');
      console.error('   - Account is disabled');
      console.error('   - Backend authentication logic issue');
    }
    
    throw err;
  }
};

const register = async (userData: any) => {
  try {
    const { data } = await api.post('/auth/register', userData);
    return { user: data.user as User, token: data.token as string };
  } catch (err) {
    throw err;
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
    throw err;
  }
};

// New: get beats list
const getBeats = async (params?: { page?: number; limit?: number; genre?: string; search?: string }) => {
  try {
    const { data } = await api.get('/beats', { params });
    return data;
  } catch (err: any) {
    throw err;
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

// User profile API methods
const getUserProfile = async (username: string) => {
  try {
    const { data } = await api.get(`/users/profile/${username}`);
    return data;
  } catch (err) {
    // Dev-only fallback: build a minimal profile from local mock user if available
    if (import.meta.env.DEV) {
      const storedUser = localStorage.getItem('mockUser');
      if (storedUser) {
        const mock = JSON.parse(storedUser) as User;
        return {
          user: {
            ...mock,
            username: username || mock.username,
            profile_picture: mock.profile_picture ?? null,
            followers_count: mock.followers_count ?? 0,
            following_count: mock.following_count ?? 0,
            bio: mock.bio ?? '',
          },
        };
      }
    }
    console.error('Get user profile error:', err);
    throw err;
  }
};

const getUserBeats = async (
  username: string,
  params?: { page?: number; limit?: number }
) => {
  try {
    const { data } = await api.get(`/users/${username}/beats`, { params });
    return data;
  } catch (err: any) {
    // Enhanced error logging with full details
    const errorInfo = {
      message: err?.message || 'Unknown error',
      status: err?.response?.status,
      statusText: err?.response?.statusText,
      data: err?.response?.data,
      url: err?.config?.url,
      code: err?.code,
    };
    
    console.error('❌ Get user beats error:', errorInfo);
    console.error('❌ Full error object:', err);
    console.error('❌ Error JSON:', JSON.stringify(errorInfo, null, 2));
    
    if (err?.response?.status === 500) {
      console.error('⚠️ Server returned 500 error for getUserBeats');
      console.error('⚠️ Username requested:', username);
      console.error('⚠️ Server response:', err?.response?.data);
    }
    
    throw err;
  }
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

// Tenant API methods
const getAdminTenants = async (params?: { page?: number; limit?: number; search?: string; isActive?: boolean }) => {
  try {
    const { data } = await api.get('/admin/tenants', { params });
    return data;
  } catch (err) {
    console.error('Get admin tenants error:', err);
    throw err;
  }
};

const createTenant = async (tenantData: { name: string; domain?: string; description?: string; adminIds?: string[]; isActive?: boolean }) => {
  try {
    const { data } = await api.post('/admin/tenants', tenantData);
    return data;
  } catch (err) {
    console.error('Create tenant error:', err);
    throw err;
  }
};

const updateTenant = async (tenantId: string, updates: { name?: string; domain?: string; description?: string; isActive?: boolean }) => {
  try {
    const { data } = await api.put(`/admin/tenants/${tenantId}`, updates);
    return data;
  } catch (err) {
    console.error('Update tenant error:', err);
    throw err;
  }
};

const addTenantAdmin = async (tenantId: string, userId: string) => {
  try {
    const { data } = await api.post(`/admin/tenants/${tenantId}/admins`, { userId });
    return data;
  } catch (err) {
    console.error('Add tenant admin error:', err);
    throw err;
  }
};

const removeTenantAdmin = async (tenantId: string, userId: string) => {
  try {
    const { data } = await api.delete(`/admin/tenants/${tenantId}/admins/${userId}`);
    return data;
  } catch (err) {
    console.error('Remove tenant admin error:', err);
    throw err;
  }
};

const deleteTenant = async (tenantId: string) => {
  try {
    const { data } = await api.delete(`/admin/tenants/${tenantId}`);
    return data;
  } catch (err) {
    console.error('Delete tenant error:', err);
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

// License API methods
const getLicense = async (purchaseId: string) => {
  try {
    const { data } = await api.get(`/payments/license/${purchaseId}`);
    return data;
  } catch (err) {
    console.error('Get license error:', err);
    throw err;
  }
};

// Add all methods to the api object
const apiService = {
  ...api,
  getProfile,
  login,
  register,
  getUserProfile,
  getUserBeats,
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
  // Tenant methods
  getAdminTenants,
  createTenant,
  updateTenant,
  addTenantAdmin,
  removeTenantAdmin,
  deleteTenant,
  // Messages methods
  getConversations,
  getConversation,
  sendMessage,
  // Notification methods
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  // License methods
  getLicense
};

export default apiService; 