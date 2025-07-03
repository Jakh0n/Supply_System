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
				<div className='space-y-4 sm:space-y-6'>
					{/* Header */}
					<div className='flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4'>
						<div className='min-w-0 flex-1'>
							<h1 className='text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate'>
								Welcome back, {user?.username}!
							</h1>
							<p className='mt-1 sm:mt-2 text-sm sm:text-base text-gray-600'>
								{user?.branch && `${user.branch} • `}Worker Dashboard
							</p>
						</div>
						<div className='flex-shrink-0 hidden sm:block'>
							<Link href='/worker/new-order'>
								<Button className='flex items-center justify-center h-9 text-base'>
									<Plus className='h-4 w-4 mr-2' />
									New Order
								</Button>
							</Link>
						</div>
					</div>

					{/* Error message */}
					{error && (
						<div className='bg-red-50 border border-red-200 rounded-md p-3 sm:p-4'>
							<div className='flex'>
								<AlertCircle className='h-4 w-4 sm:h-5 sm:w-5 text-red-400 flex-shrink-0 mt-0.5' />
								<div className='ml-2 sm:ml-3'>
									<p className='text-sm text-red-800'>{error}</p>
								</div>
							</div>
						</div>
					)}

					{/* Quick actions */}
					<div className='grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6'>
						<Link href='/worker/new-order' className='block'>
							<Card className='cursor-pointer hover:shadow-lg transition-all duration-200 h-full border-l-4 border-l-green-500 hover:border-l-green-600'>
								<CardHeader className='p-4 sm:p-6'>
									<CardTitle className='flex items-center text-base sm:text-lg'>
										<div className='p-2 bg-green-100 rounded-lg mr-3'>
											<Plus className='h-4 w-4 sm:h-5 sm:w-5 text-green-600' />
										</div>
										<span>Create New Order</span>
									</CardTitle>
									<CardDescription className='text-sm sm:text-base mt-2'>
										Submit a new supply request for your branch
									</CardDescription>
								</CardHeader>
							</Card>
						</Link>

						<Link href='/worker/orders' className='block'>
							<Card className='cursor-pointer hover:shadow-lg transition-all duration-200 h-full border-l-4 border-l-blue-500 hover:border-l-blue-600'>
								<CardHeader className='p-4 sm:p-6'>
									<CardTitle className='flex items-center text-base sm:text-lg'>
										<div className='p-2 bg-blue-100 rounded-lg mr-3'>
											<ShoppingCart className='h-4 w-4 sm:h-5 sm:w-5 text-blue-600' />
										</div>
										<span>View My Orders</span>
									</CardTitle>
									<CardDescription className='text-sm sm:text-base mt-2'>
										Check the status of your submitted orders
									</CardDescription>
								</CardHeader>
							</Card>
						</Link>
					</div>

					{/* Recent orders */}
					<Card>
						<CardHeader className='p-4 sm:p-6'>
							<CardTitle className='text-lg sm:text-xl'>
								Recent Orders
							</CardTitle>
							<CardDescription className='text-sm sm:text-base'>
								Your latest order submissions
							</CardDescription>
						</CardHeader>
						<CardContent className='p-4 sm:p-6 pt-0'>
							{error ? (
								<div className='text-center py-6 sm:py-8'>
									<AlertCircle className='h-10 w-10 sm:h-12 sm:w-12 text-red-400 mx-auto mb-3 sm:mb-4' />
									<p className='text-red-600 text-sm sm:text-base'>{error}</p>
								</div>
							) : recentOrders.length === 0 ? (
								<div className='text-center py-6 sm:py-8'>
									<div className='mb-4'>
										<ShoppingCart className='h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-3 sm:mb-4' />
										<p className='text-gray-500 text-sm sm:text-base mb-4'>
											No recent orders found
										</p>
									</div>
									<Link href='/worker/new-order'>
										<Button className='w-full sm:w-auto'>
											<Plus className='h-4 w-4 mr-2' />
											Create Your First Order
										</Button>
									</Link>
								</div>
							) : (
								<div className='space-y-3 sm:space-y-4'>
									{recentOrders.map(order => (
										<div
											key={order._id}
											className='flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200'
										>
											<div className='flex-1 min-w-0'>
												<div className='flex items-start sm:items-center justify-between mb-2 sm:mb-0'>
													<div className='flex items-center min-w-0 flex-1'>
														<div className='p-1.5 sm:p-2 bg-white rounded-md mr-2 sm:mr-3 flex-shrink-0'>
															<FileText className='h-4 w-4 sm:h-5 sm:w-5 text-gray-400' />
														</div>
														<div className='min-w-0 flex-1'>
															<p className='font-medium text-sm sm:text-base truncate'>
																Order {order.orderNumber}
															</p>
															<p className='text-xs sm:text-sm text-gray-500 truncate'>
																{order.branch} •{' '}
																{formatDate(order.requestedDate)}
															</p>
															<p className='text-xs text-gray-400 sm:hidden mt-1'>
																{order.items.length} items •{' '}
																{getTotalQuantity(order)} total
															</p>
														</div>
													</div>
													<div className='flex flex-col sm:flex-row items-end sm:items-center gap-2 sm:gap-3 ml-2'>
														<span
															className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
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
														<div className='hidden sm:block text-xs text-gray-500'>
															{order.items.length} items •{' '}
															{getTotalQuantity(order)} total
														</div>
													</div>
												</div>
											</div>
											<div className='mt-3 sm:mt-0 sm:ml-4 flex-shrink-0'>
												<Button
													variant='outline'
													size='sm'
													onClick={() => handleViewOrder(order._id)}
													className='w-full sm:w-auto text-xs sm:text-sm h-8 sm:h-9'
												>
													View Details
												</Button>
											</div>
										</div>
									))}

									{/* View All Orders Link */}
									<div className='pt-2 sm:pt-4 border-t border-gray-200'>
										<Link href='/worker/orders' className='block'>
											<Button className='w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-medium h-10 sm:h-9 text-sm sm:text-base shadow-sm hover:shadow-md transition-all duration-200'>
												<ShoppingCart className='h-4 w-4 mr-2' />
												View All Orders
											</Button>
										</Link>
									</div>
								</div>
							)}
						</CardContent>
					</Card>
				</div>

				{/* Order Details Modal */}
				<Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
					<DialogContent className='w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto'>
						<DialogHeader className='pb-4'>
							<DialogTitle className='text-lg sm:text-xl'>
								{selectedOrder && `Order ${selectedOrder.orderNumber}`}
							</DialogTitle>
							<DialogDescription className='text-sm sm:text-base'>
								Order details and current status
							</DialogDescription>
						</DialogHeader>

						{selectedOrder && (
							<div className='space-y-4 sm:space-y-6'>
								{/* Order Info */}
								<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4'>
									<div className='space-y-1'>
										<Label className='text-xs sm:text-sm font-medium text-gray-500'>
											Order Number
										</Label>
										<p className='text-sm sm:text-base font-mono font-medium break-all'>
											{selectedOrder.orderNumber}
										</p>
									</div>
									<div className='space-y-1'>
										<Label className='text-xs sm:text-sm font-medium text-gray-500'>
											Branch
										</Label>
										<p className='text-sm sm:text-base truncate'>
											{selectedOrder.branch}
										</p>
									</div>
									<div className='space-y-1'>
										<Label className='text-xs sm:text-sm font-medium text-gray-500'>
											Status
										</Label>
										<span
											className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
												getStatusDisplay(selectedOrder.status).color
											}`}
										>
											{getStatusDisplay(selectedOrder.status).icon}
											<span className='ml-1'>
												{getStatusDisplay(selectedOrder.status).label}
											</span>
										</span>
									</div>
									<div className='space-y-1'>
										<Label className='text-xs sm:text-sm font-medium text-gray-500'>
											Requested Date
										</Label>
										<p className='text-sm sm:text-base'>
											{formatDate(selectedOrder.requestedDate)}
										</p>
									</div>
									<div className='space-y-1'>
										<Label className='text-xs sm:text-sm font-medium text-gray-500'>
											Created Date
										</Label>
										<p className='text-sm sm:text-base'>
											{formatDate(selectedOrder.createdAt)}
										</p>
									</div>
									<div className='space-y-1'>
										<Label className='text-xs sm:text-sm font-medium text-gray-500'>
											Total Items
										</Label>
										<p className='text-sm sm:text-base font-medium'>
											{getTotalQuantity(selectedOrder)} items
										</p>
									</div>
								</div>

								{/* Order Notes */}
								{selectedOrder.notes && (
									<div className='space-y-2'>
										<Label className='text-xs sm:text-sm font-medium text-gray-500'>
											Order Notes
										</Label>
										<p className='text-xs sm:text-sm bg-gray-50 p-3 rounded-lg'>
											{selectedOrder.notes}
										</p>
									</div>
								)}

								{/* Admin Notes */}
								{selectedOrder.adminNotes && (
									<div className='space-y-2'>
										<Label className='text-xs sm:text-sm font-medium text-gray-500'>
											Admin Notes
										</Label>
										<p className='text-xs sm:text-sm bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400'>
											{selectedOrder.adminNotes}
										</p>
									</div>
								)}

								{/* Order Items */}
								<div className='space-y-3'>
									<Label className='text-xs sm:text-sm font-medium text-gray-500 block'>
										Order Items ({selectedOrder.items.length})
									</Label>
									<div
										className={`space-y-2 sm:space-y-3 ${
											selectedOrder.items.length > 6
												? 'max-h-60 sm:max-h-80 overflow-y-auto pr-2'
												: ''
										}`}
									>
										{selectedOrder.items.map(item => (
											<div
												key={item.product._id}
												className='flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg'
											>
												<div className='flex-1 min-w-0'>
													<div className='flex items-center'>
														<Package className='h-3 w-3 sm:h-4 sm:w-4 text-gray-400 mr-2 flex-shrink-0' />
														<div className='min-w-0 flex-1'>
															<p className='font-medium text-xs sm:text-sm truncate'>
																{item.product.name}
															</p>
															<p className='text-xs text-gray-500 truncate'>
																{item.product.category} • {item.product.unit}
															</p>
															{item.notes && (
																<p className='text-xs text-gray-600 mt-1 italic line-clamp-2'>
																	Note: {item.notes}
																</p>
															)}
														</div>
													</div>
												</div>
												<div className='text-right flex-shrink-0 ml-2'>
													<p className='font-medium text-xs sm:text-sm'>
														{item.quantity} {item.product.unit}
													</p>
												</div>
											</div>
										))}
									</div>
								</div>

								{/* Order Summary */}
								<div className='border-t pt-3 sm:pt-4 space-y-2'>
									<div className='flex justify-between items-center'>
										<span className='text-xs sm:text-sm text-gray-600'>
											Total Items:
										</span>
										<span className='font-medium text-xs sm:text-sm'>
											{getTotalQuantity(selectedOrder)} items
										</span>
									</div>
									<div className='flex justify-between items-center'>
										<span className='text-xs sm:text-sm text-gray-600'>
											Number of Products:
										</span>
										<span className='font-medium text-xs sm:text-sm'>
											{selectedOrder.items.length}
										</span>
									</div>
								</div>

								{/* Modal Actions */}
								<div className='flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-4 border-t'>
									<Button
										variant='outline'
										onClick={() => setIsModalOpen(false)}
										className='w-full sm:w-auto order-2 sm:order-1'
									>
										Close
									</Button>
									<Link href={`/worker/orders`}>
										<Button
											className='w-full sm:w-auto order-1 sm:order-2'
											onClick={() => setIsModalOpen(false)}
										>
											<ShoppingCart className='h-4 w-4 mr-2' />
											View All Orders
										</Button>
									</Link>
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
