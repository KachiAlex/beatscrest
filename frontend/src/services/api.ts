import axios from 'axios';
import { User, Beat, Purchase, Comment, Message, Conversation, Notification, RegisterData, LoginData, ApiResponse, PaginatedResponse } from '../types';

// Simple API configuration
const api = axios.create({
  baseURL: 'https://beatscrest.onrender.com/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log('🚀 API Request:', config.method?.toUpperCase(), config.url);
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

// Mock functions for development
const getProfile = async () => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Get user data from localStorage (simulating stored user data)
  const storedUser = localStorage.getItem('mockUser');
  const userData = storedUser ? JSON.parse(storedUser) : {
    id: 1,
    username: 'demo_user',
    email: 'demo@example.com',
    full_name: 'Demo User',
    profile_picture: null,
    bio: '',
    headline: '',
    rating: 4.5,
    total_ratings: 12,
    account_type: 'producer' as const,
    is_verified: true,
    followers_count: 45,
    following_count: 23,
    created_at: new Date().toISOString()
  };
  
  return {
    user: userData
  };
};

const login = async (credentials: { email: string; password: string }) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Create user data from credentials
  const userData = {
    id: 1,
    username: credentials.email.split('@')[0], // Use email prefix as username
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
  };
  
  // Store user data in localStorage for persistence
  localStorage.setItem('mockUser', JSON.stringify(userData));
  
  return {
    user: userData,
    token: 'mock_jwt_token_' + Date.now()
  };
};

const register = async (userData: any) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Create user data from registration data
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
    account_type: userData.account_type || 'producer' as const,
    is_verified: false,
    followers_count: 0,
    following_count: 0,
    created_at: new Date().toISOString()
  };
  
  // Store user data in localStorage for persistence
  localStorage.setItem('mockUser', JSON.stringify(newUser));
  
  return {
    user: newUser,
    token: 'mock_jwt_token_' + Date.now()
  };
};

const uploadBeat = async (beatData: any) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Return mock response
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
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Mock beat data
  const beat = {
    id: beatId,
    producer_id: 1,
    title: 'Midnight Groove',
    description: 'A smooth hip-hop beat with heavy bass and melodic samples',
    genre: 'Hip Hop',
    bpm: 140,
    key: 'C',
    price: 45000,
    preview_url: 'https://example.com/preview.mp3',
    full_beat_url: 'https://example.com/full.mp3',
    thumbnail_url: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&auto=format&fit=crop',
    tags: ['hip-hop', 'bass', 'melodic'],
    likes_count: 45,
    plays_count: 120,
    is_active: true,
    created_at: '2024-01-15T10:00:00Z',
    producer_name: 'DJ ProBeat',
    producer_picture: 'https://via.placeholder.com/60',
    is_liked: false
  };
  
  return { beat };
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
    profile_picture: 'https://via.placeholder.com/40'
  };
  
  return { comment };
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

// Add all methods to the api object
const apiService = {
  ...api,
  getProfile,
  login,
  register,
  uploadBeat,
  updateProfile,
  getBeat,
  getBeatComments,
  likeBeat,
  addComment,
  getBeatFeedback,
  getFeedbackStats,
  submitFeedback,
  updateFeedback,
  deleteFeedback
};

export default apiService; 