import React, { useState } from 'react';

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
  const [activeTab, setActiveTab] = useState('overview');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedBeat, setSelectedBeat] = useState<Beat | null>(null);

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
    { id: 'certificates', label: 'Certificates', icon: '🏆' },
    { id: 'analytics', label: 'Analytics', icon: '📈' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src="/images/beatscrest-logo-large.svg" 
                alt="BeatCrest Logo" 
                className="h-10 w-10"
              />
              <h1 className="text-2xl font-bold text-gray-900">Producer Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-600">Welcome back, DJ ProBeat</span>
              <button className="bg-gradient-to-r from-purple-600 via-teal-500 to-orange-500 hover:from-purple-700 hover:via-teal-600 hover:to-orange-600 text-white px-4 py-2 rounded-lg transition-all duration-300 shadow-lg">
                Upload New Beat
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Beats</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.totalBeats}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-teal-100 to-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🎵</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Sales</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.totalSales}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-teal-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📦</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Earnings</p>
                <p className="text-2xl font-bold text-gray-900">₦{analytics.totalEarnings.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-100 via-teal-100 to-orange-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">💰</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Pending Orders</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.pendingOrders}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">⏳</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'border-teal-500 text-teal-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                    <div className="space-y-3">
                      {orders.slice(0, 3).map((order) => (
                        <div key={order.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                          <div>
                            <p className="font-medium">{order.beatTitle}</p>
                            <p className="text-sm text-gray-600">Sold to {order.buyerName}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">₦{order.amount.toLocaleString()}</p>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                              order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {order.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold mb-4">Top Performing Beat</h3>
                    <div className="bg-white rounded-lg p-4">
                      <h4 className="font-semibold">{analytics.topPerformingBeat.title}</h4>
                      <p className="text-gray-600 text-sm mb-3">{analytics.topPerformingBeat.description}</p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Sales</p>
                          <p className="font-semibold">{analytics.topPerformingBeat.sales}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Earnings</p>
                          <p className="font-semibold">₦{analytics.topPerformingBeat.earnings.toLocaleString()}</p>
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
                  <h3 className="text-lg font-semibold">My Beats</h3>
                  <button 
                    onClick={() => setShowUploadModal(true)}
                    className="bg-gradient-to-r from-purple-600 via-teal-500 to-orange-500 hover:from-purple-700 hover:via-teal-600 hover:to-orange-600 text-white px-4 py-2 rounded-lg transition-all duration-300 shadow-lg"
                  >
                    Upload New Beat
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {beats.map((beat) => (
                    <div key={beat.id} className="bg-gray-50 rounded-xl p-6">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="font-semibold text-lg">{beat.title}</h4>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          beat.status === 'published' ? 'bg-green-100 text-green-800' :
                          beat.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {beat.status}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-4">{beat.description}</p>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                        <div>
                          <p className="text-gray-600">Genre</p>
                          <p className="font-medium">{beat.genre}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">BPM</p>
                          <p className="font-medium">{beat.bpm}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Price</p>
                          <p className="font-medium">₦{beat.price.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Sales</p>
                          <p className="font-medium">{beat.sales}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <button className="w-full bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white py-2 rounded-lg text-sm transition-all duration-300">
                          ▶ Preview
                        </button>
                        <button className="w-full border border-gray-300 hover:bg-gray-50 py-2 rounded-lg text-sm">
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
                <h3 className="text-lg font-semibold">Orders</h3>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4">Order ID</th>
                        <th className="text-left py-3 px-4">Beat</th>
                        <th className="text-left py-3 px-4">Buyer</th>
                        <th className="text-left py-3 px-4">Amount</th>
                        <th className="text-left py-3 px-4">Status</th>
                        <th className="text-left py-3 px-4">Date</th>
                        <th className="text-left py-3 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order.id} className="border-b border-gray-100">
                          <td className="py-3 px-4 font-medium">{order.id}</td>
                          <td className="py-3 px-4">{order.beatTitle}</td>
                          <td className="py-3 px-4">{order.buyerName}</td>
                          <td className="py-3 px-4">₦{order.amount.toLocaleString()}</td>
                          <td className="py-3 px-4">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                              order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm">{order.orderDate}</td>
                          <td className="py-3 px-4">
                            {order.status === 'pending' && (
                                                          <button className="text-teal-600 hover:text-teal-700 text-sm font-medium">
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
                <h3 className="text-lg font-semibold">Transaction History</h3>
                
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-gray-600">{transaction.date}</p>
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold ${
                            transaction.type === 'withdrawal' ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {transaction.type === 'withdrawal' ? '-' : '+'}₦{Math.abs(transaction.amount).toLocaleString()}
                          </p>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                            transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
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

            {/* Certificates Tab */}
            {activeTab === 'certificates' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Beat Certificates</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {beats.map((beat) => (
                    <div key={beat.id} className="bg-gray-50 rounded-xl p-6">
                      <div className="text-center mb-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-100 via-teal-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <span className="text-2xl">🏆</span>
                        </div>
                        <h4 className="font-semibold">{beat.title}</h4>
                        <p className="text-sm text-gray-600">{beat.genre}</p>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Certificate ID:</span>
                          <span className="font-medium">CERT-{beat.id.padStart(4, '0')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Issue Date:</span>
                          <span>{beat.uploadDate}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Status:</span>
                          <span className="text-green-600">Verified</span>
                        </div>
                      </div>
                      
                      <div className="mt-4 space-y-2">
                        <button className="w-full bg-gradient-to-r from-purple-600 via-teal-500 to-orange-500 hover:from-purple-700 hover:via-teal-600 hover:to-orange-600 text-white py-2 rounded-lg text-sm transition-all duration-300">
                          View Certificate
                        </button>
                        <button className="w-full border border-gray-300 hover:bg-gray-50 py-2 rounded-lg text-sm">
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
                <h3 className="text-lg font-semibold">Detailed Analytics</h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h4 className="font-semibold mb-4">Sales Performance</h4>
                    <div className="space-y-3">
                      {beats.map((beat) => (
                        <div key={beat.id} className="bg-white rounded-lg p-3">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium">{beat.title}</span>
                            <span className="text-sm text-gray-600">{beat.sales} sales</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-teal-500 to-purple-600 h-2 rounded-full" 
                              style={{ width: `${(beat.sales / Math.max(...beats.map(b => b.sales))) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-6">
                    <h4 className="font-semibold mb-4">Earnings Overview</h4>
                    <div className="space-y-4">
                      <div className="bg-white rounded-lg p-4">
                        <p className="text-sm text-gray-600">This Month</p>
                        <p className="text-2xl font-bold text-green-600">₦{(analytics.totalEarnings * 0.3).toLocaleString()}</p>
                      </div>
                      <div className="bg-white rounded-lg p-4">
                        <p className="text-sm text-gray-600">Last Month</p>
                        <p className="text-2xl font-bold text-gray-900">₦{(analytics.totalEarnings * 0.7).toLocaleString()}</p>
                      </div>
                      <div className="bg-white rounded-lg p-4">
                        <p className="text-sm text-gray-600">Growth</p>
                        <p className="text-lg font-semibold text-green-600">+{analytics.monthlyGrowth}%</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-bold">Upload New Beat</h3>
              <button 
                onClick={() => setShowUploadModal(false)}
                className="rounded-xl px-3 py-1 text-sm text-gray-500 hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            <form className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Beat Title</label>
                <input 
                  type="text" 
                  className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Enter beat title"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Description</label>
                <textarea 
                  className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-teal-500"
                  rows={3}
                  placeholder="Describe your beat..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">Genre</label>
                  <select className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-teal-500">
                    <option>Hip Hop</option>
                    <option>Afrobeats</option>
                    <option>R&B</option>
                    <option>Trap</option>
                    <option>Reggae</option>
                    <option>Pop</option>
                    <option>Gospel</option>
                    <option>Jazz</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">BPM</label>
                  <input 
                    type="number" 
                    className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="120"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Price (₦)</label>
                <input 
                  type="number" 
                  className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="45000"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Beat File (MP3/WAV)</label>
                <input 
                  type="file" 
                  accept=".mp3,.wav"
                  className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Preview Video (MP4)</label>
                <input 
                  type="file" 
                  accept=".mp4"
                  className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 border border-gray-300 hover:bg-gray-50 py-3 rounded-xl transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-purple-600 via-teal-500 to-orange-500 hover:from-purple-700 hover:via-teal-600 hover:to-orange-600 text-white py-3 rounded-xl transition-all duration-300 shadow-lg"
                >
                  Upload Beat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 