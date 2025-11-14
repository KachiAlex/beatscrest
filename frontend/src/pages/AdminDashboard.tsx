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
  Eye
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

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [beats, setBeats] = useState<AdminBeat[]>([]);
  const [purchases, setPurchases] = useState<AdminPurchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);
  const [beatsLoading, setBeatsLoading] = useState(false);
  const [purchasesLoading, setPurchasesLoading] = useState(false);
  
  // Filters
  const [userSearch, setUserSearch] = useState('');
  const [userAccountType, setUserAccountType] = useState('');
  const [beatSearch, setBeatSearch] = useState('');
  const [purchaseStatus, setPurchaseStatus] = useState('');
  const [currentPage, setCurrentPage] = useState({ users: 1, beats: 1, purchases: 1 });
  const [pagination, setPagination] = useState({
    users: { total: 0, pages: 1 },
    beats: { total: 0, pages: 1 },
    purchases: { total: 0, pages: 1 }
  });

  // Redirect if not admin
  useEffect(() => {
    if (!authLoading && (!user || user.account_type !== 'admin')) {
      navigate('/');
    }
  }, [user, authLoading, navigate]);

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
      }
    }
  }, [activeTab, user, currentPage, userSearch, userAccountType, beatSearch, purchaseStatus]);

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

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || user.account_type !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-600 mt-1">Manage your platform</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{user.username}</span>
              <button
                onClick={() => navigate('/')}
                className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
              >
                Back to Site
              </button>
              <button
                onClick={logout}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'users', label: 'Users', icon: Users },
              { id: 'beats', label: 'Beats', icon: Music },
              { id: 'purchases', label: 'Purchases', icon: DollarSign }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`
                  flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm
                  ${activeTab === id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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
        <div className="mt-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && stats && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Users</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">{stats.userStats.total_users}</p>
                    </div>
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    <span className="text-green-600">+{stats.userStats.new_users_month} this month</span>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Beats</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">{stats.beatStats.total_beats}</p>
                    </div>
                    <Music className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    <span className="text-green-600">+{stats.beatStats.new_beats_month} this month</span>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Revenue</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(stats.salesStats.total_revenue)}</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    <span className="text-green-600">{formatCurrency(stats.salesStats.total_platform_fees)} fees</span>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Sales</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">{stats.salesStats.total_sales}</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-orange-600" />
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    <span className="text-green-600">+{stats.salesStats.sales_month} this month</span>
                  </div>
                </div>
              </div>

              {/* User Breakdown */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">User Breakdown</h2>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-gray-900">{stats.userStats.producers}</p>
                    <p className="text-sm text-gray-600 mt-1">Producers</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-gray-900">{stats.userStats.artists}</p>
                    <p className="text-sm text-gray-600 mt-1">Artists</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-gray-900">{stats.userStats.total_users - stats.userStats.producers - stats.userStats.artists}</p>
                    <p className="text-sm text-gray-600 mt-1">Fans</p>
                  </div>
                </div>
              </div>

              {/* Beat Stats */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Beat Statistics</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Average Price</p>
                    <p className="text-xl font-bold text-gray-900 mt-1">{formatCurrency(stats.beatStats.avg_price)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Likes</p>
                    <p className="text-xl font-bold text-gray-900 mt-1">{stats.beatStats.total_likes.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Plays</p>
                    <p className="text-xl font-bold text-gray-900 mt-1">{stats.beatStats.total_plays.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Avg Sale Amount</p>
                    <p className="text-xl font-bold text-gray-900 mt-1">{formatCurrency(stats.salesStats.avg_sale_amount)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="bg-white rounded-lg shadow">
              {/* Filters */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search users..."
                        value={userSearch}
                        onChange={(e) => {
                          setUserSearch(e.target.value);
                          setCurrentPage(prev => ({ ...prev, users: 1 }));
                        }}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <select
                    value={userAccountType}
                    onChange={(e) => {
                      setUserAccountType(e.target.value);
                      setCurrentPage(prev => ({ ...prev, users: 1 }));
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Followers</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {usersLoading ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 text-center">Loading...</td>
                      </tr>
                    ) : users.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 text-center text-gray-500">No users found</td>
                      </tr>
                    ) : (
                      users.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{user.username}</div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              user.account_type === 'producer' ? 'bg-purple-100 text-purple-800' :
                              user.account_type === 'artist' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {user.account_type}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.followers_count}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(user.created_at)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <select
                              value={user.account_type}
                              onChange={(e) => handleUpdateUserStatus(user.id, { account_type: e.target.value })}
                              className="px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500"
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
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                  <button
                    onClick={() => setCurrentPage(prev => ({ ...prev, users: Math.max(1, prev.users - 1) }))}
                    disabled={currentPage.users === 1}
                    className="px-4 py-2 text-sm border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-600">
                    Page {currentPage.users} of {pagination.users.pages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => ({ ...prev, users: Math.min(pagination.users.pages, prev.users + 1) }))}
                    disabled={currentPage.users === pagination.users.pages}
                    className="px-4 py-2 text-sm border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Beats Tab */}
          {activeTab === 'beats' && (
            <div className="bg-white rounded-lg shadow">
              {/* Filters */}
              <div className="p-4 border-b border-gray-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search beats..."
                    value={beatSearch}
                    onChange={(e) => {
                      setBeatSearch(e.target.value);
                      setCurrentPage(prev => ({ ...prev, beats: 1 }));
                    }}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Beats Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Beat</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Genre</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {beatsLoading ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 text-center">Loading...</td>
                      </tr>
                    ) : beats.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 text-center text-gray-500">No beats found</td>
                      </tr>
                    ) : (
                      beats.map((beat) => (
                        <tr key={beat.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">{beat.title}</div>
                            {beat.description && (
                              <div className="text-sm text-gray-500 truncate max-w-xs">{beat.description}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{beat.producer_name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{beat.genre || 'N/A'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{formatCurrency(beat.price)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(beat.created_at)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleUpdateBeatStatus(beat.id, true)}
                                className="text-green-600 hover:text-green-800"
                                title="Activate"
                              >
                                <CheckCircle className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => handleUpdateBeatStatus(beat.id, false)}
                                className="text-red-600 hover:text-red-800"
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
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                  <button
                    onClick={() => setCurrentPage(prev => ({ ...prev, beats: Math.max(1, prev.beats - 1) }))}
                    disabled={currentPage.beats === 1}
                    className="px-4 py-2 text-sm border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-600">
                    Page {currentPage.beats} of {pagination.beats.pages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => ({ ...prev, beats: Math.min(pagination.beats.pages, prev.beats + 1) }))}
                    disabled={currentPage.beats === pagination.beats.pages}
                    className="px-4 py-2 text-sm border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Purchases Tab */}
          {activeTab === 'purchases' && (
            <div className="bg-white rounded-lg shadow">
              {/* Filters */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex flex-col md:flex-row gap-4">
                  <select
                    value={purchaseStatus}
                    onChange={(e) => {
                      setPurchaseStatus(e.target.value);
                      setCurrentPage(prev => ({ ...prev, purchases: 1 }));
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Beat</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Buyer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {purchasesLoading ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 text-center">Loading...</td>
                      </tr>
                    ) : purchases.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 text-center text-gray-500">No purchases found</td>
                      </tr>
                    ) : (
                      purchases.map((purchase) => (
                        <tr key={purchase.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{purchase.beat_title}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{purchase.buyer_name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{purchase.producer_name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{formatCurrency(purchase.amount)}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              purchase.payment_status === 'completed' ? 'bg-green-100 text-green-800' :
                              purchase.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {purchase.payment_status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(purchase.created_at)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.purchases.pages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                  <button
                    onClick={() => setCurrentPage(prev => ({ ...prev, purchases: Math.max(1, prev.purchases - 1) }))}
                    disabled={currentPage.purchases === 1}
                    className="px-4 py-2 text-sm border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-600">
                    Page {currentPage.purchases} of {pagination.purchases.pages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => ({ ...prev, purchases: Math.min(pagination.purchases.pages, prev.purchases + 1) }))}
                    disabled={currentPage.purchases === pagination.purchases.pages}
                    className="px-4 py-2 text-sm border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
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
  );
}
