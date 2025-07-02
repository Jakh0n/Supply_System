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
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { useAuth } from '@/contexts/AuthContext'
import { ordersApi } from '@/lib/api'
import { Order, OrderStatus } from '@/types'
import {
	AlertCircle,
	CheckCircle,
	Clock,
	Eye,
	FileText,
	MoreHorizontal,
	Package,
	Plus,
	ShoppingCart,
	Trash2,
	Truck,
	XCircle,
} from 'lucide-react'
import Link from 'next/link'
import React, { useCallback, useEffect, useState } from 'react'
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
				icon: <Clock className='h-3 w-3' />,
			}
		case 'approved':
			return {
				label: 'Approved',
				color: 'bg-green-100 text-green-800',
				icon: <CheckCircle className='h-3 w-3' />,
			}
		case 'rejected':
			return {
				label: 'Rejected',
				color: 'bg-red-100 text-red-800',
				icon: <XCircle className='h-3 w-3' />,
			}
		case 'completed':
			return {
				label: 'Completed',
				color: 'bg-blue-100 text-blue-800',
				icon: <Truck className='h-3 w-3' />,
			}
		default:
			return {
				label: 'Unknown',
				color: 'bg-gray-100 text-gray-800',
				icon: <AlertCircle className='h-3 w-3' />,
			}
	}
}

