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
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/contexts/AuthContext'
import { ordersApi } from '@/lib/api'
import { Order, OrderStatus } from '@/types'
import {
	AlertCircle,
	CheckCircle,
	Clock,
	FileText,
	Package,
	Plus,
	ShoppingCart,
	Truck,
	XCircle,
} from 'lucide-react'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'

// Helper function to format date
const formatDate = (dateString: string): string => {
	return new Date(dateString).toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
	})
}

// Status display configuration
const getStatusDisplay = (status: OrderStatus) => {
	switch (status) {
		case 'pending':
			return {
				label: 'Pending',
				color: 'bg-orange-100 text-orange-800',
				icon: <Clock className='h-4 w-4' />,
			}
		case 'approved':
			return {
				label: 'Approved',
				color: 'bg-green-100 text-green-800',
				icon: <CheckCircle className='h-4 w-4' />,
			}
		case 'rejected':
			return {
				label: 'Rejected',
				color: 'bg-red-100 text-red-800',
				icon: <XCircle className='h-4 w-4' />,
			}
		case 'completed':
			return {
				label: 'Completed',
				color: 'bg-blue-100 text-blue-800',
				icon: <Truck className='h-4 w-4' />,
			}
		default:
			return {
				label: 'Unknown',
				color: 'bg-gray-100 text-gray-800',
				icon: <AlertCircle className='h-4 w-4' />,
			}
	}
}

