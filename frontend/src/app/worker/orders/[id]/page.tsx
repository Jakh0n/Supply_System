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
import { Label } from '@/components/ui/label'
import { ordersApi } from '@/lib/api'
import { Order, OrderStatus } from '@/types'
import {
	AlertCircle,
	ArrowLeft,
	CheckCircle,
	Clock,
	Package,
	Trash2,
	Truck,
	XCircle,
} from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'

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

const OrderDetailPage: React.FC = () => {
	const params = useParams()
	const router = useRouter()
	const [order, setOrder] = useState<Order | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')

	useEffect(() => {
		const fetchOrder = async () => {
			try {
				setLoading(true)
				const orderId = params.id as string
				const response = await ordersApi.getOrder(orderId)
				setOrder(response.order)
			} catch (err) {
				setError('Failed to load order details')
				console.error('Order fetch error:', err)
			} finally {
				setLoading(false)
			}
		}

		if (params.id) {
			fetchOrder()
		}
	}, [params.id])

	const handleDeleteOrder = async () => {
		if (!order) return

		if (order.status !== 'pending') {
			toast.error('Only pending orders can be deleted')
			return
		}

		if (
			!confirm(`Are you sure you want to delete order ${order.orderNumber}?`)
		) {
			return
		}

		try {
			await ordersApi.deleteOrder(order._id)
			toast.success('Order deleted successfully')
			router.push('/worker/orders')
		} catch (err: unknown) {
			const error = err as { response?: { data?: { message?: string } } }
			toast.error(error.response?.data?.message || 'Failed to delete order')
		}
	}

	const getTotalQuantity = (order: Order): number => {
		return order.items.reduce((total, item) => total + item.quantity, 0)
	}

	// Map legacy categories to display names
	const getCategoryDisplayName = (category: string): string => {
		const categoryMap: Record<string, string> = {
			// Legacy categories mapping
			food: 'Main Products',
			beverages: 'Desserts and Drinks',
			cleaning: 'Cleaning Materials',
			equipment: 'Packaging Materials',
			packaging: 'Packaging Materials',
			other: 'Main Products',
		}
		return categoryMap[category] || category
	}

	if (loading) {
		return (
			<ProtectedRoute requiredRole='worker'>
				<DashboardLayout>
					<div className='flex items-center justify-center h-64'>
						<div className='text-center'>
							<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto'></div>
							<p className='mt-4 text-gray-600'>Loading order details...</p>
						</div>
					</div>
				</DashboardLayout>
			</ProtectedRoute>
		)
	}

	if (error || !order) {
		return (
			<ProtectedRoute requiredRole='worker'>
				<DashboardLayout>
					<div className='flex items-center justify-center h-64'>
						<div className='text-center'>
							<AlertCircle className='h-12 w-12 text-red-400 mx-auto mb-4' />
							<p className='text-red-600 mb-4'>{error || 'Order not found'}</p>
							<Link href='/worker/orders'>
								<Button variant='outline'>
									<ArrowLeft className='h-4 w-4 mr-2' />
									Back to Orders
								</Button>
							</Link>
						</div>
					</div>
				</DashboardLayout>
			</ProtectedRoute>
		)
	}

	const statusDisplay = getStatusDisplay(order.status)

	return (
		<ProtectedRoute requiredRole='worker'>
			<DashboardLayout>
				<div className='space-y-6'>
					{/* Header */}
					<div className='flex items-center justify-between'>
						<div className='flex items-center space-x-4'>
							<Link href='/worker/orders'>
								<Button variant='outline' size='sm'>
									<ArrowLeft className='h-4 w-4 mr-2' />
									Back to Orders
								</Button>
							</Link>
							<div>
								<h1 className='text-2xl font-bold text-gray-900'>
									Order {order.orderNumber}
								</h1>
								<p className='text-gray-600'>Order details and status</p>
							</div>
						</div>
						{order.status === 'pending' && (
							<Button variant='destructive' onClick={handleDeleteOrder}>
								<Trash2 className='h-4 w-4 mr-2' />
								Delete Order
							</Button>
						)}
					</div>

					{/* Order Info Card */}
					<Card>
						<CardHeader>
							<CardTitle className='flex items-center justify-between'>
								<span>Order Information</span>
								<span
									className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusDisplay.color}`}
								>
									{statusDisplay.icon}
									<span className='ml-2'>{statusDisplay.label}</span>
								</span>
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
								<div>
									<Label className='text-sm font-medium text-gray-500'>
										Order Number
									</Label>
									<p className='text-lg font-mono font-medium'>
										{order.orderNumber}
									</p>
								</div>
								<div>
									<Label className='text-sm font-medium text-gray-500'>
										Branch
									</Label>
									<p className='text-lg'>{order.branch}</p>
								</div>
								<div>
									<Label className='text-sm font-medium text-gray-500'>
										Requested Date
									</Label>
									<p className='text-lg'>{formatDate(order.requestedDate)}</p>
								</div>
								<div>
									<Label className='text-sm font-medium text-gray-500'>
										Created Date
									</Label>
									<p className='text-lg'>{formatDate(order.createdAt)}</p>
								</div>
								{order.processedBy && (
									<div>
										<Label className='text-sm font-medium text-gray-500'>
											Processed By
										</Label>
										<p className='text-lg'>{order.processedBy.username}</p>
									</div>
								)}
								<div>
									<Label className='text-sm font-medium text-gray-500'>
										Total Items
									</Label>
									<p className='text-lg font-medium'>
										{getTotalQuantity(order)} items
									</p>
								</div>
							</div>

							{/* Order Notes */}
							{order.notes && (
								<div className='mt-6'>
									<Label className='text-sm font-medium text-gray-500'>
										Order Notes
									</Label>
									<p className='text-sm bg-gray-50 p-4 rounded-lg mt-2'>
										{order.notes}
									</p>
								</div>
							)}

							{/* Admin Notes */}
							{order.adminNotes && (
								<div className='mt-6'>
									<Label className='text-sm font-medium text-gray-500'>
										Admin Notes
									</Label>
									<p className='text-sm bg-blue-50 p-4 rounded-lg mt-2 border-l-4 border-blue-400'>
										{order.adminNotes}
									</p>
								</div>
							)}
						</CardContent>
					</Card>

					{/* Order Items */}
					<Card>
						<CardHeader>
							<CardTitle>Order Items ({order.items.length})</CardTitle>
							<CardDescription>Items requested in this order</CardDescription>
						</CardHeader>
						<CardContent>
							<div className='space-y-4'>
								{order.items.map((item, index) => {
									if (!item.product) {
										return (
											<div
												key={`deleted-${index}`}
												className='flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200'
											>
												<div className='flex-1'>
													<div className='flex items-center'>
														<Package className='h-5 w-5 text-red-400 mr-3' />
														<div>
															<p className='font-medium text-base text-red-600'>
																Product Deleted
															</p>
															<p className='text-sm text-red-500'>
																Product no longer available
															</p>
															{/* Item notes removed - using order-level notes only */}
														</div>
													</div>
												</div>
												<div className='text-right'>
													<p className='font-medium text-lg text-red-600'>
														{item.quantity} unit
													</p>
												</div>
											</div>
										)
									}

									return (
										<div
											key={item.product._id}
											className='flex items-center justify-between p-4 bg-gray-50 rounded-lg'
										>
											<div className='flex-1'>
												<div className='flex items-center'>
													<Package className='h-5 w-5 text-gray-400 mr-3' />
													<div>
														<p className='font-medium text-base'>
															{item.product.name}
														</p>
														<p className='text-sm text-gray-500'>
															{getCategoryDisplayName(item.product.category)} •{' '}
															{item.product.unit}
														</p>
													</div>
												</div>
											</div>
											<div className='text-right'>
												<p className='font-medium text-lg'>
													{item.quantity} {item.product.unit}
												</p>
											</div>
										</div>
									)
								})}
							</div>
						</CardContent>
					</Card>

					{/* Order Summary */}
					<Card>
						<CardHeader>
							<CardTitle>Order Summary</CardTitle>
						</CardHeader>
						<CardContent>
							<div className='space-y-3'>
								<div className='flex justify-between items-center text-base'>
									<span className='text-gray-600'>Total Items:</span>
									<span className='font-medium'>
										{getTotalQuantity(order)} items
									</span>
								</div>
								<div className='flex justify-between items-center text-base'>
									<span className='text-gray-600'>Number of Products:</span>
									<span className='font-medium'>{order.items.length}</span>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</DashboardLayout>
		</ProtectedRoute>
	)
}

export default OrderDetailPage
