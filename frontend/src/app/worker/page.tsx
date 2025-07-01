'use client'

import DashboardLayout from '@/components/shared/DashboardLayout'
import ProtectedRoute from '@/components/shared/ProtectedRoute'
import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import { ordersApi } from '@/lib/api'
import { Order, OrderStatus } from '@/types'
import {
	AlertCircle,
	CheckCircle,
	Clock,
	Plus,
	ShoppingCart,
	XCircle,
} from 'lucide-react'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'

const WorkerDashboard: React.FC = () => {
	const { user } = useAuth()
	const [recentOrders, setRecentOrders] = useState<Order[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')

	useEffect(() => {
		const fetchRecentOrders = async () => {
			try {
				setLoading(true)
				const response = await ordersApi.getOrders({ page: 1, limit: 5 })
				setRecentOrders(response.orders)
			} catch (err) {
				setError('Failed to load recent orders')
				console.error('Recent orders error:', err)
			} finally {
				setLoading(false)
			}
		}

		fetchRecentOrders()
	}, [])

	const getStatusIcon = (status: OrderStatus) => {
		switch (status) {
			case 'pending':
				return <Clock className='h-4 w-4 text-orange-500' />
			case 'approved':
				return <CheckCircle className='h-4 w-4 text-green-500' />
			case 'rejected':
				return <XCircle className='h-4 w-4 text-red-500' />
			case 'completed':
				return <CheckCircle className='h-4 w-4 text-blue-500' />
			default:
				return <AlertCircle className='h-4 w-4 text-gray-500' />
		}
	}

	const getStatusColor = (status: OrderStatus) => {
		switch (status) {
			case 'pending':
				return 'text-orange-600 bg-orange-50'
			case 'approved':
				return 'text-green-600 bg-green-50'
			case 'rejected':
				return 'text-red-600 bg-red-50'
			case 'completed':
				return 'text-blue-600 bg-blue-50'
			default:
				return 'text-gray-600 bg-gray-50'
		}
	}

	if (loading) {
		return (
			<ProtectedRoute requiredRole='worker'>
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
		<ProtectedRoute requiredRole='worker'>
			<DashboardLayout>
				<div className='space-y-6'>
					{/* Header */}
					<div className='flex justify-between items-center'>
						<div>
							<h1 className='text-2xl font-bold text-gray-900'>
								Welcome back, {user?.username}!
							</h1>
							<p className='mt-2 text-gray-600'>
								{user?.branch && `${user.branch} • `}Worker Dashboard
							</p>
						</div>
						<Link href='/worker/new-order'>
							<Button className='flex items-center'>
								<Plus className='h-4 w-4 mr-2' />
								New Order
							</Button>
						</Link>
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

					{/* Quick actions */}
					<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
						<Link href='/worker/new-order'>
							<Card className='cursor-pointer hover:shadow-md transition-shadow h-full'>
								<CardHeader>
									<CardTitle className='flex items-center'>
										<Plus className='h-5 w-5 mr-2 text-green-600' />
										Create New Order
									</CardTitle>
									<CardDescription>
										Submit a new supply request for your branch
									</CardDescription>
								</CardHeader>
							</Card>
						</Link>

						<Link href='/worker/orders'>
							<Card className='cursor-pointer hover:shadow-md transition-shadow h-full'>
								<CardHeader>
									<CardTitle className='flex items-center'>
										<ShoppingCart className='h-5 w-5 mr-2 text-blue-600' />
										View My Orders
									</CardTitle>
									<CardDescription>
										Check the status of your submitted orders
									</CardDescription>
								</CardHeader>
							</Card>
						</Link>
					</div>

					{/* Recent orders */}
					<Card>
						<CardHeader>
							<CardTitle>Recent Orders</CardTitle>
							<CardDescription>Your latest order submissions</CardDescription>
						</CardHeader>
						<CardContent>
							{recentOrders.length === 0 ? (
								<div className='text-center py-8'>
									<ShoppingCart className='h-12 w-12 text-gray-400 mx-auto mb-4' />
									<p className='text-gray-500'>No orders found</p>
									<p className='text-sm text-gray-400 mt-1'>
										Create your first order to get started
									</p>
									<Link href='/worker/new-order'>
										<Button className='mt-4'>
											<Plus className='h-4 w-4 mr-2' />
											Create Order
										</Button>
									</Link>
								</div>
							) : (
								<div className='space-y-4'>
									{recentOrders.map(order => (
										<div
											key={order._id}
											className='flex items-center justify-between p-4 border rounded-lg'
										>
											<div className='flex items-center space-x-4'>
												{getStatusIcon(order.status)}
												<div>
													<p className='font-medium text-gray-900'>
														Order #{order.orderNumber}
													</p>
													<p className='text-sm text-gray-500'>
														{new Date(order.requestedDate).toLocaleDateString()}{' '}
														• {order.items.length} items
													</p>
												</div>
											</div>
											<div className='flex items-center space-x-3'>
												<span
													className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
														order.status
													)}`}
												>
													{order.status.charAt(0).toUpperCase() +
														order.status.slice(1)}
												</span>
												<Link href={`/worker/orders/${order._id}`}>
													<Button variant='outline' size='sm'>
														View
													</Button>
												</Link>
											</div>
										</div>
									))}

									{recentOrders.length >= 5 && (
										<div className='text-center pt-4'>
											<Link href='/worker/orders'>
												<Button variant='outline'>View All Orders</Button>
											</Link>
										</div>
									)}
								</div>
							)}
						</CardContent>
					</Card>
				</div>
			</DashboardLayout>
		</ProtectedRoute>
	)
}

export default WorkerDashboard
