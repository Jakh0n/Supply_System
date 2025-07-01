'use client'

import DashboardLayout from '@/components/shared/DashboardLayout'
import ProtectedRoute from '@/components/shared/ProtectedRoute'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { ordersApi, productsApi, usersApi } from '@/lib/api'
import { DashboardStats } from '@/types'
import {
	AlertCircle,
	DollarSign,
	Package,
	ShoppingCart,
	TrendingUp,
	Users,
} from 'lucide-react'
import React, { useEffect, useState } from 'react'

const AdminDashboard: React.FC = () => {
	const [stats, setStats] = useState<DashboardStats | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')

	useEffect(() => {
		const fetchStats = async () => {
			try {
				setLoading(true)
				const [ordersStats, usersStats] = await Promise.all([
					ordersApi.getDashboardStats(),
					usersApi.getUserStats(),
				])

				// Get products count separately since it uses different endpoint
				const productsResponse = await productsApi.getProducts({})

				const combinedStats: DashboardStats = {
					...ordersStats,
					totalUsers: usersStats.totalUsers,
					totalProducts: productsResponse.total,
					completedOrders: ordersStats.totalOrders - ordersStats.pendingOrders,
					totalRevenue: 0, // Revenue calculation would need to be added to backend
				}

				setStats(combinedStats)
			} catch (err) {
				setError('Failed to load dashboard statistics')
				console.error('Dashboard stats error:', err)
			} finally {
				setLoading(false)
			}
		}

		fetchStats()
	}, [])

	const statsCards = [
		{
			title: 'Total Users',
			value: stats?.totalUsers || 0,
			icon: Users,
			description: 'Active users in the system',
			color: 'text-blue-600',
		},
		{
			title: 'Total Products',
			value: stats?.totalProducts || 0,
			icon: Package,
			description: 'Available products',
			color: 'text-green-600',
		},
		{
			title: 'Total Orders',
			value: stats?.totalOrders || 0,
			icon: ShoppingCart,
			description: 'All orders placed',
			color: 'text-purple-600',
		},
		{
			title: 'Pending Orders',
			value: stats?.pendingOrders || 0,
			icon: AlertCircle,
			description: 'Orders awaiting processing',
			color: 'text-orange-600',
		},
		{
			title: 'Completed Orders',
			value: stats?.completedOrders || 0,
			icon: TrendingUp,
			description: 'Successfully completed orders',
			color: 'text-emerald-600',
		},
		{
			title: 'Today Orders',
			value: stats?.todayOrders || 0,
			icon: DollarSign,
			description: 'Orders placed today',
			color: 'text-indigo-600',
		},
	]

	if (loading) {
		return (
			<ProtectedRoute requiredRole='admin'>
				<DashboardLayout>
					<div className='flex items-center justify-center h-64'>
						<div className='text-center'>
							<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto'></div>
							<p className='mt-4 text-gray-600'>Loading dashboard...</p>
						</div>
					</div>
				</DashboardLayout>
			</ProtectedRoute>
		)
	}

	return (
		<ProtectedRoute requiredRole='admin'>
			<DashboardLayout>
				<div className='space-y-6'>
					{/* Header */}
					<div>
						<h1 className='text-2xl font-bold text-gray-900'>
							Admin Dashboard
						</h1>
						<p className='mt-2 text-gray-600'>
							Welcome to your admin dashboard. Here&apos;s an overview of your
							system.
						</p>
					</div>

					{/* Error message */}
					{error && (
						<div className='bg-red-50 border border-red-200 rounded-md p-4'>
							<div className='flex'>
								<AlertCircle className='h-5 w-5 text-red-400' />
								<div className='ml-3'>
									<p className='text-sm text-red-800'>{error}</p>
								</div>
							</div>
						</div>
					)}

					{/* Stats cards */}
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
						{statsCards.map((card, index) => {
							const Icon = card.icon
							return (
								<Card key={index}>
									<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
										<CardTitle className='text-sm font-medium'>
											{card.title}
										</CardTitle>
										<Icon className={`h-4 w-4 ${card.color}`} />
									</CardHeader>
									<CardContent>
										<div className='text-2xl font-bold'>{card.value}</div>
										<CardDescription className='text-xs text-muted-foreground'>
											{card.description}
										</CardDescription>
									</CardContent>
								</Card>
							)
						})}
					</div>

					{/* Quick actions */}
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
						<Card className='cursor-pointer hover:shadow-md transition-shadow'>
							<CardHeader>
								<CardTitle className='flex items-center'>
									<Users className='h-5 w-5 mr-2 text-blue-600' />
									Manage Users
								</CardTitle>
								<CardDescription>
									Add, edit, or remove users from the system
								</CardDescription>
							</CardHeader>
						</Card>

						<Card className='cursor-pointer hover:shadow-md transition-shadow'>
							<CardHeader>
								<CardTitle className='flex items-center'>
									<Package className='h-5 w-5 mr-2 text-green-600' />
									Manage Products
								</CardTitle>
								<CardDescription>
									Add new products or update existing inventory
								</CardDescription>
							</CardHeader>
						</Card>

						<Card className='cursor-pointer hover:shadow-md transition-shadow'>
							<CardHeader>
								<CardTitle className='flex items-center'>
									<ShoppingCart className='h-5 w-5 mr-2 text-purple-600' />
									View Orders
								</CardTitle>
								<CardDescription>
									Monitor and manage all orders in the system
								</CardDescription>
							</CardHeader>
						</Card>
					</div>
				</div>
			</DashboardLayout>
		</ProtectedRoute>
	)
}

export default AdminDashboard
