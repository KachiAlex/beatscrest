import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, RegisterData, AuthContextType } from '../types';
import apiService from '../services/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Check if we have a user in localStorage from recent login
      const storedUser = localStorage.getItem('mockUser');
      let cachedUser: User | null = null;
      if (storedUser) {
        try {
          cachedUser = JSON.parse(storedUser);
          // Normalize account_type from cached user
          if (cachedUser) {
            const accountType = (cachedUser.account_type || (cachedUser as any).accountType || 'artist')?.toLowerCase() as 'admin' | 'producer' | 'artist';
            cachedUser = {
              ...cachedUser,
              account_type: accountType
            };
            // Set user immediately from localStorage to prevent flashing
            setUser(cachedUser);
          }
        } catch (e) {
          // Invalid JSON, ignore
        }
      }
      
      // Then fetch fresh data from API (but don't clear user if it fails)
      apiService.getProfile()
        .then((response) => {
          if (response.user) {
            // Normalize account_type to lowercase for consistency
            // Handle both account_type and accountType fields
            const accountType = (response.user.account_type || (response.user as any).accountType || cachedUser?.account_type || 'artist')?.toLowerCase() as 'admin' | 'producer' | 'artist';
            
            // Create normalized user, explicitly removing accountType field
            const { accountType: _, ...userWithoutAccountType } = response.user as any;
            const normalizedUser: User = {
              ...userWithoutAccountType,
              account_type: accountType
            } as User;
            
            // Only update if account_type changed or if we don't have a cached user
            // This prevents unnecessary re-renders
            const currentAccountType = cachedUser?.account_type?.toLowerCase();
            if (normalizedUser.account_type && normalizedUser.account_type !== currentAccountType) {
              setUser(normalizedUser);
              // Update localStorage with fresh data
              localStorage.setItem('mockUser', JSON.stringify(normalizedUser));
            } else if (!cachedUser && normalizedUser.account_type) {
              // Only set if we don't have cached user
              setUser(normalizedUser);
              localStorage.setItem('mockUser', JSON.stringify(normalizedUser));
            }
            // If account_type is the same, don't update state to prevent flashing
          } else if (cachedUser) {
            // Keep cached user if API didn't return user
            setUser(cachedUser);
          }
        })
        .catch((error) => {
          // Only clear user if it's a 401 (unauthorized), otherwise keep cached user
          if (error?.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('mockUser');
            setUser(null);
          } else if (cachedUser) {
            // Keep cached user on other errors
            setUser(cachedUser);
          }
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  // Note: Auto-redirect after login is handled in the login() function
  // This effect is kept minimal to avoid conflicts with explicit navigation

  const login = async (email: string, password: string) => {
    try {
      const response = await apiService.login({ email, password });
      if (response.user && response.token) {
        localStorage.setItem('token', response.token);
        
        // Normalize account_type to lowercase for consistency
        // Handle both account_type and accountType fields
        const accountType = (response.user.account_type || (response.user as any).accountType || 'artist')?.toLowerCase() as 'admin' | 'producer' | 'artist';
        
        // Create normalized user, explicitly removing accountType field
        const { accountType: _, ...userWithoutAccountType } = response.user as any;
        const normalizedUser: User = {
          ...userWithoutAccountType,
          account_type: accountType
        } as User;
        
        // Persist a copy for frontend-only fallbacks (profile, etc.)
        localStorage.setItem('mockUser', JSON.stringify(normalizedUser));
        setUser(normalizedUser);
        
        // Navigate based on account type after login
        if (accountType === 'admin') {
          navigate('/admin');
        } else if (accountType === 'producer') {
          navigate('/dashboard');
        } else if (accountType === 'artist') {
          navigate('/buyer');
        }
      } else {
        throw new Error('Login failed');
      }
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      const response = await apiService.register(userData);
      if (response.user && response.token) {
        localStorage.setItem('token', response.token);
        
        // Normalize account_type to lowercase for consistency
        // Handle both account_type and accountType fields
        const accountType = (response.user.account_type || (response.user as any).accountType || 'artist')?.toLowerCase() as 'admin' | 'producer' | 'artist';
        
        // Create normalized user, explicitly removing accountType field
        const { accountType: _, ...userWithoutAccountType } = response.user as any;
        const normalizedUser: User = {
          ...userWithoutAccountType,
          account_type: accountType
        } as User;
        
        // Persist a copy for frontend-only fallbacks (profile, etc.)
        localStorage.setItem('mockUser', JSON.stringify(normalizedUser));
        setUser(normalizedUser);
        
        // Navigation after signup is handled by the component that calls register()
        // (Landing.tsx or Navbar.tsx) to allow for custom routing logic
      } else {
        throw new Error('Registration failed');
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const response = await apiService.getProfile();
      if (response.user) {
        // Get current user to preserve account_type if API doesn't return it
        const currentUser = user;
        // Normalize account_type to lowercase for consistency
        // Handle both account_type and accountType fields
        const accountType = (response.user.account_type || (response.user as any).accountType || currentUser?.account_type || 'artist')?.toLowerCase() as 'admin' | 'producer' | 'artist';
        
        // Create normalized user, explicitly removing accountType field
        const { accountType: _, ...userWithoutAccountType } = response.user as any;
        const normalizedUser: User = {
          ...userWithoutAccountType,
          account_type: accountType
        } as User;
        
        // Only update if account_type actually changed to prevent flashing
        const currentAccountType = currentUser?.account_type?.toLowerCase();
        if (normalizedUser.account_type && normalizedUser.account_type !== currentAccountType) {
          setUser(normalizedUser);
          // Update localStorage with fresh data
          localStorage.setItem('mockUser', JSON.stringify(normalizedUser));
        } else if (!currentUser) {
          // Only set if we don't have current user
          setUser(normalizedUser);
          localStorage.setItem('mockUser', JSON.stringify(normalizedUser));
        }
        // If account_type is the same, don't update state to prevent flashing
      }
    } catch (error: any) {
      // Enhanced error logging with full details
      const errorInfo = {
        message: error?.message || 'Unknown error',
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        data: error?.response?.data,
        code: error?.code,
        url: error?.config?.url,
      };
      console.error('❌ Error refreshing user:', errorInfo);
      console.error('❌ Full error object:', error);
      console.error('❌ Error JSON:', JSON.stringify(errorInfo, null, 2));
      
      // Don't clear user on refresh error, keep existing state
      // Only clear if it's a 401 AND we don't have a cached user
      if (error?.response?.status === 401) {
        const cachedUser = localStorage.getItem('mockUser');
        if (!cachedUser) {
          // Only clear if no cached user exists
          console.warn('⚠️ Token expired and no cached user found. Clearing session.');
          localStorage.removeItem('token');
          setUser(null);
        } else {
          console.warn('⚠️ Token expired but using cached user data.');
        }
        // If we have cached user, keep it - token might be expired but user is still valid
      } else if (error?.code === 'ECONNREFUSED' || error?.message?.includes('Network Error')) {
        console.warn('⚠️ Backend server appears to be down. Using cached user data.');
      }
    }
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    refreshUser,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 