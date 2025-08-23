import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { User, Beat, Purchase, Comment, Message, Conversation, Notification, RegisterData, LoginData, ApiResponse, PaginatedResponse } from '../types';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    const apiUrl = 'https://beatcrest-backend.onrender.com/api';
    console.log('🔗 API URL:', apiUrl);
    
    this.api = axios.create({
      baseURL: apiUrl,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor to handle errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async register(userData: RegisterData): Promise<ApiResponse<{ user: User; token: string }>> {
    const response: AxiosResponse = await this.api.post('/auth/register', userData);
    return response.data;
  }

  async login(loginData: LoginData): Promise<ApiResponse<{ user: User; token: string }>> {
    const response: AxiosResponse = await this.api.post('/auth/login', loginData);
    return response.data;
  }

  async getProfile(): Promise<ApiResponse<{ user: User }>> {
    const response: AxiosResponse = await this.api.get('/auth/me');
    return response.data;
  }

  async updateProfile(profileData: Partial<User>): Promise<ApiResponse<{ user: User }>> {
    const response: AxiosResponse = await this.api.put('/auth/profile', profileData);
    return response.data;
  }

  // Beats endpoints
  async getBeats(params?: {
    page?: number;
    limit?: number;
    genre?: string;
    minPrice?: number;
    maxPrice?: number;
    bpm?: number;
    search?: string;
    producer_id?: number;
  }): Promise<PaginatedResponse<Beat>> {
    const response: AxiosResponse = await this.api.get('/beats', { params });
    return response.data;
  }

  async getBeat(id: number): Promise<ApiResponse<{ beat: Beat }>> {
    const response: AxiosResponse = await this.api.get(`/beats/${id}`);
    return response.data;
  }

  async uploadBeat(formData: FormData): Promise<ApiResponse<{ beat: Beat }>> {
    const response: AxiosResponse = await this.api.post('/beats/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async updateBeat(id: number, beatData: Partial<Beat>): Promise<ApiResponse<{ beat: Beat }>> {
    const response: AxiosResponse = await this.api.put(`/beats/${id}`, beatData);
    return response.data;
  }

  async deleteBeat(id: number): Promise<ApiResponse<{ message: string }>> {
    const response: AxiosResponse = await this.api.delete(`/beats/${id}`);
    return response.data;
  }

  async likeBeat(id: number): Promise<ApiResponse<{ liked: boolean }>> {
    const response: AxiosResponse = await this.api.post(`/beats/${id}/like`);
    return response.data;
  }

  async getBeatComments(id: number, params?: { page?: number; limit?: number }): Promise<ApiResponse<{ comments: Comment[] }>> {
    const response: AxiosResponse = await this.api.get(`/beats/${id}/comments`, { params });
    return response.data;
  }

  async addComment(beatId: number, content: string): Promise<ApiResponse<{ comment: Comment }>> {
    const response: AxiosResponse = await this.api.post(`/beats/${beatId}/comments`, { content });
    return response.data;
  }

  // User endpoints
  async getUserProfile(username: string): Promise<ApiResponse<{ user: User }>> {
    const response: AxiosResponse = await this.api.get(`/users/profile/${username}`);
    return response.data;
  }

  async getUserBeats(username: string, params?: { page?: number; limit?: number }): Promise<PaginatedResponse<Beat>> {
    const response: AxiosResponse = await this.api.get(`/users/${username}/beats`, { params });
    return response.data;
  }

  async followUser(username: string): Promise<ApiResponse<{ following: boolean }>> {
    const response: AxiosResponse = await this.api.post(`/users/${username}/follow`);
    return response.data;
  }

  async getFollowers(username: string, params?: { page?: number; limit?: number }): Promise<PaginatedResponse<User>> {
    const response: AxiosResponse = await this.api.get(`/users/${username}/followers`, { params });
    return response.data;
  }

  async getFollowing(username: string, params?: { page?: number; limit?: number }): Promise<PaginatedResponse<User>> {
    const response: AxiosResponse = await this.api.get(`/users/${username}/following`, { params });
    return response.data;
  }

  async searchUsers(query: string, params?: { page?: number; limit?: number }): Promise<PaginatedResponse<User>> {
    const response: AxiosResponse = await this.api.get('/users/search', { params: { q: query, ...params } });
    return response.data;
  }

  async getTrendingProducers(limit?: number): Promise<ApiResponse<{ producers: User[] }>> {
    const response: AxiosResponse = await this.api.get('/users/trending/producers', { params: { limit } });
    return response.data;
  }

  // Payment endpoints
  async createPaymentIntent(beatId: number): Promise<ApiResponse<{
    clientSecret: string;
    amount: number;
    platformFee: number;
    producerAmount: number;
  }>> {
    const response: AxiosResponse = await this.api.post('/payments/create-payment-intent', { beatId });
    return response.data;
  }

  async confirmPayment(paymentIntentId: string, beatId: number): Promise<ApiResponse<{ purchase: Purchase }>> {
    const response: AxiosResponse = await this.api.post('/payments/confirm-payment', { paymentIntentId, beatId });
    return response.data;
  }

  async getPurchases(params?: { page?: number; limit?: number }): Promise<PaginatedResponse<Purchase>> {
    const response: AxiosResponse = await this.api.get('/payments/purchases', { params });
    return response.data;
  }

  async getSales(params?: { page?: number; limit?: number }): Promise<PaginatedResponse<Purchase>> {
    const response: AxiosResponse = await this.api.get('/payments/sales', { params });
    return response.data;
  }

  async getPurchaseDetails(id: number): Promise<ApiResponse<{ purchase: Purchase }>> {
    const response: AxiosResponse = await this.api.get(`/payments/purchases/${id}`);
    return response.data;
  }

  async regenerateDownloadLink(id: number): Promise<ApiResponse<{ downloadLink: string }>> {
    const response: AxiosResponse = await this.api.post(`/payments/purchases/${id}/regenerate-link`);
    return response.data;
  }

  // Messaging endpoints
  async getConversations(): Promise<ApiResponse<{ conversations: Conversation[] }>> {
    const response: AxiosResponse = await this.api.get('/messages/conversations');
    return response.data;
  }

  async getMessages(userId: number, params?: { page?: number; limit?: number }): Promise<ApiResponse<{ messages: Message[] }>> {
    const response: AxiosResponse = await this.api.get(`/messages/conversation/${userId}`, { params });
    return response.data;
  }

  async sendMessage(recipientId: number, content: string): Promise<ApiResponse<{ data: Message }>> {
    const response: AxiosResponse = await this.api.post('/messages/send', { recipientId, content });
    return response.data;
  }

  async markConversationAsRead(userId: number): Promise<ApiResponse<{ message: string }>> {
    const response: AxiosResponse = await this.api.put(`/messages/conversation/${userId}/read`);
    return response.data;
  }

  async getUnreadCount(): Promise<ApiResponse<{ unreadCount: number }>> {
    const response: AxiosResponse = await this.api.get('/messages/unread-count');
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService; 