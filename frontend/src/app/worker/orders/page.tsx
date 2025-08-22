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
import { ProductThumbnail } from '@/components/ui/ProductImage'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { useAuth } from '@/contexts/AuthContext'
import { ordersApi } from '@/lib/api'
import { getPrimaryImage } from '@/lib/imageUtils'
import { Order, OrderStatus } from '@/types'
import {
	AlertCircle,
	CheckCircle,
	Clock,
	Edit,
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
import { useRouter } from 'next/navigation'
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
				icon: <Clock className='h-3 w-3 sm:h-4 sm:w-4' />,
			}
		case 'approved':
			return {
				label: 'Approved',
				color: 'bg-green-100 text-green-800',
				icon: <CheckCircle className='h-3 w-3 sm:h-4 sm:w-4' />,
			}
		case 'rejected':
			return {
				label: 'Rejected',
				color: 'bg-red-100 text-red-800',
				icon: <XCircle className='h-3 w-3 sm:h-4 sm:w-4' />,
			}
		case 'completed':
			return {
				label: 'Completed',
				color: 'bg-blue-100 text-blue-800',
				icon: <Truck className='h-3 w-3 sm:h-4 sm:w-4' />,
			}
		default:
			return {
				label: 'Unknown',
				color: 'bg-gray-100 text-gray-800',
				icon: <AlertCircle className='h-3 w-3 sm:h-4 sm:w-4' />,
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
	const router = useRouter()

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

	const clearFilters = () => {
		setSelectedDate('')
		setStatusFilter('all')
		setCurrentPage(1)
	}

	const hasActiveFilters = selectedDate || statusFilter !== 'all'

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
				<div className='space-y-4 sm:space-y-6'>
					{/* Header */}
					<div className='flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4'>
						<div className='min-w-0 flex-1'>
							<h1 className='text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900'>
								My Orders
							</h1>
							<p className='mt-1 sm:mt-2 text-sm sm:text-base text-gray-600'>
								Track and manage your supply requests
								{user?.branch && ` for ${user.branch}`}
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

					{/* Filters */}
					<Card className='hidden sm:block'>
						<CardHeader className='p-4 sm:p-6'>
							<CardTitle className='text-base sm:text-lg'>
								Filter Orders
							</CardTitle>
							<CardDescription className='text-sm'>
								Filter your orders by date and status
							</CardDescription>
						</CardHeader>
						<CardContent className='p-4 sm:p-6 pt-0 space-y-4'>
							<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
								<div className='space-y-2'>
									<Label htmlFor='date-filter' className='text-sm font-medium'>
										Filter by Date
									</Label>
									<Input
										id='date-filter'
										type='date'
										value={selectedDate}
										onChange={e => {
											setSelectedDate(e.target.value)
											setCurrentPage(1)
										}}
										className='h-10'
									/>
								</div>
								<div className='space-y-2'>
									<Label
										htmlFor='status-filter'
										className='text-sm font-medium'
									>
										Filter by Status
									</Label>
									<Select
										value={statusFilter}
										onValueChange={(value: OrderStatus | 'all') => {
											setStatusFilter(value)
											setCurrentPage(1)
										}}
									>
										<SelectTrigger className='h-10'>
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
								<div className='flex flex-col justify-end'>
									<Button
										variant='outline'
										onClick={clearFilters}
										disabled={!hasActiveFilters}
										className='h-10 w-full sm:w-auto'
									>
										Clear Filters
									</Button>
								</div>
							</div>

							{/* Active Filters Display */}
							{hasActiveFilters && (
								<div className='flex flex-wrap gap-2 pt-2 border-t border-gray-200'>
									<p className='text-xs text-gray-500 w-full sm:w-auto'>
										Active filters:
									</p>
									{selectedDate && (
										<span className='inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800'>
											Date: {formatDate(selectedDate)}
										</span>
									)}
									{statusFilter !== 'all' && (
										<span className='inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800'>
											Status:{' '}
											{statusFilter.charAt(0).toUpperCase() +
												statusFilter.slice(1)}
										</span>
									)}
								</div>
							)}
						</CardContent>
					</Card>

					{/* Mobile Compact Filters */}
					<div className='sm:hidden'>
						<div className='flex gap-2'>
							<div className='flex-1'>
								<Select
									value={statusFilter}
									onValueChange={(value: OrderStatus | 'all') => {
										setStatusFilter(value)
										setCurrentPage(1)
									}}
								>
									<SelectTrigger className='h-9 text-xs'>
										<SelectValue placeholder='All Status' />
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
							<div className='flex-1'>
								<Input
									type='date'
									value={selectedDate}
									onChange={e => {
										setSelectedDate(e.target.value)
										setCurrentPage(1)
									}}
									className='h-9 text-xs'
									placeholder='Filter by date'
								/>
							</div>
							{hasActiveFilters && (
								<Button
									variant='outline'
									size='sm'
									onClick={clearFilters}
									className='h-9 px-2 text-xs'
								>
									Clear
								</Button>
							)}
						</div>

						{/* Mobile Create Order Button */}
						<div className='mt-3'>
							<Link href='/worker/new-order' className='block'>
								<Button className='w-full h-10 bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm hover:shadow-md transition-all duration-200'>
									<Plus className='h-4 w-4 mr-2' />
									Create New Order
								</Button>
							</Link>
						</div>

						{/* Mobile Active Filters Display */}
						{hasActiveFilters && (
							<div className='flex flex-wrap gap-1 mt-2'>
								{selectedDate && (
									<span className='inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-blue-100 text-blue-800'>
										{formatDate(selectedDate)}
									</span>
								)}
								{statusFilter !== 'all' && (
									<span className='inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-green-100 text-green-800'>
										{statusFilter.charAt(0).toUpperCase() +
											statusFilter.slice(1)}
									</span>
								)}
							</div>
						)}
					</div>

					{/* Orders List */}
					<Card>
						<CardHeader className='p-4 sm:p-6'>
							<CardTitle className='text-base sm:text-lg'>
								Your Orders ({totalOrders})
							</CardTitle>
							<CardDescription className='text-sm'>
								All your supply requests and their current status
							</CardDescription>
						</CardHeader>
						<CardContent className='p-4 sm:p-6 pt-0'>
							{orders.length === 0 ? (
								<div className='text-center py-8 sm:py-12'>
									<ShoppingCart className='h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-4' />
									<h3 className='text-base sm:text-lg font-medium text-gray-900 mb-2'>
										No orders found
									</h3>
									<p className='text-sm sm:text-base text-gray-500 mb-6'>
										{hasActiveFilters
											? 'Try adjusting your filters to see more orders'
											: "You haven't created any orders yet"}
									</p>
									<Link href='/worker/new-order'>
										<Button className='w-full sm:w-auto'>
											<Plus className='h-4 w-4 mr-2' />
											{hasActiveFilters
												? 'Create New Order'
												: 'Create Your First Order'}
										</Button>
									</Link>
								</div>
							) : (
								<div className='space-y-3 sm:space-y-4'>
									{/* Desktop Table View - Hidden on Mobile */}
									<div className='hidden lg:block'>
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
															const statusDisplay = getStatusDisplay(
																order.status
															)
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
																					onClick={() =>
																						openDetailDialog(order)
																					}
																				>
																					<Eye className='h-4 w-4 mr-2' />
																					View Details
																				</DropdownMenuItem>
																				{order.status === 'pending' && (
																					<>
																						<DropdownMenuItem
																							onClick={() =>
																								router.push(
																									`/worker/orders/${order._id}/edit`
																								)
																							}
																						>
																							<Edit className='h-4 w-4 mr-2' />
																							Edit Order
																						</DropdownMenuItem>
																						<DropdownMenuItem
																							onClick={() =>
																								handleDeleteOrder(order)
																							}
																							className='text-red-600'
																						>
																							<Trash2 className='h-4 w-4 mr-2' />
																							Delete Order
																						</DropdownMenuItem>
																					</>
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
										</div>
									</div>

									{/* Mobile Card View - Shown on Mobile & Tablet */}
									<div className='lg:hidden space-y-3'>
										{orders.map(order => {
											const statusDisplay = getStatusDisplay(order.status)
											return (
												<Card
													key={order._id}
													className='hover:shadow-md transition-shadow'
												>
													<CardContent className='p-4'>
														<div className='space-y-3'>
															{/* Order Header */}
															<div className='flex items-start justify-between'>
																<div className='flex items-center min-w-0 flex-1'>
																	<div className='p-2 bg-gray-100 rounded-lg mr-3 flex-shrink-0'>
																		<FileText className='h-4 w-4 text-gray-600' />
																	</div>
																	<div className='min-w-0 flex-1'>
																		<p className='font-mono text-sm font-medium truncate'>
																			{order.orderNumber}
																		</p>
																		<p className='text-xs text-gray-500'>
																			{formatDate(order.requestedDate)}
																		</p>
																	</div>
																</div>
																<span
																	className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${statusDisplay.color}`}
																>
																	{statusDisplay.icon}
																	<span className='ml-1'>
																		{statusDisplay.label}
																	</span>
																</span>
															</div>

															{/* Order Details */}
															<div className='flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100'>
																<div className='flex items-center'>
																	<Package className='h-3 w-3 mr-1' />
																	<span>
																		{order.items.length} items •{' '}
																		{getTotalQuantity(order)} total
																	</span>
																</div>
																<span>
																	Created {formatDate(order.createdAt)}
																</span>
															</div>

															{/* Actions */}
															<div className='flex gap-2 pt-2'>
																<Button
																	variant='outline'
																	size='sm'
																	onClick={() => openDetailDialog(order)}
																	className='flex-1 text-xs h-8'
																>
																	<Eye className='h-3 w-3 mr-1' />
																	View Details
																</Button>
																{order.status === 'pending' && (
																	<>
																		<Button
																			variant='outline'
																			size='sm'
																			onClick={() =>
																				router.push(
																					`/worker/orders/${order._id}/edit`
																				)
																			}
																			className='flex-1 text-xs h-8'
																		>
																			<Edit className='h-3 w-3 mr-1' />
																			Edit
																		</Button>
																		<Button
																			variant='outline'
																			size='sm'
																			onClick={() => handleDeleteOrder(order)}
																			className='text-red-600 hover:text-red-700 hover:bg-red-50 text-xs h-8 px-3'
																		>
																			<Trash2 className='h-3 w-3' />
																		</Button>
																	</>
																)}
															</div>
														</div>
													</CardContent>
												</Card>
											)
										})}
									</div>

									{/* Pagination */}
									{totalPages > 1 && (
										<div className='flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-200'>
											<div className='text-xs sm:text-sm text-gray-500 text-center sm:text-left'>
												Showing page {currentPage} of {totalPages} (
												{totalOrders} total orders)
											</div>
											<div className='flex space-x-2'>
												<Button
													variant='outline'
													size='sm'
													disabled={currentPage === 1}
													onClick={() => setCurrentPage(currentPage - 1)}
													className='text-xs sm:text-sm'
												>
													Previous
												</Button>
												<Button
													variant='outline'
													size='sm'
													disabled={currentPage === totalPages}
													onClick={() => setCurrentPage(currentPage + 1)}
													className='text-xs sm:text-sm'
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
										{selectedOrder.processedBy && (
											<div className='space-y-1'>
												<Label className='text-xs sm:text-sm font-medium text-gray-500'>
													Processed By
												</Label>
												<p className='text-sm sm:text-base'>
													{selectedOrder.processedBy.username}
												</p>
											</div>
										)}
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
																					{selectedOrder.items.map((item, index) => {
											if (!item.product) {
												return (
													<div
														key={`deleted-${index}`}
														className='flex items-center justify-between p-2 sm:p-3 bg-red-50 rounded-lg border border-red-200'
													>
														<div className='flex-1 min-w-0'>
															<div className='flex items-center'>
																<div className='w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0 mr-2 bg-red-100 rounded-lg flex items-center justify-center'>
																	<Package className='h-4 w-4 text-red-500' />
																</div>
																<div className='min-w-0 flex-1'>
																	<p className='font-medium text-xs sm:text-sm truncate text-red-600'>
																		Product Deleted
																	</p>
																	<p className='text-xs text-red-500 truncate'>
																		Product no longer available
																	</p>
																	{item.notes && (
																		<p className='text-xs text-red-600 mt-1 italic line-clamp-2'>
																			Note: {item.notes}
																		</p>
																	)}
																</div>
															</div>
														</div>
														<div className='text-right flex-shrink-0 ml-2'>
															<p className='font-medium text-xs sm:text-sm text-red-600'>
																{item.quantity} unit
															</p>
														</div>
													</div>
												)
											}

											return (
												<div
													key={item.product._id}
													className='flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg'
												>
													<div className='flex-1 min-w-0'>
														<div className='flex items-center'>
															<div className='w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0 mr-2'>
																<ProductThumbnail
																	src={getPrimaryImage(item.product)}
																	alt={item.product.name}
																	category={item.product.category}
																	size='sm'
																	className='rounded-lg'
																/>
															</div>
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
											)
										})}
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
											onClick={() => setIsDetailDialogOpen(false)}
											className='w-full sm:w-auto order-2 sm:order-1'
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
												className='w-full sm:w-auto order-1 sm:order-2'
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
