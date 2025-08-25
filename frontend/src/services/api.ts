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

// Add all methods to the api object
const apiService = {
  ...api,
  getProfile,
  login,
  register,
  uploadBeat,
  updateProfile
};

export default apiService; 