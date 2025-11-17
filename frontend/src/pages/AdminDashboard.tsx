import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import { 
  BarChart3, 
  Users, 
  Music, 
  DollarSign, 
  TrendingUp, 
  Activity,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Ban,
  CheckCircle,
  XCircle,
  Eye,
  Shield,
  Building2,
  Plus,
  X as XIcon,
  UserPlus,
  UserMinus
} from 'lucide-react';

interface AdminStats {
  userStats: {
    total_users: number;
    producers: number;
    artists: number;
    new_users_week: number;
    new_users_month: number;
  };
  beatStats: {
    total_beats: number;
    new_beats_week: number;
    new_beats_month: number;
    avg_price: number;
    total_likes: number;
    total_plays: number;
  };
  salesStats: {
    total_sales: number;
    sales_week: number;
    sales_month: number;
    total_revenue: number;
    total_platform_fees: number;
    avg_sale_amount: number;
  };
  monthlyRevenue: Array<{
    date: string;
    daily_revenue: number;
    daily_fees: number;
    daily_sales: number;
  }>;
}

interface AdminUser {
  id: string;
  username: string;
  email: string;
  account_type: string;
  is_verified: boolean;
  followers_count: number;
  following_count: number;
  created_at: string;
}

interface AdminBeat {
  id: string;
  title: string;
  description?: string;
  genre?: string;
  price: number;
  producer_name: string;
  created_at: string;
}

interface AdminPurchase {
  id: string;
  beat_title: string;
  buyer_name: string;
  producer_name: string;
  amount: number;
  payment_status: string;
  created_at: string;
}