const WorkerDashboard: React.FC = () => {
	const { user } = useAuth()
	const [recentOrders, setRecentOrders] = useState<Order[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')
	const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
	const [isModalOpen, setIsModalOpen] = useState(false)

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

	const handleViewOrder = async (orderId: string) => {
		try {
			const response = await ordersApi.getOrder(orderId)
			setSelectedOrder(response.order)
			setIsModalOpen(true)
		} catch (err) {
			console.error('Failed to fetch order details:', err)
		}
	}

	const getTotalQuantity = (order: Order): number => {
		return order.items.reduce((total, item) => total + item.quantity, 0)
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
										Submit a new supply request for any branch
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
							{error ? (
								<div className='text-center py-8'>
									<AlertCircle className='h-12 w-12 text-red-400 mx-auto mb-4' />
									<p className='text-red-600'>{error}</p>
								</div>
							) : recentOrders.length === 0 ? (
								<div className='text-center py-8'>
									<p className='text-gray-500 mb-4'>No recent orders found</p>
									<Link href='/worker/new-order'>
										<Button>Create Your First Order</Button>
									</Link>
								</div>
							) : (
								<div className='space-y-4'>
									{recentOrders.map(order => (
										<div
											key={order._id}
											className='flex items-center justify-between p-4 bg-gray-50 rounded-lg'
										>
											<div className='flex-1'>
												<div className='flex items-center justify-between'>
													<div className='flex items-center'>
														<FileText className='h-5 w-5 text-gray-400 mr-3' />
														<div>
															<p className='font-medium text-base'>
																Order {order.orderNumber}
															</p>
															<p className='text-sm text-gray-500'>
																{order.branch} •{' '}
																{formatDate(order.requestedDate)}
															</p>
														</div>
													</div>
													<span
														className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
															order.status === 'pending'
																? 'bg-orange-100 text-orange-800'
																: order.status === 'approved'
																? 'bg-green-100 text-green-800'
																: order.status === 'rejected'
																? 'bg-red-100 text-red-800'
																: 'bg-blue-100 text-blue-800'
														}`}
													>
														{order.status.charAt(0).toUpperCase() +
															order.status.slice(1)}
													</span>
												</div>
											</div>
											<div className='ml-4'>
												<Button
													variant='outline'
													size='sm'
													onClick={() => handleViewOrder(order._id)}
												>
													View
												</Button>
											</div>
										</div>
									))}
								</div>
							)}
						</CardContent>
					</Card>
				</div>

				{/* Order Details Modal */}
				<Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
					<DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
						<DialogHeader>
							<DialogTitle>
								{selectedOrder && `Order ${selectedOrder.orderNumber}`}
							</DialogTitle>
							<DialogDescription>Order details and status</DialogDescription>
						</DialogHeader>

						{selectedOrder && (
							<div className='space-y-6'>
								{/* Order Info */}
								<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
									<div>
										<Label className='text-sm font-medium text-gray-500'>
											Order Number
										</Label>
										<p className='text-base font-mono font-medium'>
											{selectedOrder.orderNumber}
										</p>
									</div>
									<div>
										<Label className='text-sm font-medium text-gray-500'>
											Branch
										</Label>
										<p className='text-base'>{selectedOrder.branch}</p>
									</div>
									<div>
										<Label className='text-sm font-medium text-gray-500'>
											Status
										</Label>
										<span
											className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
												getStatusDisplay(selectedOrder.status).color
											}`}
										>
											{getStatusDisplay(selectedOrder.status).icon}
											<span className='ml-1'>
												{getStatusDisplay(selectedOrder.status).label}
											</span>
										</span>
									</div>
									<div>
										<Label className='text-sm font-medium text-gray-500'>
											Requested Date
										</Label>
										<p className='text-base'>
											{formatDate(selectedOrder.requestedDate)}
										</p>
									</div>
									<div>
										<Label className='text-sm font-medium text-gray-500'>
											Created Date
										</Label>
										<p className='text-base'>
											{formatDate(selectedOrder.createdAt)}
										</p>
									</div>
									<div>
										<Label className='text-sm font-medium text-gray-500'>
											Total Items
										</Label>
										<p className='text-base font-medium'>
											{getTotalQuantity(selectedOrder)} items
										</p>
									</div>
								</div>

								{/* Order Notes */}
								{selectedOrder.notes && (
									<div>
										<Label className='text-sm font-medium text-gray-500'>
											Order Notes
										</Label>
										<p className='text-sm bg-gray-50 p-3 rounded-lg mt-2'>
											{selectedOrder.notes}
										</p>
									</div>
								)}

								{/* Admin Notes */}
								{selectedOrder.adminNotes && (
									<div>
										<Label className='text-sm font-medium text-gray-500'>
											Admin Notes
										</Label>
										<p className='text-sm bg-blue-50 p-3 rounded-lg mt-2 border-l-4 border-blue-400'>
											{selectedOrder.adminNotes}
										</p>
									</div>
								)}

								{/* Order Items */}
								<div>
									<Label className='text-sm font-medium text-gray-500 mb-3 block'>
										Order Items ({selectedOrder.items.length})
									</Label>
									<div
										className={`space-y-3 ${
											selectedOrder.items.length > 6
												? 'max-h-80 overflow-y-auto pr-2'
												: ''
										}`}
									>
										{selectedOrder.items.map(item => (
											<div
												key={item.product._id}
												className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'
											>
												<div className='flex-1'>
													<div className='flex items-center'>
														<Package className='h-4 w-4 text-gray-400 mr-2' />
														<div>
															<p className='font-medium text-sm'>
																{item.product.name}
															</p>
															<p className='text-xs text-gray-500'>
																{item.product.category} • {item.product.unit}
															</p>
															{item.notes && (
																<p className='text-xs text-gray-600 mt-1 italic'>
																	Note: {item.notes}
																</p>
															)}
														</div>
													</div>
												</div>
												<div className='text-right'>
													<p className='font-medium text-sm'>
														{item.quantity} {item.product.unit}
													</p>
												</div>
											</div>
										))}
									</div>
								</div>

								{/* Order Summary */}
								<div className='border-t pt-4'>
									<div className='flex justify-between items-center'>
										<span className='text-sm text-gray-600'>Total Items:</span>
										<span className='font-medium'>
											{getTotalQuantity(selectedOrder)} items
										</span>
									</div>
									<div className='flex justify-between items-center mt-2'>
										<span className='text-sm text-gray-600'>
											Number of Products:
										</span>
										<span className='font-medium'>
											{selectedOrder.items.length}
										</span>
									</div>
								</div>
							</div>
						)}
					</DialogContent>
				</Dialog>
			</DashboardLayout>
		</ProtectedRoute>
	)
}

export default WorkerDashboard
