import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';

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

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50 pt-20">
			<div className="container mx-auto px-4 py-8">
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-gray-900">Buyer Dashboard</h1>
					<p className="text-gray-600">Welcome{user ? `, ${user.username}` : ''}.</p>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
							</div>
							<div className="space-y-3">
								{orders.map(order => (
									<div key={order.id} className="flex items-center justify-between bg-white rounded-lg border p-3">
										<div>
											<div className="font-medium">{order.beatTitle}</div>
											<div className="text-sm text-gray-600">by {order.producerName}</div>
										</div>
										<div className="text-right">
											<div className="font-semibold">₦{order.amount.toLocaleString()}</div>
											<div className={`text-xs ${order.status === 'completed' ? 'text-green-600' : order.status === 'pending' ? 'text-yellow-600' : 'text-red-600'}`}>{order.status}</div>
										</div>
									</div>
								))}
								{orders.length === 0 && (
									<div className="text-center text-gray-500 py-8">No orders yet.</div>
								)}
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Transactions */}
				<Card className="mt-6">
					<CardContent className="p-6">
						<h2 className="text-lg font-semibold mb-4">Transaction History</h2>
						<div className="space-y-3">
							{transactions.map(tx => (
								<div key={tx.id} className="flex items-center justify-between bg-white rounded-lg border p-3">
									<div>
										<div className="font-medium">{tx.description}</div>
										<div className="text-xs text-gray-500">{tx.date}</div>
									</div>
									<div className="text-right">
										<div className={`font-semibold ${tx.amount < 0 ? 'text-red-600' : 'text-gray-900'}`}>₦{tx.amount.toLocaleString()}</div>
										<div className={`text-xs ${tx.status === 'completed' ? 'text-green-600' : tx.status === 'pending' ? 'text-yellow-600' : 'text-red-600'}`}>{tx.status}</div>
									</div>
								</div>
							))}
							{transactions.length === 0 && (
								<div className="text-center text-gray-500 py-8">No transactions yet.</div>
							)}
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
};

export default BuyerDashboard; 