interface AdminTenant {
  id: string;
  name: string;
  domain?: string;
  description?: string;
  isActive: boolean;
  adminIds: string[];
  admins: Array<{ id: string; username: string; email: string }>;
  created_at: string;
  updated_at?: string;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading, logout, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [beats, setBeats] = useState<AdminBeat[]>([]);
  const [purchases, setPurchases] = useState<AdminPurchase[]>([]);
  const [tenants, setTenants] = useState<AdminTenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);
  const [beatsLoading, setBeatsLoading] = useState(false);
  const [purchasesLoading, setPurchasesLoading] = useState(false);
  const [tenantsLoading, setTenantsLoading] = useState(false);
  
  // Filters
  const [userSearch, setUserSearch] = useState('');
  const [userAccountType, setUserAccountType] = useState('');
  const [beatSearch, setBeatSearch] = useState('');
  const [purchaseStatus, setPurchaseStatus] = useState('');
  const [tenantSearch, setTenantSearch] = useState('');
  const [tenantStatus, setTenantStatus] = useState('');
  const [currentPage, setCurrentPage] = useState({ users: 1, beats: 1, purchases: 1, tenants: 1 });
  const [pagination, setPagination] = useState({
    users: { total: 0, pages: 1 },
    beats: { total: 0, pages: 1 },
    purchases: { total: 0, pages: 1 },
    tenants: { total: 0, pages: 1 }
  });
  
  // Tenant edit modal
  const [showTenantModal, setShowTenantModal] = useState(false);
  const [editingTenant, setEditingTenant] = useState<AdminTenant | null>(null);
  const [tenantFormData, setTenantFormData] = useState({
    name: '',
    domain: '',
    description: '',
    isActive: true
  });
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<AdminTenant | null>(null);
  const [adminSearchTerm, setAdminSearchTerm] = useState('');
  const [availableUsers, setAvailableUsers] = useState<AdminUser[]>([]);

  // Refresh user data on mount and check admin access
  useEffect(() => {
    const checkAccess = async () => {
      if (authLoading) return;
      
      setCheckingAccess(true);
      
      // Refresh user data to get latest account_type (in case user was promoted)
      try {
        await refreshUser();
        // Give React time to update state
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (err) {
        console.error('Error refreshing user:', err);
      }
      
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('❌ No token found, redirecting to home');
        navigate('/');
        setCheckingAccess(false);
        return;
      }
      
      setCheckingAccess(false);
    };
    
    checkAccess();
  }, [authLoading, refreshUser, navigate]);

  // Redirect if not admin (check after user data is loaded/refreshed)
  useEffect(() => {
    if (authLoading || checkingAccess) return; // Wait for checks to complete
    
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }
    
    if (!user) {
      // Still waiting for user data
      return;
    }
    
    // Check if user is admin (account_type is returned in lowercase from backend)
    const accountType = user.account_type?.toLowerCase();
    if (accountType !== 'admin') {
      console.log('❌ Access denied: User is not admin. Account type:', accountType);
      console.log('User object:', user);
      navigate('/');
      return;
    }
    
    console.log('✅ Admin access granted');
  }, [user, authLoading, checkingAccess, navigate]);

  // Load stats
  useEffect(() => {
    if (user?.account_type === 'admin') {
      loadStats();
    }
  }, [user]);

  // Load data based on active tab
  useEffect(() => {
    if (user?.account_type === 'admin') {
      if (activeTab === 'users') {
        loadUsers();
      } else if (activeTab === 'beats') {
        loadBeats();
      } else if (activeTab === 'purchases') {
        loadPurchases();
      } else if (activeTab === 'tenants') {
        loadTenants();
      }
    }
  }, [activeTab, user, currentPage, userSearch, userAccountType, beatSearch, purchaseStatus, tenantSearch, tenantStatus]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await apiService.getAdminStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      setUsersLoading(true);
      const params: any = {
        page: currentPage.users,
        limit: 20
      };
      if (userSearch) params.search = userSearch;
      if (userAccountType) params.account_type = userAccountType;
      
      const data = await apiService.getAdminUsers(params);
      setUsers(data.users || []);
      setPagination(prev => ({
        ...prev,
        users: data.pagination || { total: 0, pages: 1 }
      }));
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setUsersLoading(false);
    }
  };

  const loadBeats = async () => {
    try {
      setBeatsLoading(true);
      const params: any = {
        page: currentPage.beats,
        limit: 20
      };
      if (beatSearch) params.search = beatSearch;
      
      const data = await apiService.getAdminBeats(params);
      setBeats(data.beats || []);
      setPagination(prev => ({
        ...prev,
        beats: data.pagination || { total: 0, pages: 1 }
      }));
    } catch (error) {
      console.error('Failed to load beats:', error);
    } finally {
      setBeatsLoading(false);
    }
  };

  const loadPurchases = async () => {
    try {
      setPurchasesLoading(true);
      const params: any = {
        page: currentPage.purchases,
        limit: 20
      };
      if (purchaseStatus) params.status = purchaseStatus;
      
      const data = await apiService.getAdminPurchases(params);
      setPurchases(data.purchases || []);
      setPagination(prev => ({
        ...prev,
        purchases: data.pagination || { total: 0, pages: 1 }
      }));
    } catch (error) {
      console.error('Failed to load purchases:', error);
    } finally {
      setPurchasesLoading(false);
    }
  };

  const handleUpdateUserStatus = async (userId: string, updates: { account_type?: string }) => {
    try {
      await apiService.updateUserStatus(userId, updates);
      await loadUsers();
    } catch (error) {
      console.error('Failed to update user status:', error);
      alert('Failed to update user status');
    }
  };

  const handleUpdateBeatStatus = async (beatId: string, isActive: boolean) => {
    try {
      await apiService.updateBeatStatus(beatId, isActive);
      await loadBeats();
    } catch (error) {
      console.error('Failed to update beat status:', error);
      alert('Failed to update beat status');
    }
  };

  const loadTenants = async () => {
    try {
      setTenantsLoading(true);
      const params: any = {
        page: currentPage.tenants,
        limit: 20
      };
      if (tenantSearch) params.search = tenantSearch;
      if (tenantStatus) params.isActive = tenantStatus === 'active';
      
      const data = await apiService.getAdminTenants(params);
      setTenants(data.tenants || []);
      setPagination(prev => ({
        ...prev,
        tenants: data.pagination || { total: 0, pages: 1 }
      }));
    } catch (error) {
      console.error('Failed to load tenants:', error);
    } finally {
      setTenantsLoading(false);
    }
  };

  const handleOpenTenantModal = (tenant?: AdminTenant) => {
    if (tenant) {
      setEditingTenant(tenant);
      setTenantFormData({
        name: tenant.name,
        domain: tenant.domain || '',
        description: tenant.description || '',
        isActive: tenant.isActive
      });
    } else {
      setEditingTenant(null);
      setTenantFormData({
        name: '',
        domain: '',
        description: '',
        isActive: true
      });
    }
    setShowTenantModal(true);
  };

  const handleSaveTenant = async () => {
    try {
      if (editingTenant) {
        await apiService.updateTenant(editingTenant.id, tenantFormData);
      } else {
        await apiService.createTenant(tenantFormData);
      }
      setShowTenantModal(false);
      await loadTenants();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to save tenant');
    }
  };

  const handleDeleteTenant = async (tenantId: string) => {
    if (!confirm('Are you sure you want to deactivate this tenant?')) return;
    try {
      await apiService.deleteTenant(tenantId);
      await loadTenants();
    } catch (error) {
      console.error('Failed to delete tenant:', error);
      alert('Failed to delete tenant');
    }
  };

  const handleOpenAddAdminModal = async (tenant: AdminTenant) => {
    setSelectedTenant(tenant);
    try {
      const data = await apiService.getAdminUsers({ limit: 100 });
      setAvailableUsers(data.users || []);
      setAdminSearchTerm('');
      setShowAddAdminModal(true);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const handleAddTenantAdmin = async (userId: string) => {
    if (!selectedTenant) return;
    try {
      await apiService.addTenantAdmin(selectedTenant.id, userId);
      setShowAddAdminModal(false);
      await loadTenants();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to add tenant admin');
    }
  };

  const handleRemoveTenantAdmin = async (tenantId: string, userId: string) => {
    if (!confirm('Are you sure you want to remove this admin?')) return;
    try {
      await apiService.removeTenantAdmin(tenantId, userId);
      await loadTenants();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to remove tenant admin');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (authLoading || checkingAccess || loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">
            {authLoading || checkingAccess ? 'Checking access...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  // Access check is now handled in useEffect above
  // This return null is a fallback if somehow we get here without admin access
  if (!user || user.account_type?.toLowerCase() !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen pt-20">
      {/* Header */}
      <header className="glass border-b border-slate-200/50 sticky top-20 z-40">
        <div className="section-container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-xl bg-gradient-to-br from-red-500 to-orange-500">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-sm text-slate-300 mt-0.5">Manage your platform</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-white px-3 py-1.5 bg-slate-700 rounded-lg">{user.username}</span>
              <button
                onClick={() => navigate('/')}
                className="btn-secondary text-sm"
              >
                Back to Site
              </button>
              <button
                onClick={logout}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium shadow-lg"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="section-container py-6">
        <div className="card-elevated mb-8">
          <div className="border-b border-slate-200">
            <nav className="flex space-x-2 px-2 overflow-x-auto scrollbar-hide">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'users', label: 'Users', icon: Users },
                { id: 'beats', label: 'Beats', icon: Music },
                { id: 'purchases', label: 'Purchases', icon: DollarSign },
                { id: 'tenants', label: 'Tenants', icon: Building2 }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`
                    flex items-center gap-2 py-3 px-6 rounded-xl font-semibold text-sm whitespace-nowrap transition-all duration-300
                    ${activeTab === id
                      ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg scale-105'
                      : 'text-slate-300 hover:text-blue-300 hover:bg-blue-900/30'
                    }
                  `}
                >
                  <Icon className="h-5 w-5" />
                  <span>{label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Overview Tab */}
            {activeTab === 'overview' && stats && (
              <div className="space-y-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="card-elevated group hover:scale-105 transition-transform duration-300">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-300 font-medium mb-1">Total Users</p>
                        <p className="text-3xl font-bold text-white">{stats.userStats.total_users}</p>
                        <div className="mt-3 flex items-center text-sm">
                          <span className="text-green-600 font-semibold">+{stats.userStats.new_users_month} this month</span>
                        </div>
                      </div>
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Users className="h-7 w-7 text-white" />
                      </div>
                    </div>
                  </div>

                  <div className="card-elevated group hover:scale-105 transition-transform duration-300">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-300 font-medium mb-1">Total Beats</p>
                        <p className="text-3xl font-bold text-white">{stats.beatStats.total_beats}</p>
                        <div className="mt-3 flex items-center text-sm">
                          <span className="text-green-600 font-semibold">+{stats.beatStats.new_beats_month} this month</span>
                        </div>
                      </div>
                      <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Music className="h-7 w-7 text-white" />
                      </div>
                    </div>
                  </div>

                  <div className="card-elevated group hover:scale-105 transition-transform duration-300">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-300 font-medium mb-1">Total Revenue</p>
                        <p className="text-2xl font-bold gradient-text">{formatCurrency(stats.salesStats.total_revenue)}</p>
                        <div className="mt-3 flex items-center text-sm">
                          <span className="text-slate-300 font-semibold">{formatCurrency(stats.salesStats.total_platform_fees)} fees</span>
                        </div>
                      </div>
                      <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <DollarSign className="h-7 w-7 text-white" />
                      </div>
                    </div>
                  </div>

                  <div className="card-elevated group hover:scale-105 transition-transform duration-300">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-300 font-medium mb-1">Total Sales</p>
                        <p className="text-3xl font-bold text-white">{stats.salesStats.total_sales}</p>
                        <div className="mt-3 flex items-center text-sm">
                          <span className="text-green-600 font-semibold">+{stats.salesStats.sales_month} this month</span>
                        </div>
                      </div>
                      <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <TrendingUp className="h-7 w-7 text-white" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* User Breakdown */}
              <div className="bg-slate-800/50 rounded-lg shadow-lg border border-slate-700 p-6">
                <h2 className="text-lg font-semibold text-white mb-4">User Breakdown</h2>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-white">{stats.userStats.producers}</p>
                    <p className="text-sm text-slate-300 mt-1">Producers</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-white">{stats.userStats.artists}</p>
                    <p className="text-sm text-slate-300 mt-1">Artists</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-white">{stats.userStats.total_users - stats.userStats.producers - stats.userStats.artists}</p>
                    <p className="text-sm text-slate-300 mt-1">Fans</p>
                  </div>
                </div>
              </div>

              {/* Beat Stats */}
              <div className="bg-slate-800/50 rounded-lg shadow-lg border border-slate-700 p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Beat Statistics</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-slate-300">Average Price</p>
                    <p className="text-xl font-bold text-white mt-1">{formatCurrency(stats.beatStats.avg_price)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-300">Total Likes</p>
                    <p className="text-xl font-bold text-white mt-1">{stats.beatStats.total_likes.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-300">Total Plays</p>
                    <p className="text-xl font-bold text-white mt-1">{stats.beatStats.total_plays.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-300">Avg Sale Amount</p>
                    <p className="text-xl font-bold text-white mt-1">{formatCurrency(stats.salesStats.avg_sale_amount)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="bg-slate-800/50 rounded-lg shadow-lg border border-slate-700">
              {/* Filters */}
              <div className="p-4 border-b border-slate-700">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={userSearch}
                    onChange={(e) => {
                      setUserSearch(e.target.value);
                      setCurrentPage(prev => ({ ...prev, users: 1 }));
                    }}
                    className="w-full pl-10 pr-4 py-2 border border-slate-600 bg-slate-800 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-500"
                  />
                    </div>
                  </div>
                  <select
                    value={userAccountType}
                    onChange={(e) => {
                      setUserAccountType(e.target.value);
                      setCurrentPage(prev => ({ ...prev, users: 1 }));
                    }}
                    className="px-4 py-2 border border-slate-600 bg-slate-800 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Types</option>
                    <option value="producer">Producers</option>
                    <option value="artist">Artists</option>
                    <option value="fan">Fans</option>
                  </select>
                </div>
              </div>

              {/* Users Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Followers</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Joined</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-slate-800/30 divide-y divide-slate-700">
                    {usersLoading ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 text-center text-slate-300">Loading...</td>
                      </tr>
                    ) : users.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 text-center text-slate-400">No users found</td>
                      </tr>
                    ) : (
                      users.map((user) => (
                        <tr key={user.id} className="hover:bg-slate-700/50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-white">{user.username}</div>
                              <div className="text-sm text-slate-400">{user.email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              user.account_type === 'producer' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                              user.account_type === 'artist' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                              'bg-slate-600 text-slate-200 border border-slate-500'
                            }`}>
                              {user.account_type}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{user.followers_count}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">{formatDate(user.created_at)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <select
                              value={user.account_type}
                              onChange={(e) => handleUpdateUserStatus(user.id, { account_type: e.target.value })}
                              className="px-2 py-1 border border-slate-600 bg-slate-800 text-white rounded text-xs focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="producer">Producer</option>
                              <option value="artist">Artist</option>
                              <option value="fan">Fan</option>
                              <option value="admin">Admin</option>
                            </select>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.users.pages > 1 && (
                <div className="px-6 py-4 border-t border-slate-700 flex items-center justify-between">
                  <button
                    onClick={() => setCurrentPage(prev => ({ ...prev, users: Math.max(1, prev.users - 1) }))}
                    disabled={currentPage.users === 1}
                    className="px-4 py-2 text-sm border border-slate-600 bg-slate-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-slate-300">
                    Page {currentPage.users} of {pagination.users.pages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => ({ ...prev, users: Math.min(pagination.users.pages, prev.users + 1) }))}
                    disabled={currentPage.users === pagination.users.pages}
                    className="px-4 py-2 text-sm border border-slate-600 bg-slate-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Beats Tab */}
          {activeTab === 'beats' && (
            <div className="bg-slate-800/50 rounded-lg shadow-lg border border-slate-700">
              {/* Filters */}
              <div className="p-4 border-b border-slate-700">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search beats..."
                    value={beatSearch}
                    onChange={(e) => {
                      setBeatSearch(e.target.value);
                      setCurrentPage(prev => ({ ...prev, beats: 1 }));
                    }}
                    className="w-full pl-10 pr-4 py-2 border border-slate-600 bg-slate-800 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-500"
                  />
                </div>
              </div>

              {/* Beats Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Beat</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Producer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Genre</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Created</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-slate-800/30 divide-y divide-slate-700">
                    {beatsLoading ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 text-center text-slate-300">Loading...</td>
                      </tr>
                    ) : beats.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 text-center text-slate-400">No beats found</td>
                      </tr>
                    ) : (
                      beats.map((beat) => (
                        <tr key={beat.id} className="hover:bg-slate-700/50">
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-white">{beat.title}</div>
                            {beat.description && (
                              <div className="text-sm text-slate-400 truncate max-w-xs">{beat.description}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{beat.producer_name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">{beat.genre || 'N/A'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{formatCurrency(beat.price)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">{formatDate(beat.created_at)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleUpdateBeatStatus(beat.id, true)}
                                className="text-green-400 hover:text-green-300"
                                title="Activate"
                              >
                                <CheckCircle className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => handleUpdateBeatStatus(beat.id, false)}
                                className="text-red-400 hover:text-red-300"
                                title="Deactivate"
                              >
                                <XCircle className="h-5 w-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.beats.pages > 1 && (
                <div className="px-6 py-4 border-t border-slate-700 flex items-center justify-between">
                  <button
                    onClick={() => setCurrentPage(prev => ({ ...prev, beats: Math.max(1, prev.beats - 1) }))}
                    disabled={currentPage.beats === 1}
                    className="px-4 py-2 text-sm border border-slate-600 bg-slate-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-slate-300">
                    Page {currentPage.beats} of {pagination.beats.pages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => ({ ...prev, beats: Math.min(pagination.beats.pages, prev.beats + 1) }))}
                    disabled={currentPage.beats === pagination.beats.pages}
                    className="px-4 py-2 text-sm border border-slate-600 bg-slate-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Purchases Tab */}
          {activeTab === 'purchases' && (
            <div className="bg-slate-800/50 rounded-lg shadow-lg border border-slate-700">
              {/* Filters */}
              <div className="p-4 border-b border-slate-700">
                <div className="flex flex-col md:flex-row gap-4">
                  <select
                    value={purchaseStatus}
                    onChange={(e) => {
                      setPurchaseStatus(e.target.value);
                      setCurrentPage(prev => ({ ...prev, purchases: 1 }));
                    }}
                    className="px-4 py-2 border border-slate-600 bg-slate-800 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
              </div>

              {/* Purchases Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Beat</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Buyer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Producer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-slate-800/30 divide-y divide-slate-700">
                    {purchasesLoading ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 text-center text-slate-300">Loading...</td>
                      </tr>
                    ) : purchases.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 text-center text-slate-400">No purchases found</td>
                      </tr>
                    ) : (
                      purchases.map((purchase) => (
                        <tr key={purchase.id} className="hover:bg-slate-700/50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{purchase.beat_title}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{purchase.buyer_name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{purchase.producer_name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{formatCurrency(purchase.amount)}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${
                              purchase.payment_status === 'completed' ? 'bg-green-500/20 text-green-300 border-green-500/30' :
                              purchase.payment_status === 'pending' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' :
                              'bg-red-500/20 text-red-300 border-red-500/30'
                            }`}>
                              {purchase.payment_status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">{formatDate(purchase.created_at)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.purchases.pages > 1 && (
                <div className="px-6 py-4 border-t border-slate-700 flex items-center justify-between">
                  <button
                    onClick={() => setCurrentPage(prev => ({ ...prev, purchases: Math.max(1, prev.purchases - 1) }))}
                    disabled={currentPage.purchases === 1}
                    className="px-4 py-2 text-sm border border-slate-600 bg-slate-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-slate-300">
                    Page {currentPage.purchases} of {pagination.purchases.pages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => ({ ...prev, purchases: Math.min(pagination.purchases.pages, prev.purchases + 1) }))}
                    disabled={currentPage.purchases === pagination.purchases.pages}
                    className="px-4 py-2 text-sm border border-slate-600 bg-slate-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Tenants Tab */}
          {activeTab === 'tenants' && (
            <div className="glass-dark rounded-2xl border border-white/10">
              {/* Filters and Create Button */}
              <div className="p-4 border-b border-white/10 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex flex-1 gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/50" />
                    <input
                      type="text"
                      placeholder="Search tenants..."
                      value={tenantSearch}
                      onChange={(e) => {
                        setTenantSearch(e.target.value);
                        setCurrentPage(prev => ({ ...prev, tenants: 1 }));
                      }}
                      className="input-field pl-10"
                    />
                  </div>
                  <select
                    value={tenantStatus}
                    onChange={(e) => {
                      setTenantStatus(e.target.value);
                      setCurrentPage(prev => ({ ...prev, tenants: 1 }));
                    }}
                    className="input-field min-w-[150px]"
                  >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <button
                  onClick={() => handleOpenTenantModal()}
                  className="btn-primary flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Create Tenant
                </button>
              </div>

              {/* Tenants Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Domain</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Admins</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Created</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {tenantsLoading ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 text-center text-white/70">Loading...</td>
                      </tr>
                    ) : tenants.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 text-center text-white/70">No tenants found</td>
                      </tr>
                    ) : (
                      tenants.map((tenant) => (
                        <tr key={tenant.id} className="hover:bg-white/5">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-white">{tenant.name}</div>
                            {tenant.description && (
                              <div className="text-sm text-white/60 truncate max-w-xs">{tenant.description}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white/70">{tenant.domain || 'N/A'}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              tenant.isActive 
                                ? 'bg-green-500/20 text-green-300 border border-green-500/40' 
                                : 'bg-red-500/20 text-red-300 border border-red-500/40'
                            }`}>
                              {tenant.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-white/70">{tenant.admins.length} admin{tenant.admins.length !== 1 ? 's' : ''}</span>
                              {tenant.admins.slice(0, 3).map((admin, idx) => (
                                <div key={admin.id} className="w-6 h-6 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
                                  {admin.username.charAt(0).toUpperCase()}
                                </div>
                              ))}
                              {tenant.admins.length > 3 && (
                                <span className="text-xs text-white/50">+{tenant.admins.length - 3}</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white/60">{formatDate(tenant.created_at)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleOpenTenantModal(tenant)}
                                className="text-teal-400 hover:text-teal-300 transition-colors"
                                title="Edit"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleOpenAddAdminModal(tenant)}
                                className="text-blue-400 hover:text-blue-300 transition-colors"
                                title="Manage Admins"
                              >
                                <UserPlus className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteTenant(tenant.id)}
                                className="text-red-400 hover:text-red-300 transition-colors"
                                title="Deactivate"
                              >
                                <Ban className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.tenants.pages > 1 && (
                <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between">
                  <button
                    onClick={() => setCurrentPage(prev => ({ ...prev, tenants: Math.max(1, prev.tenants - 1) }))}
                    disabled={currentPage.tenants === 1}
                    className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-white/70">
                    Page {currentPage.tenants} of {pagination.tenants.pages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => ({ ...prev, tenants: Math.min(pagination.tenants.pages, prev.tenants + 1) }))}
                    disabled={currentPage.tenants === pagination.tenants.pages}
                    className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
          </div>
        </div>
      </div>

      {/* Tenant Edit Modal */}
      {showTenantModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="glass-dark rounded-2xl p-8 w-full max-w-md border border-white/10 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold gradient-text">
                {editingTenant ? 'Edit Tenant' : 'Create Tenant'}
              </h3>
              <button
                onClick={() => setShowTenantModal(false)}
                className="text-white/60 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-white/90 mb-2">Name *</label>
                <input
                  type="text"
                  value={tenantFormData.name}
                  onChange={(e) => setTenantFormData({ ...tenantFormData, name: e.target.value })}
                  className="input-field"
                  placeholder="Tenant name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-white/90 mb-2">Domain</label>
                <input
                  type="text"
                  value={tenantFormData.domain}
                  onChange={(e) => setTenantFormData({ ...tenantFormData, domain: e.target.value })}
                  className="input-field"
                  placeholder="example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-white/90 mb-2">Description</label>
                <textarea
                  value={tenantFormData.description}
                  onChange={(e) => setTenantFormData({ ...tenantFormData, description: e.target.value })}
                  className="input-field min-h-[100px]"
                  placeholder="Tenant description"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={tenantFormData.isActive}
                  onChange={(e) => setTenantFormData({ ...tenantFormData, isActive: e.target.checked })}
                  className="w-5 h-5 text-teal-500 border-2 border-white/30 rounded focus:ring-2 focus:ring-teal-500 bg-white/10"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-white/90">Active</label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowTenantModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveTenant}
                  disabled={!tenantFormData.name}
                  className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editingTenant ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Tenant Admin Modal */}
      {showAddAdminModal && selectedTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="glass-dark rounded-2xl p-8 w-full max-w-lg border border-white/10 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold gradient-text">
                Manage Admins - {selectedTenant.name}
              </h3>
              <button
                onClick={() => setShowAddAdminModal(false)}
                className="text-white/60 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Current Admins */}
              <div>
                <label className="block text-sm font-semibold text-white/90 mb-2">Current Admins</label>
                <div className="glass-dark rounded-xl p-4 border border-white/10 space-y-2 max-h-48 overflow-y-auto">
                  {selectedTenant.admins.length === 0 ? (
                    <p className="text-sm text-white/60">No admins assigned</p>
                  ) : (
                    selectedTenant.admins.map((admin) => (
                      <div key={admin.id} className="flex items-center justify-between p-2 hover:bg-white/5 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center text-white text-sm font-bold">
                            {admin.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-white">{admin.username}</div>
                            <div className="text-xs text-white/60">{admin.email}</div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveTenantAdmin(selectedTenant.id, admin.id)}
                          className="text-red-400 hover:text-red-300 transition-colors p-1"
                          title="Remove Admin"
                        >
                          <UserMinus className="h-4 w-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Add New Admin */}
              <div>
                <label className="block text-sm font-semibold text-white/90 mb-2">Add Admin</label>
                <div className="relative mb-2">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/50" />
                  <input
                    type="text"
                    value={adminSearchTerm}
                    onChange={(e) => setAdminSearchTerm(e.target.value)}
                    className="input-field pl-10"
                    placeholder="Search users..."
                  />
                </div>
                <div className="glass-dark rounded-xl p-4 border border-white/10 space-y-2 max-h-64 overflow-y-auto">
                  {availableUsers
                    .filter(user => 
                      !selectedTenant.adminIds.includes(user.id) &&
                      (user.username.toLowerCase().includes(adminSearchTerm.toLowerCase()) ||
                       user.email.toLowerCase().includes(adminSearchTerm.toLowerCase()))
                    )
                    .slice(0, 10)
                    .map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-2 hover:bg-white/5 rounded-lg cursor-pointer"
                        onClick={() => handleAddTenantAdmin(user.id)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-teal-500 flex items-center justify-center text-white text-sm font-bold">
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-white">{user.username}</div>
                            <div className="text-xs text-white/60">{user.email}</div>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddTenantAdmin(user.id);
                          }}
                          className="text-teal-400 hover:text-teal-300 transition-colors p-1"
                          title="Add as Admin"
                        >
                          <UserPlus className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  {availableUsers.filter(user => 
                    !selectedTenant.adminIds.includes(user.id) &&
                    (user.username.toLowerCase().includes(adminSearchTerm.toLowerCase()) ||
                     user.email.toLowerCase().includes(adminSearchTerm.toLowerCase()))
                  ).length === 0 && (
                    <p className="text-sm text-white/60">No users found</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={() => setShowAddAdminModal(false)}
                  className="btn-secondary"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
