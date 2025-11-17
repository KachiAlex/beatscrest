import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLogo from '../components/AppLogo';
import SimpleLogo from '../components/SimpleLogo';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';

interface Beat {
  id: string;
  title: string;
  description: string;
  genre: string;
  bpm: number;
  price: number;
  status: 'draft' | 'published' | 'archived';
  uploadDate: string;
  previewUrl: string;
  sales: number;
  earnings: number;
}

interface Order {
  id: string;
  beatTitle: string;
  buyerName: string;
  amount: number;
  status: 'pending' | 'delivered' | 'cancelled';
  orderDate: string;
  deliveryDate?: string;
}

interface Transaction {
  id: string;
  type: 'sale' | 'refund' | 'withdrawal';
  amount: number;
  description: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
}

export default function ProducerDashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading, logout, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedBeat, setSelectedBeat] = useState<Beat | null>(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [profileData, setProfileData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    fullName: user?.full_name || '',
    bio: user?.bio || '',
    headline: user?.headline || '',
    profilePicture: user?.profile_picture || '',
    socialLinks: {
      instagram: '',
      twitter: '',
      youtube: '',
      soundcloud: ''
    }
  });

  // Update profile data when user changes
  useEffect(() => {
    if (user) {
      setProfileData({
        username: user.username || '',
        email: user.email || '',
        fullName: user.full_name || '',
        bio: user.bio || '',
        headline: user.headline || '',
        profilePicture: user.profile_picture || '',
        socialLinks: {
          instagram: '',
          twitter: '',
          youtube: '',
          soundcloud: ''
        }
      });
    }
  }, [user]);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [selectedProfileImage, setSelectedProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string>('');

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/');
    }
  }, [user, authLoading, navigate]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.profile-dropdown')) {
        setShowProfileDropdown(false);
      }
    };

    if (showProfileDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileDropdown]);

  // Handle profile picture upload
  const handleProfileImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }

      setSelectedProfileImage(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle profile save
  const handleProfileSave = async () => {
    setProfileLoading(true);
    try {
      // If there's a new profile image, convert it to base64 and include it
      let updatedProfileData = { ...profileData };
      
      if (selectedProfileImage) {
        const reader = new FileReader();
        const imagePromise = new Promise((resolve) => {
          reader.onload = (e) => {
            const base64Image = e.target?.result as string;
            updatedProfileData.profilePicture = base64Image;
            resolve(base64Image);
          };
        });
        reader.readAsDataURL(selectedProfileImage);
        await imagePromise;
      }
      
      // Call the API to update profile
      const response = await apiService.updateProfile(updatedProfileData);
      
      // Refresh the user context with updated data
      await refreshUser();
      
      setIsEditingProfile(false);
      setSelectedProfileImage(null);
      setProfileImagePreview('');
      
      // Show success message
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setProfileLoading(false);
    }
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-300">Loading...</p>
        </div>
      </div>
    );
  }

  // Show message if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-300">Please sign in to access the dashboard.</p>
        </div>
      </div>
    );
  }

  // Mock data
  const beats: Beat[] = [
    {
      id: '1',
      title: 'Midnight Groove',
      description: 'Smooth hip-hop beat with heavy bass and melodic samples',
      genre: 'Hip Hop',
      bpm: 140,
      price: 45000,
      status: 'published',
      uploadDate: '2024-01-15',
      previewUrl: '/previews/midnight-groove.mp4',
      sales: 12,
      earnings: 540000
    },
    {
      id: '2',
      title: 'Afro Vibes',
      description: 'Upbeat afrobeats instrumental with traditional African rhythms',
      genre: 'Afrobeats',
      bpm: 120,
      price: 35000,
      status: 'published',
      uploadDate: '2024-01-10',
      previewUrl: '/previews/afro-vibes.mp4',
      sales: 8,
      earnings: 280000
    },
    {
      id: '3',
      title: 'R&B Soul',
      description: 'Emotional R&B beat with soulful melodies and smooth chords',
      genre: 'R&B',
      bpm: 90,
      price: 55000,
      status: 'draft',
      uploadDate: '2024-01-20',
      previewUrl: '/previews/rnb-soul.mp4',
      sales: 0,
      earnings: 0
    }
  ];

  const orders: Order[] = [
    {
      id: 'ORD001',
      beatTitle: 'Midnight Groove',
      buyerName: 'John Doe',
      amount: 45000,
      status: 'delivered',
      orderDate: '2024-01-25',
      deliveryDate: '2024-01-25'
    },
    {
      id: 'ORD002',
      beatTitle: 'Afro Vibes',
      buyerName: 'Jane Smith',
      amount: 35000,
      status: 'pending',
      orderDate: '2024-01-26'
    },
    {
      id: 'ORD003',
      beatTitle: 'Midnight Groove',
      buyerName: 'Mike Johnson',
      amount: 45000,
      status: 'delivered',
      orderDate: '2024-01-24',
      deliveryDate: '2024-01-24'
    }
  ];

  const transactions: Transaction[] = [
    {
      id: 'TXN001',
      type: 'sale',
      amount: 45000,
      description: 'Sale: Midnight Groove',
      date: '2024-01-25',
      status: 'completed'
    },
    {
      id: 'TXN002',
      type: 'sale',
      amount: 35000,
      description: 'Sale: Afro Vibes',
      date: '2024-01-24',
      status: 'completed'
    },
    {
      id: 'TXN003',
      type: 'withdrawal',
      amount: -100000,
      description: 'Withdrawal to bank account',
      date: '2024-01-20',
      status: 'completed'
    }
  ];

  const analytics = {
    totalBeats: beats.length,
    totalSales: orders.filter(o => o.status === 'delivered').length,
    totalEarnings: beats.reduce((sum, beat) => sum + beat.earnings, 0),
    pendingOrders: orders.filter(o => o.status === 'pending').length,
    monthlyGrowth: 15.5,
    topPerformingBeat: beats.reduce((top, beat) => beat.sales > top.sales ? beat : top, beats[0])
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'beats', label: 'My Beats', icon: '🎵' },
    { id: 'orders', label: 'Orders', icon: '📦' },
    { id: 'transactions', label: 'Transactions', icon: '💰' },
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'certificates', label: 'Certificates', icon: '🏆' },
    { id: 'analytics', label: 'Analytics', icon: '📈' }
  ];

  return (
    <div className="min-h-screen pt-20">
      {/* Header */}
      <header className="glass border-b border-slate-200/50 sticky top-20 z-40">
        <div className="section-container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-teal-500">
                <span className="text-white text-xl">🎵</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Producer Dashboard</h1>
                <p className="text-sm text-slate-300">Manage your beats and earnings</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate('/upload')}
                className="btn-primary flex items-center gap-2"
              >
                <span>➕</span>
                Upload New Beat
              </button>
              
              {/* Profile Dropdown */}
              <div className="relative profile-dropdown">
                <button 
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="flex items-center gap-2 p-2 rounded-xl hover:bg-white/10 transition-colors border border-white/20"
                >
                  {user?.profile_picture || profileImagePreview ? (
                    <img
                      src={user?.profile_picture || profileImagePreview || ''}
                      alt="Profile"
                      className="w-10 h-10 rounded-full object-cover border-2 border-blue-200"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center border-2 border-blue-200">
                      <span className="text-white font-bold text-sm">{user?.username?.charAt(0).toUpperCase()}</span>
                    </div>
                  )}
                  <svg 
                    className={`w-4 h-4 text-white transition-transform ${showProfileDropdown ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* Dropdown Menu */}
                {showProfileDropdown && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200/60 py-2 z-50 animate-slide-up">
                    <div className="px-4 py-3 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-teal-50">
                      <p className="font-bold text-slate-900">{user?.full_name || user?.username}</p>
                      <p className="text-sm text-slate-600">{user?.email}</p>
                    </div>
                    
                    <div className="py-1">
                      <button 
                        onClick={() => {
                          setActiveTab('profile');
                          setShowProfileDropdown(false);
                        }}
                        className="w-full px-4 py-2.5 text-left text-slate-700 hover:bg-blue-50 flex items-center gap-3 transition-colors font-medium"
                      >
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Edit Profile
                      </button>
                      
                      <button 
                        onClick={() => {
                          logout();
                          setShowProfileDropdown(false);
                        }}
                        className="w-full px-4 py-2.5 text-left text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors font-medium"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="section-container">
        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="card-elevated group hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-300 text-sm font-medium mb-1">Total Beats</p>
                <p className="text-3xl font-bold text-white">{analytics.totalBeats}</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <span className="text-2xl">🎵</span>
              </div>
            </div>
          </div>

          <div className="card-elevated group hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-300 text-sm font-medium mb-1">Total Sales</p>
                <p className="text-3xl font-bold text-white">{analytics.totalSales}</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <span className="text-2xl">📦</span>
              </div>
            </div>
          </div>

          <div className="card-elevated group hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-300 text-sm font-medium mb-1">Total Earnings</p>
                <p className="text-2xl font-bold gradient-text">₦{analytics.totalEarnings.toLocaleString()}</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 via-teal-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <span className="text-2xl">💰</span>
              </div>
            </div>
          </div>

          <div className="card-elevated group hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-300 text-sm font-medium mb-1">Pending Orders</p>
                <p className="text-3xl font-bold text-white">{analytics.pendingOrders}</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <span className="text-2xl">⏳</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="card-elevated mb-8">
          <div className="border-b border-slate-200">
            <nav className="flex space-x-2 px-2 overflow-x-auto scrollbar-hide">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-3 px-4 rounded-xl font-semibold text-sm flex items-center gap-2 whitespace-nowrap transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg scale-105'
                      : 'text-slate-300 hover:text-blue-300 hover:bg-blue-900/30'
                  }`}
                >
                  <span>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-8">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="card group hover:shadow-xl transition-shadow">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                      <span className="text-2xl">📋</span>
                      Recent Activity
                    </h3>
                    <div className="space-y-4">
                      {orders.slice(0, 3).map((order) => (
                        <div key={order.id} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl hover:bg-slate-700/50 transition-colors border border-slate-700">
                          <div>
                            <p className="font-bold text-white">{order.beatTitle}</p>
                            <p className="text-sm text-slate-300 mt-0.5">Sold to {order.buyerName}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-white">₦{order.amount.toLocaleString()}</p>
                            <span className={`text-xs px-3 py-1 rounded-full font-semibold mt-1 inline-block border ${
                              order.status === 'delivered' ? 'bg-green-500/20 text-green-300 border-green-500/30' :
                              order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' :
                              'bg-red-500/20 text-red-300 border-red-500/30'
                            }`}>
                              {order.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                    <h3 className="text-lg font-semibold mb-4 text-white">Top Performing Beat</h3>
                    <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                      <h4 className="font-semibold text-white">{analytics.topPerformingBeat.title}</h4>
                      <p className="text-slate-300 text-sm mb-3">{analytics.topPerformingBeat.description}</p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-slate-300">Sales</p>
                          <p className="font-semibold text-white">{analytics.topPerformingBeat.sales}</p>
                        </div>
                        <div>
                          <p className="text-slate-300">Earnings</p>
                          <p className="font-semibold text-white">₦{analytics.topPerformingBeat.earnings.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Beats Tab */}
            {activeTab === 'beats' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-white">My Beats</h3>
                  <button 
                    onClick={() => navigate('/upload')}
                    className="bg-gradient-to-r from-purple-600 via-teal-500 to-orange-500 hover:from-purple-700 hover:via-teal-600 hover:to-orange-600 text-white px-4 py-2 rounded-lg transition-all duration-300 shadow-lg"
                  >
                    Upload New Beat
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {beats.map((beat) => (
                    <div key={beat.id} className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="font-semibold text-lg text-white">{beat.title}</h4>
                        <span className={`text-xs px-2 py-1 rounded-full border ${
                          beat.status === 'published' ? 'bg-green-500/20 text-green-300 border-green-500/30' :
                          beat.status === 'draft' ? 'bg-slate-600 text-slate-200 border-slate-500' :
                          'bg-red-500/20 text-red-300 border-red-500/30'
                        }`}>
                          {beat.status}
                        </span>
                      </div>
                      
                      <p className="text-slate-300 text-sm mb-4">{beat.description}</p>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                        <div>
                          <p className="text-slate-300">Genre</p>
                          <p className="font-medium text-white">{beat.genre}</p>
                        </div>
                        <div>
                          <p className="text-slate-300">BPM</p>
                          <p className="font-medium text-white">{beat.bpm}</p>
                        </div>
                        <div>
                          <p className="text-slate-300">Price</p>
                          <p className="font-medium text-white">₦{beat.price.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-slate-300">Sales</p>
                          <p className="font-medium text-white">{beat.sales}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <button className="w-full bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white py-2 rounded-lg text-sm transition-all duration-300">
                          ▶ Preview
                        </button>
                        <button className="w-full border border-slate-600 bg-slate-800 text-white hover:bg-slate-700 py-2 rounded-lg text-sm">
                          Edit Beat
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-white">Orders</h3>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left py-3 px-4 text-white">Order ID</th>
                        <th className="text-left py-3 px-4 text-white">Beat</th>
                        <th className="text-left py-3 px-4 text-white">Buyer</th>
                        <th className="text-left py-3 px-4 text-white">Amount</th>
                        <th className="text-left py-3 px-4 text-white">Status</th>
                        <th className="text-left py-3 px-4 text-white">Date</th>
                        <th className="text-left py-3 px-4 text-white">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order.id} className="border-b border-slate-700/50">
                          <td className="py-3 px-4 font-medium text-white">{order.id}</td>
                          <td className="py-3 px-4 text-white">{order.beatTitle}</td>
                          <td className="py-3 px-4 text-white">{order.buyerName}</td>
                          <td className="py-3 px-4 text-white">₦{order.amount.toLocaleString()}</td>
                          <td className="py-3 px-4">
                            <span className={`text-xs px-2 py-1 rounded-full border ${
                              order.status === 'delivered' ? 'bg-green-500/20 text-green-300 border-green-500/30' :
                              order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' :
                              'bg-red-500/20 text-red-300 border-red-500/30'
                            }`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-slate-300">{order.orderDate}</td>
                          <td className="py-3 px-4">
                            {order.status === 'pending' && (
                                                          <button className="text-teal-400 hover:text-teal-300 text-sm font-medium">
                              Deliver
                            </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Transactions Tab */}
            {activeTab === 'transactions' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-white">Transaction History</h3>
                
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-white">{transaction.description}</p>
                          <p className="text-sm text-slate-300">{transaction.date}</p>
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold ${
                            transaction.type === 'withdrawal' ? 'text-red-400' : 'text-green-400'
                          }`}>
                            {transaction.type === 'withdrawal' ? '-' : '+'}₦{Math.abs(transaction.amount).toLocaleString()}
                          </p>
                          <span className={`text-xs px-2 py-1 rounded-full border ${
                            transaction.status === 'completed' ? 'bg-green-500/20 text-green-300 border-green-500/30' :
                            transaction.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' :
                            'bg-red-500/20 text-red-300 border-red-500/30'
                          }`}>
                            {transaction.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-white">Profile Settings</h3>
                  <div className="flex gap-3">
                    {isEditingProfile && (
                      <button 
                        onClick={() => {
                          setIsEditingProfile(false);
                          setSelectedProfileImage(null);
                          setProfileImagePreview('');
                          // Reset form data to original values
                          setProfileData({
                            username: user?.username || '',
                            email: user?.email || '',
                            fullName: user?.full_name || '',
                            bio: user?.bio || '',
                            headline: user?.headline || '',
                            profilePicture: user?.profile_picture || '',
                            socialLinks: {
                              instagram: '',
                              twitter: '',
                              youtube: '',
                              soundcloud: ''
                            }
                          });
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                      >
                        Cancel
                      </button>
                    )}
                    <button 
                      onClick={isEditingProfile ? handleProfileSave : () => setIsEditingProfile(true)}
                      disabled={profileLoading}
                      className="bg-gradient-to-r from-purple-600 via-teal-500 to-orange-500 hover:from-purple-700 hover:via-teal-600 hover:to-orange-600 text-white px-4 py-2 rounded-lg transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {profileLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Saving...
                        </div>
                      ) : (
                        isEditingProfile ? 'Save Changes' : 'Edit Profile'
                      )}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Profile Picture Section */}
                  <div className="lg:col-span-1">
                    <div className="bg-gray-50 rounded-xl p-6 text-center">
                      <div className="relative inline-block mb-4">
                        <img
                          src={profileImagePreview || profileData.profilePicture || 'https://via.placeholder.com/150'}
                          alt="Profile"
                          className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                        />
                        {isEditingProfile && (
                          <label className="absolute bottom-2 right-2 bg-purple-600 text-white p-2 rounded-full hover:bg-purple-700 transition cursor-pointer">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleProfileImageUpload}
                              className="hidden"
                            />
                            📷
                          </label>
                        )}
                      </div>
                      
                      {/* Rating Display */}
                      <div className="mb-4">
                        <div className="flex items-center justify-center gap-1 mb-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span key={star} className="text-yellow-400 text-xl">
                              {star <= (user?.rating || 0) ? '★' : '☆'}
                            </span>
                          ))}
                        </div>
                        <p className="text-sm text-slate-300">
                          {user?.rating || 0} out of 5 ({user?.total_ratings || 0} ratings)
                        </p>
                      </div>

                      <div className="space-y-2 text-sm">
                        <p className="font-medium text-white">{user?.username}</p>
                        <p className="text-slate-300">{user?.account_type}</p>
                        <p className="text-slate-300">Member since {new Date(user?.created_at || '').toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* Profile Form */}
                  <div className="lg:col-span-2">
                    <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                      <form onSubmit={(e) => { e.preventDefault(); handleProfileSave(); }} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2 text-white">Username</label>
                            <input
                              type="text"
                              value={profileData.username}
                              onChange={(e) => setProfileData(prev => ({ ...prev, username: e.target.value }))}
                              disabled={!isEditingProfile}
                              className="w-full px-3 py-2 border border-slate-600 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-slate-800 disabled:text-slate-400"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2 text-white">Email</label>
                            <input
                              type="email"
                              value={profileData.email}
                              onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                              disabled={!isEditingProfile}
                              className="w-full px-3 py-2 border border-slate-600 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-slate-800 disabled:text-slate-400"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2 text-white">Full Name</label>
                          <input
                            type="text"
                            value={profileData.fullName}
                            onChange={(e) => setProfileData(prev => ({ ...prev, fullName: e.target.value }))}
                            disabled={!isEditingProfile}
                            className="w-full px-3 py-2 border border-slate-600 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-slate-800 disabled:text-slate-400"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2 text-white">Headline</label>
                          <input
                            type="text"
                            value={profileData.headline}
                            onChange={(e) => setProfileData(prev => ({ ...prev, headline: e.target.value }))}
                            disabled={!isEditingProfile}
                            placeholder="e.g., Professional Music Producer & Sound Engineer"
                            className="w-full px-3 py-2 border border-slate-600 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-slate-800 disabled:text-slate-400 placeholder:text-slate-400"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2 text-white">Bio</label>
                          <textarea
                            value={profileData.bio}
                            onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                            disabled={!isEditingProfile}
                            rows={4}
                            placeholder="Tell your story, your musical journey, and what makes your beats unique..."
                            className="w-full px-3 py-2 border border-slate-600 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-slate-800 disabled:text-slate-400 resize-none placeholder:text-slate-400"
                          />
                        </div>

                        {/* Social Links */}
                        <div>
                          <label className="block text-sm font-medium mb-3 text-white">Social Links</label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs text-slate-300 mb-1">Instagram</label>
                              <input
                                type="url"
                                value={profileData.socialLinks.instagram}
                                onChange={(e) => setProfileData(prev => ({ 
                                  ...prev, 
                                  socialLinks: { ...prev.socialLinks, instagram: e.target.value }
                                }))}
                                disabled={!isEditingProfile}
                                placeholder="https://instagram.com/yourusername"
                                className="w-full px-3 py-2 border border-slate-600 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-slate-800 disabled:text-slate-400 text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-slate-300 mb-1">Twitter</label>
                              <input
                                type="url"
                                value={profileData.socialLinks.twitter}
                                onChange={(e) => setProfileData(prev => ({ 
                                  ...prev, 
                                  socialLinks: { ...prev.socialLinks, twitter: e.target.value }
                                }))}
                                disabled={!isEditingProfile}
                                placeholder="https://twitter.com/yourusername"
                                className="w-full px-3 py-2 border border-slate-600 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-slate-800 disabled:text-slate-400 text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-slate-300 mb-1">YouTube</label>
                              <input
                                type="url"
                                value={profileData.socialLinks.youtube}
                                onChange={(e) => setProfileData(prev => ({ 
                                  ...prev, 
                                  socialLinks: { ...prev.socialLinks, youtube: e.target.value }
                                }))}
                                disabled={!isEditingProfile}
                                placeholder="https://youtube.com/@yourchannel"
                                className="w-full px-3 py-2 border border-slate-600 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-slate-800 disabled:text-slate-400 text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-slate-300 mb-1">SoundCloud</label>
                              <input
                                type="url"
                                value={profileData.socialLinks.soundcloud}
                                onChange={(e) => setProfileData(prev => ({ 
                                  ...prev, 
                                  socialLinks: { ...prev.socialLinks, soundcloud: e.target.value }
                                }))}
                                disabled={!isEditingProfile}
                                placeholder="https://soundcloud.com/yourusername"
                                className="w-full px-3 py-2 border border-slate-600 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-slate-800 disabled:text-slate-400 text-sm"
                              />
                            </div>
                          </div>
                        </div>


                      </form>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Certificates Tab */}
            {activeTab === 'certificates' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-white">Beat Certificates</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {beats.map((beat) => (
                    <div key={beat.id} className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                      <div className="text-center mb-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 via-teal-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
                          <span className="text-2xl">🏆</span>
                        </div>
                        <h4 className="font-semibold text-white">{beat.title}</h4>
                        <p className="text-sm text-slate-300">{beat.genre}</p>
                      </div>
                      
                      <div className="space-y-2 text-sm text-white">
                        <div className="flex justify-between">
                          <span className="text-slate-300">Certificate ID:</span>
                          <span className="font-medium text-white">CERT-{beat.id.padStart(4, '0')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-300">Issue Date:</span>
                          <span className="text-white">{beat.uploadDate}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-300">Status:</span>
                          <span className="text-green-400">Verified</span>
                        </div>
                      </div>
                      
                      <div className="mt-4 space-y-2">
                        <button className="w-full bg-gradient-to-r from-purple-600 via-teal-500 to-orange-500 hover:from-purple-700 hover:via-teal-600 hover:to-orange-600 text-white py-2 rounded-lg text-sm transition-all duration-300">
                          View Certificate
                        </button>
                        <button className="w-full border border-slate-600 bg-slate-800 text-white hover:bg-slate-700 py-2 rounded-lg text-sm">
                          Download PDF
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-white">Detailed Analytics</h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                    <h4 className="font-semibold mb-4 text-white">Sales Performance</h4>
                    <div className="space-y-3">
                      {beats.map((beat) => (
                        <div key={beat.id} className="bg-slate-700/50 rounded-lg p-3 border border-slate-600">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-white">{beat.title}</span>
                            <span className="text-sm text-slate-300">{beat.sales} sales</span>
                          </div>
                          <div className="w-full bg-slate-600 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-teal-500 to-purple-600 h-2 rounded-full" 
                              style={{ width: `${(beat.sales / Math.max(...beats.map(b => b.sales))) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                    <h4 className="font-semibold mb-4 text-white">Earnings Overview</h4>
                    <div className="space-y-4">
                      <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                        <p className="text-sm text-slate-300">This Month</p>
                        <p className="text-2xl font-bold text-green-400">₦{(analytics.totalEarnings * 0.3).toLocaleString()}</p>
                      </div>
                      <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                        <p className="text-sm text-slate-300">Last Month</p>
                        <p className="text-2xl font-bold text-white">₦{(analytics.totalEarnings * 0.7).toLocaleString()}</p>
                      </div>
                      <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                        <p className="text-sm text-slate-300">Growth</p>
                        <p className="text-lg font-semibold text-green-400">+{analytics.monthlyGrowth}%</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 