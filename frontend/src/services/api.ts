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
  
  // Return mock user data
  return {
    user: {
      id: 1,
      username: 'demo_user',
      email: 'demo@example.com',
      full_name: 'Demo User',
      avatar_url: null,
      created_at: new Date().toISOString()
    }
  };
};

const login = async (credentials: { email: string; password: string }) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Return mock response
  return {
    user: {
      id: 1,
      username: 'demo_user',
      email: credentials.email,
      full_name: 'Demo User',
      avatar_url: null,
      created_at: new Date().toISOString()
    },
    token: 'mock_jwt_token_' + Date.now()
  };
};

const register = async (userData: any) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Return mock response
  return {
    user: {
      id: 1,
      username: userData.username || 'new_user',
      email: userData.email,
      full_name: userData.full_name || 'New User',
      avatar_url: null,
      created_at: new Date().toISOString()
    },
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

// Add all methods to the api object
const apiService = {
  ...api,
  getProfile,
  login,
  register,
  uploadBeat
};

export default apiService; 