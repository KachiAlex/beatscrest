export interface User {
  id: number;
  username: string;
  email: string;
  full_name?: string;
  profile_picture?: string | null;
  bio?: string;
  headline?: string;
  rating?: number;
  total_ratings?: number;
  account_type: 'producer' | 'artist' | 'admin';
  is_verified: boolean;
  followers_count: number;
  following_count: number;
  created_at: string;
}

export interface Beat {
  id: number;
  producer_id: number;
  title: string;
  description?: string;
  genre?: string;
  bpm?: number;
  key?: string;
  price: number;
  preview_url: string;
  full_beat_url?: string;
  thumbnail_url?: string;
  tags?: string[];
  likes_count: number;
  plays_count: number;
  is_active: boolean;
  created_at: string;
  producer_name?: string;
  producer_picture?: string;
  is_liked?: boolean;
  average_rating?: number;
  total_ratings?: number;
  user_rating?: number;
}

export interface Purchase {
  id: number;
  buyer_id: number;
  beat_id: number;
  producer_id: number;
  amount: number;
  platform_fee: number;
  producer_amount: number;
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_method?: string;
  transaction_id?: string;
  download_link?: string;
  is_delivered: boolean;
  created_at: string;
  beat_title?: string;
  thumbnail_url?: string;
  producer_name?: string;
  buyer_name?: string;
}

export interface Comment {
  id: number;
  user_id: number;
  beat_id: number;
  content: string;
  created_at: string;
  username?: string;
  profile_picture?: string;
  is_producer?: boolean;
  responses?: CommentResponse[];
}

export interface CommentResponse {
  id: number;
  comment_id: number;
  user_id: number;
  content: string;
  created_at: string;
  username?: string;
  profile_picture?: string;
  is_producer?: boolean;
}

export interface Message {
  id: number;
  sender_id: number;
  recipient_id: number;
  content: string;
  is_read: boolean;
  created_at: string;
  username?: string;
  profile_picture?: string;
}

export interface Conversation {
  other_user_id: number;
  username: string;
  profile_picture?: string;
  last_message?: string;
  last_message_time?: string;
  unread_count: number;
}

export interface Notification {
  id: number;
  user_id: number;
  type: string;
  title: string;
  message: string;
  related_id?: number;
  is_read: boolean;
  created_at: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  loading: boolean;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  account_type?: 'producer' | 'artist';
}

export interface LoginData {
  email: string;
  password: string;
}

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface BeatFeedback {
  id: number;
  beat_id: number;
  user_id: number;
  rating: number;
  comment: string;
  created_at: string;
  username?: string;
  profile_picture?: string;
  is_verified?: boolean;
}

export interface FeedbackStats {
  average_rating: number;
  total_ratings: number;
  rating_distribution: {
    [key: number]: number;
  };
} 