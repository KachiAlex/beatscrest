import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Wallet, ShoppingBag, Receipt, Filter, ChevronRight } from 'lucide-react';

interface BuyerOrder {
	id: string;
	beatTitle: string;
	producerName: string;
	amount: number;
	status: 'pending' | 'completed' | 'failed';
	orderDate: string;
}

interface BuyerTransaction {
	id: string;
	type: 'purchase' | 'refund';
	amount: number;
	description: string;
	date: string;
	status: 'completed' | 'pending' | 'failed';
}

const BuyerDashboard: React.FC = () => {
	const { user, loading } = useAuth();
	const [orders, setOrders] = useState<BuyerOrder[]>([]);
	const [transactions, setTransactions] = useState<BuyerTransaction[]>([]);
	const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'transactions'>('overview');
	const [orderStatusFilter, setOrderStatusFilter] = useState<'all' | 'pending' | 'completed' | 'failed'>('all');
	const [txStatusFilter, setTxStatusFilter] = useState<'all' | 'pending' | 'completed' | 'failed'>('all');

	useEffect(() => {
		// Mock: Load buyer data (replace with real API later)
		setOrders([
			{ id: 'ORD1001', beatTitle: 'Midnight Groove', producerName: 'DJ ProBeat', amount: 45000, status: 'completed', orderDate: '2024-01-25' },
			{ id: 'ORD1002', beatTitle: 'Afro Vibes', producerName: 'Afrobeats King', amount: 35000, status: 'pending', orderDate: '2024-01-28' }
		]);
		setTransactions([
			{ id: 'TX1001', type: 'purchase', amount: 45000, description: 'Purchase: Midnight Groove', date: '2024-01-25', status: 'completed' },
			{ id: 'TX1002', type: 'purchase', amount: 35000, description: 'Purchase: Afro Vibes', date: '2024-01-28', status: 'pending' }
		]);
	}, []);

	const totalSpend = transactions
		.filter(t => t.type === 'purchase' && (txStatusFilter === 'all' || t.status === txStatusFilter))
		.reduce((sum, t) => sum + t.amount, 0);

	const filteredOrders = orders.filter(o => orderStatusFilter === 'all' || o.status === orderStatusFilter);
	const filteredTransactions = transactions.filter(t => txStatusFilter === 'all' || t.status === txStatusFilter);

	const statusBadge = (status: 'pending' | 'completed' | 'failed') => {
		switch (status) {
			case 'completed':
				return <Badge className="bg-green-100 text-green-700 border border-green-200">Completed</Badge>;
			case 'pending':
				return <Badge className="bg-yellow-100 text-yellow-700 border border-yellow-200">Pending</Badge>;
			default:
				return <Badge className="bg-red-100 text-red-700 border border-red-200">Failed</Badge>;
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50 pt-20">
			<div className="container mx-auto px-4 py-8 max-w-6xl">
				{/* Header */}
				<div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 via-teal-500 to-orange-500 p-1">
					<div className="rounded-2xl bg-white p-6">
						<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
							<div className="flex items-center gap-4">
								<img
									src={user?.profile_picture || 'https://via.placeholder.com/80'}
									alt={user?.username || 'User'}
									className="w-16 h-16 rounded-full object-cover border"
								/>
								<div>
									<h1 className="text-2xl md:text-3xl font-bold text-gray-900">Buyer Dashboard</h1>
									<p className="text-gray-600">Welcome{user ? `, ${user.username}` : ''}.</p>
								</div>
							</div>
							<div className="flex items-center gap-3">
								<Button variant="outline" className="border-gray-300">Settings</Button>
								<Button className="bg-purple-600 hover:bg-purple-700">Deposit</Button>
							</div>
						</div>
					</div>
				</div>

				{/* Quick Stats */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
					<Card>
						<CardContent className="p-5 flex items-center gap-4">
							<div className="p-3 rounded-lg bg-purple-50 text-purple-700"><ShoppingBag size={20} /></div>
							<div>
								<div className="text-sm text-gray-500">Orders</div>
								<div className="text-2xl font-bold">{orders.length}</div>
							</div>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="p-5 flex items-center gap-4">
							<div className="p-3 rounded-lg bg-teal-50 text-teal-700"><Wallet size={20} /></div>
							<div>
								<div className="text-sm text-gray-500">Total Spend</div>
								<div className="text-2xl font-bold">₦{transactions.filter(t => t.type === 'purchase').reduce((s, t) => s + t.amount, 0).toLocaleString()}</div>
							</div>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="p-5 flex items-center gap-4">
							<div className="p-3 rounded-lg bg-orange-50 text-orange-700"><Receipt size={20} /></div>
							<div>
								<div className="text-sm text-gray-500">Transactions</div>
								<div className="text-2xl font-bold">{transactions.length}</div>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Tabs */}
				<div className="mt-8">
					<div className="flex items-center gap-2 border-b">
						<button onClick={() => setActiveTab('overview')} className={`px-4 py-2 -mb-px border-b-2 ${activeTab === 'overview' ? 'border-purple-600 text-purple-700' : 'border-transparent text-gray-600 hover:text-gray-900'}`}>Overview</button>
						<button onClick={() => setActiveTab('orders')} className={`px-4 py-2 -mb-px border-b-2 ${activeTab === 'orders' ? 'border-purple-600 text-purple-700' : 'border-transparent text-gray-600 hover:text-gray-900'}`}>Orders</button>
						<button onClick={() => setActiveTab('transactions')} className={`px-4 py-2 -mb-px border-b-2 ${activeTab === 'transactions' ? 'border-purple-600 text-purple-700' : 'border-transparent text-gray-600 hover:text-gray-900'}`}>Transactions</button>
					</div>

					{/* Overview */}
					{activeTab === 'overview' && (
						<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
							{/* Profile Summary */}
							<Card className="lg:col-span-1">
								<CardContent className="p-6">
									<div className="flex items-center gap-4">
										<img
											src={user?.profile_picture || 'https://via.placeholder.com/80'}
											alt={user?.username || 'User'}
											className="w-20 h-20 rounded-full object-cover border"
										/>
										<div>
											<div className="text-lg font-semibold">{user?.username || 'Guest'}</div>
											<div className="text-sm text-gray-600">{user?.email || 'Not signed in'}</div>
										</div>
									</div>
									<div className="mt-4 grid grid-cols-3 gap-4 text-center">
										<div>
											<div className="text-xl font-bold">{orders.length}</div>
											<div className="text-xs text-gray-500">Orders</div>
										</div>
										<div>
											<div className="text-xl font-bold">₦{transactions.filter(t => t.type === 'purchase').reduce((s, t) => s + t.amount, 0).toLocaleString()}</div>
											<div className="text-xs text-gray-500">Total Spend</div>
										</div>
										<div>
											<div className="text-xl font-bold">{transactions.length}</div>
											<div className="text-xs text-gray-500">Transactions</div>
										</div>
									</div>
								</CardContent>
							</Card>

							{/* Current Orders */}
							<Card className="lg:col-span-2">
								<CardContent className="p-6">
									<div className="flex items-center justify-between mb-4">
										<h2 className="text-lg font-semibold">Current Orders</h2>
										<div className="flex items-center gap-2">
											<Filter size={16} className="text-gray-500" />
											<select
												value={orderStatusFilter}
												onChange={(e) => setOrderStatusFilter(e.target.value as any)}
												className="text-sm border rounded-md px-2 py-1"
											>
												<option value="all">All</option>
												<option value="pending">Pending</option>
												<option value="completed">Completed</option>
												<option value="failed">Failed</option>
											</select>
										</div>
									</div>
									<div className="space-y-3">
										{filteredOrders.map(order => (
											<div key={order.id} className="flex items-center justify-between bg-white rounded-lg border p-3">
												<div className="flex items-center gap-3">
													<div className="h-10 w-10 rounded-md bg-gray-100 flex items-center justify-center text-gray-500">🎵</div>
													<div>
														<div className="font-medium flex items-center gap-2">{order.beatTitle} <ChevronRight size={16} className="text-gray-400" /></div>
														<div className="text-sm text-gray-600">by {order.producerName}</div>
													</div>
												</div>
												<div className="text-right space-y-1">
													<div className="font-semibold">₦{order.amount.toLocaleString()}</div>
													<div className="flex justify-end">{statusBadge(order.status)}</div>
												</div>
											</div>
										))}
										{filteredOrders.length === 0 && (
											<div className="text-center text-gray-500 py-8">No orders found for this filter.</div>
										)}
									</div>
								</CardContent>
							</Card>
						</div>
					)}

					{/* Orders Tab */}
					{activeTab === 'orders' && (
						<Card className="mt-6">
							<CardContent className="p-6">
								<div className="flex items-center justify-between mb-4">
									<h2 className="text-lg font-semibold">All Orders</h2>
									<div className="flex items-center gap-2">
										<Filter size={16} className="text-gray-500" />
										<select
											value={orderStatusFilter}
											onChange={(e) => setOrderStatusFilter(e.target.value as any)}
											className="text-sm border rounded-md px-2 py-1"
										>
											<option value="all">All</option>
											<option value="pending">Pending</option>
											<option value="completed">Completed</option>
											<option value="failed">Failed</option>
										</select>
									</div>
								</div>
								<div className="space-y-3">
									{filteredOrders.map(order => (
										<div key={order.id} className="flex items-center justify-between bg-white rounded-lg border p-3">
											<div>
												<div className="font-medium">{order.beatTitle}</div>
												<div className="text-sm text-gray-600">by {order.producerName}</div>
											</div>
											<div className="text-right">
												<div className="font-semibold">₦{order.amount.toLocaleString()}</div>
												<div>{statusBadge(order.status)}</div>
											</div>
										</div>
									))}
									{filteredOrders.length === 0 && (
										<div className="text-center text-gray-500 py-8">No orders found for this filter.</div>
									)}
								</div>
							</CardContent>
						</Card>
					)}

					{/* Transactions Tab */}
					{activeTab === 'transactions' && (
						<Card className="mt-6">
							<CardContent className="p-6">
								<div className="flex items-center justify-between mb-4">
									<h2 className="text-lg font-semibold">Transaction History</h2>
									<div className="flex items-center gap-2">
										<Filter size={16} className="text-gray-500" />
										<select
											value={txStatusFilter}
											onChange={(e) => setTxStatusFilter(e.target.value as any)}
											className="text-sm border rounded-md px-2 py-1"
										>
											<option value="all">All</option>
											<option value="pending">Pending</option>
											<option value="completed">Completed</option>
											<option value="failed">Failed</option>
										</select>
									</div>
								</div>
								<div className="space-y-3">
									{filteredTransactions.map(tx => (
										<div key={tx.id} className="flex items-center justify-between bg-white rounded-lg border p-3">
											<div>
												<div className="font-medium">{tx.description}</div>
												<div className="text-xs text-gray-500">{tx.date}</div>
											</div>
											<div className="text-right">
												<div className={`font-semibold ${tx.amount < 0 ? 'text-red-600' : 'text-gray-900'}`}>₦{tx.amount.toLocaleString()}</div>
												<div>{statusBadge(tx.status)}</div>
											</div>
										</div>
									))}
									{filteredTransactions.length === 0 && (
										<div className="text-center text-gray-500 py-8">No transactions found for this filter.</div>
									)}
								</div>
							</CardContent>
						</Card>
					)}
				</div>
			</div>
		</div>
	);
};

export default BuyerDashboard; 