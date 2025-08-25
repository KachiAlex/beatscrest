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

// Mock upload beat function for now
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

// Add uploadBeat to the api object
const apiService = {
  ...api,
  uploadBeat
};

export default apiService; 