const MyOrders: React.FC = () => {
	const { user } = useAuth()
	const [orders, setOrders] = useState<Order[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')
	const [selectedDate, setSelectedDate] = useState('')
	const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all')
	const [currentPage, setCurrentPage] = useState(1)
	const [totalPages, setTotalPages] = useState(1)
	const [totalOrders, setTotalOrders] = useState(0)
	const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
	const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)

	// Fetch orders
	const fetchOrders = useCallback(async () => {
		try {
			setLoading(true)
			const response = await ordersApi.getOrders({
				date: selectedDate || undefined,
				status: statusFilter !== 'all' ? statusFilter : undefined,
				page: currentPage,
				limit: 20,
			})
			setOrders(response.orders)
			setTotalPages(response.pagination.pages)
			setTotalOrders(response.pagination.total)
		} catch (err) {
			setError('Failed to load orders')
			console.error('Orders fetch error:', err)
		} finally {
			setLoading(false)
		}
	}, [selectedDate, statusFilter, currentPage])

	useEffect(() => {
		fetchOrders()
	}, [fetchOrders])

	const handleDeleteOrder = async (order: Order) => {
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
			await fetchOrders()
			toast.success('Order deleted successfully')
		} catch (err: unknown) {
			const error = err as { response?: { data?: { message?: string } } }
			toast.error(error.response?.data?.message || 'Failed to delete order')
		}
	}

	const openDetailDialog = (order: Order) => {
		setSelectedOrder(order)
		setIsDetailDialogOpen(true)
	}

	const getTotalQuantity = (order: Order): number => {
		return order.items.reduce((total, item) => total + item.quantity, 0)
	}

	if (loading && orders.length === 0) {
		return (
			<ProtectedRoute requiredRole='worker'>
				<DashboardLayout>
					<div className='flex items-center justify-center h-64'>
						<div className='text-center'>
							<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto'></div>
							<p className='mt-4 text-gray-600'>Loading your orders...</p>
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
							<h1 className='text-2xl font-bold text-gray-900'>My Orders</h1>
							<p className='mt-2 text-gray-600'>
								Track and manage your supply requests
								{user?.branch && ` for ${user.branch}`}
							</p>
						</div>
						<Link href='/worker/new-order'>
							<Button>
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

					{/* Filters */}
					<Card>
						<CardHeader>
							<CardTitle>Filter Orders</CardTitle>
						</CardHeader>
						<CardContent>
							<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
								<div>
									<Label htmlFor='date-filter'>Date</Label>
									<Input
										id='date-filter'
										type='date'
										value={selectedDate}
										onChange={e => {
											setSelectedDate(e.target.value)
											setCurrentPage(1)
										}}
									/>
								</div>
								<div>
									<Label htmlFor='status-filter'>Status</Label>
									<Select
										value={statusFilter}
										onValueChange={(value: OrderStatus | 'all') => {
											setStatusFilter(value)
											setCurrentPage(1)
										}}
									>
										<SelectTrigger>
											<SelectValue placeholder='All statuses' />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value='all'>All Status</SelectItem>
											<SelectItem value='pending'>Pending</SelectItem>
											<SelectItem value='approved'>Approved</SelectItem>
											<SelectItem value='rejected'>Rejected</SelectItem>
											<SelectItem value='completed'>Completed</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div className='flex items-end'>
									<Button
										variant='outline'
										onClick={() => {
											setSelectedDate('')
											setStatusFilter('all')
											setCurrentPage(1)
										}}
									>
										Clear Filters
									</Button>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Orders Table */}
					<Card>
						<CardHeader>
							<CardTitle>Your Orders ({totalOrders})</CardTitle>
							<CardDescription>
								All your supply requests and their current status
							</CardDescription>
						</CardHeader>
						<CardContent>
							{orders.length === 0 ? (
								<div className='text-center py-12'>
									<ShoppingCart className='h-16 w-16 text-gray-400 mx-auto mb-4' />
									<h3 className='text-lg font-medium text-gray-900 mb-2'>
										No orders found
									</h3>
									<p className='text-gray-500 mb-6'>
										{selectedDate || statusFilter !== 'all'
											? 'Try adjusting your filters to see more orders'
											: "You haven't created any orders yet"}
									</p>
									<Link href='/worker/new-order'>
										<Button>
											<Plus className='h-4 w-4 mr-2' />
											Create Your First Order
										</Button>
									</Link>
								</div>
							) : (
								<div className='overflow-x-auto'>
									<div className='max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100'>
										<table className='w-full'>
											<thead className='bg-gray-50 sticky top-0 z-10'>
												<tr className='border-b'>
													<th className='text-left py-3 px-4 font-medium bg-gray-50'>
														Order #
													</th>
													<th className='text-left py-3 px-4 font-medium bg-gray-50'>
														Requested Date
													</th>
													<th className='text-left py-3 px-4 font-medium bg-gray-50'>
														Items
													</th>
													<th className='text-left py-3 px-4 font-medium bg-gray-50'>
														Status
													</th>
													<th className='text-left py-3 px-4 font-medium bg-gray-50'>
														Created
													</th>
													<th className='text-right py-3 px-4 font-medium bg-gray-50'>
														Actions
													</th>
												</tr>
											</thead>
											<tbody>
												{orders.map(order => {
													const statusDisplay = getStatusDisplay(order.status)
													return (
														<tr
															key={order._id}
															className='border-b hover:bg-gray-50 transition-colors'
														>
															<td className='py-3 px-4'>
																<div className='flex items-center'>
																	<FileText className='h-4 w-4 text-gray-400 mr-2' />
																	<div className='font-mono text-sm font-medium'>
																		{order.orderNumber}
																	</div>
																</div>
															</td>
															<td className='py-3 px-4 text-sm text-gray-600'>
																{formatDate(order.requestedDate)}
															</td>
															<td className='py-3 px-4'>
																<div className='flex items-center'>
																	<Package className='h-4 w-4 text-gray-400 mr-2' />
																	<span className='text-sm text-gray-600'>
																		{order.items.length} items (
																		{getTotalQuantity(order)} total)
																	</span>
																</div>
															</td>
															<td className='py-3 px-4'>
																<span
																	className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusDisplay.color}`}
																>
																	{statusDisplay.icon}
																	<span className='ml-1'>
																		{statusDisplay.label}
																	</span>
																</span>
															</td>
															<td className='py-3 px-4 text-sm text-gray-600'>
																{formatDate(order.createdAt)}
															</td>
															<td className='py-3 px-4 text-right'>
																<DropdownMenu>
																	<DropdownMenuTrigger asChild>
																		<Button variant='ghost' size='sm'>
																			<MoreHorizontal className='h-4 w-4' />
																		</Button>
																	</DropdownMenuTrigger>
																	<DropdownMenuContent align='end'>
																		<DropdownMenuLabel>
																			Actions
																		</DropdownMenuLabel>
																		<DropdownMenuItem
																			onClick={() => openDetailDialog(order)}
																		>
																			<Eye className='h-4 w-4 mr-2' />
																			View Details
																		</DropdownMenuItem>
																		{order.status === 'pending' && (
																			<DropdownMenuItem
																				onClick={() => handleDeleteOrder(order)}
																				className='text-red-600'
																			>
																				<Trash2 className='h-4 w-4 mr-2' />
																				Delete Order
																			</DropdownMenuItem>
																		)}
																	</DropdownMenuContent>
																</DropdownMenu>
															</td>
														</tr>
													)
												})}
											</tbody>
										</table>
									</div>

									{/* Pagination */}
									{totalPages > 1 && (
										<div className='flex items-center justify-between px-4 py-3 border-t'>
											<div className='text-sm text-gray-500'>
												Showing page {currentPage} of {totalPages} (
												{totalOrders} total orders)
											</div>
											<div className='flex space-x-2'>
												<Button
													variant='outline'
													size='sm'
													disabled={currentPage === 1}
													onClick={() => setCurrentPage(currentPage - 1)}
												>
													Previous
												</Button>
												<Button
													variant='outline'
													size='sm'
													disabled={currentPage === totalPages}
													onClick={() => setCurrentPage(currentPage + 1)}
												>
													Next
												</Button>
											</div>
										</div>
									)}
								</div>
							)}
						</CardContent>
					</Card>

					{/* Order Detail Dialog */}
					<Dialog
						open={isDetailDialogOpen}
						onOpenChange={setIsDetailDialogOpen}
					>
						<DialogContent className='sm:max-w-[600px] max-h-[80vh] overflow-y-auto'>
							<DialogHeader>
								<DialogTitle>Order Details</DialogTitle>
								<DialogDescription>
									{selectedOrder && `Order ${selectedOrder.orderNumber}`}
								</DialogDescription>
							</DialogHeader>
							{selectedOrder && (
								<div className='space-y-6'>
									{/* Order Info */}
									<div className='grid grid-cols-2 gap-4'>
										<div>
											<Label className='text-sm font-medium text-gray-500'>
												Order Number
											</Label>
											<p className='text-sm font-mono'>
												{selectedOrder.orderNumber}
											</p>
										</div>
										<div>
											<Label className='text-sm font-medium text-gray-500'>
												Branch
											</Label>
											<p className='text-sm'>{selectedOrder.branch}</p>
										</div>
										<div>
											<Label className='text-sm font-medium text-gray-500'>
												Requested Date
											</Label>
											<p className='text-sm'>
												{formatDate(selectedOrder.requestedDate)}
											</p>
										</div>
										<div>
											<Label className='text-sm font-medium text-gray-500'>
												Status
											</Label>
											<span
												className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
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
												Created Date
											</Label>
											<p className='text-sm'>
												{formatDate(selectedOrder.createdAt)}
											</p>
										</div>
										{selectedOrder.processedBy && (
											<div>
												<Label className='text-sm font-medium text-gray-500'>
													Processed By
												</Label>
												<p className='text-sm'>
													{selectedOrder.processedBy.username}
												</p>
											</div>
										)}
									</div>

									{/* Order Notes */}
									{selectedOrder.notes && (
										<div>
											<Label className='text-sm font-medium text-gray-500'>
												Order Notes
											</Label>
											<p className='text-sm bg-gray-50 p-3 rounded-md mt-1'>
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
											<p className='text-sm bg-blue-50 p-3 rounded-md mt-1 border-l-4 border-blue-400'>
												{selectedOrder.adminNotes}
											</p>
										</div>
									)}

									{/* Order Items */}
									<div>
										<Label className='text-sm font-medium text-gray-500 mb-3 block'>
											Order Items ({selectedOrder.items.length})
										</Label>
										<div className='space-y-3 max-h-60 overflow-y-auto'>
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
											<span className='text-sm text-gray-600'>
												Total Items:
											</span>
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

									{/* Actions */}
									<div className='flex justify-end space-x-2 pt-4 border-t'>
										<Button
											variant='outline'
											onClick={() => setIsDetailDialogOpen(false)}
										>
											Close
										</Button>
										{selectedOrder.status === 'pending' && (
											<Button
												variant='destructive'
												onClick={() => {
													setIsDetailDialogOpen(false)
													handleDeleteOrder(selectedOrder)
												}}
											>
												<Trash2 className='h-4 w-4 mr-2' />
												Delete Order
											</Button>
										)}
									</div>
								</div>
							)}
						</DialogContent>
					</Dialog>
				</div>
			</DashboardLayout>
		</ProtectedRoute>
	)
}

export default MyOrders
