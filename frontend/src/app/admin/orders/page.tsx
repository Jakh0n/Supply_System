'use client'

import AdminLayout from '@/components/shared/AdminLayout'
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
import { ordersApi, usersApi } from '@/lib/api'
import { PDFGenerator } from '@/lib/pdfGenerator'
import { Order, OrderStatus } from '@/types'
import {
	AlertCircle,
	CheckCircle,
	Clock,
	Download,
	Eye,
	FileText,
	MoreHorizontal,
	Package,
	ShoppingCart,
	Truck,
	XCircle,
} from 'lucide-react'
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

// Helper function to format Korean Won
const formatKRW = (price: number): string => {
	return new Intl.NumberFormat('ko-KR', {
		style: 'currency',
		currency: 'KRW',
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(price)
}

// Helper function to get status color and icon
const getStatusDisplay = (status: OrderStatus) => {
	switch (status) {
		case 'pending':
			return {
				color: 'bg-yellow-100 text-yellow-800',
				icon: <Clock className='h-4 w-4' />,
				label: 'Pending',
			}
		case 'approved':
			return {
				color: 'bg-blue-100 text-blue-800',
				icon: <CheckCircle className='h-4 w-4' />,
				label: 'Approved',
			}
		case 'rejected':
			return {
				color: 'bg-red-100 text-red-800',
				icon: <XCircle className='h-4 w-4' />,
				label: 'Rejected',
			}
		case 'completed':
			return {
				color: 'bg-green-100 text-green-800',
				icon: <Truck className='h-4 w-4' />,
				label: 'Completed',
			}
		default:
			return {
				color: 'bg-gray-100 text-gray-800',
				icon: <Package className='h-4 w-4' />,
				label: status,
			}
	}
}

const OrdersManagement: React.FC = () => {
	const [orders, setOrders] = useState<Order[]>([])
	const [branches, setBranches] = useState<string[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')
	const [selectedDate, setSelectedDate] = useState('')
	const [branchFilter, setBranchFilter] = useState<string>('all')
	const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all')
	const [currentPage, setCurrentPage] = useState(1)
	const [totalPages, setTotalPages] = useState(1)
	const [totalOrders, setTotalOrders] = useState(0)
	const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
	const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
	const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false)
	const [newStatus, setNewStatus] = useState<OrderStatus>('pending')
	const [adminNotes, setAdminNotes] = useState('')
	const [updatingStatus, setUpdatingStatus] = useState(false)

	// Fetch branches
	const fetchBranches = useCallback(async () => {
		try {
			const response = await usersApi.getBranches()
			setBranches(response.branches)
		} catch (err) {
			console.error('Failed to fetch branches:', err)
		}
	}, [])

	// Fetch orders
	const fetchOrders = useCallback(async () => {
		try {
			setLoading(true)
			const response = await ordersApi.getOrders({
				date: selectedDate || undefined,
				branch: branchFilter !== 'all' ? branchFilter : undefined,
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
	}, [selectedDate, branchFilter, statusFilter, currentPage])

	useEffect(() => {
		fetchBranches()
	}, [fetchBranches])

	useEffect(() => {
		fetchOrders()
	}, [fetchOrders])

	const handleStatusUpdate = async () => {
		if (!selectedOrder) return

		try {
			setUpdatingStatus(true)
			const response = await ordersApi.updateOrderStatus(
				selectedOrder._id,
				newStatus,
				adminNotes || undefined
			)

			setOrders(prev =>
				prev.map(order =>
					order._id === selectedOrder._id ? response.order : order
				)
			)

			setIsStatusDialogOpen(false)
			setSelectedOrder(null)
			setAdminNotes('')
			toast.success('Order status updated successfully')
		} catch (err: unknown) {
			const error = err as { response?: { data?: { message?: string } } }
			toast.error(
				error.response?.data?.message || 'Failed to update order status'
			)
		} finally {
			setUpdatingStatus(false)
		}
	}

	const handleDownloadPDF = async () => {
		if (!selectedDate) {
			toast.error('Please select a date to download PDF')
			return
		}

		try {
			// Fetch orders for the selected date and branch
			const response = await ordersApi.getOrders({
				date: selectedDate,
				branch: branchFilter !== 'all' ? branchFilter : undefined,
				limit: 1000, // Get all orders for the date
			})

			if (response.orders.length === 0) {
				toast.error('No orders found for the selected date')
				return
			}

			// Generate PDF using the new PDFGenerator
			await PDFGenerator.generateOrdersPDF(response.orders, {
				title: `Orders Report - ${selectedDate}${
					branchFilter !== 'all' ? ` (${branchFilter} Branch)` : ''
				}`,
				orientation: 'portrait',
				format: 'a4',
			})

			toast.success(
				`PDF generated successfully with ${response.orders.length} orders`
			)
		} catch (err: unknown) {
			const error = err as { response?: { data?: { message?: string } } }
			toast.error(error.response?.data?.message || 'Failed to generate PDF')
			console.error('PDF generation error:', err)
		}
	}

	const handleDownloadOrderPDF = async (order: Order) => {
		try {
			await PDFGenerator.generateOrderDetailPDF(order)
			toast.success(`PDF generated for order ${order.orderNumber}`)
		} catch (error) {
			console.error('Order PDF generation error:', error)
			toast.error('Failed to generate order PDF')
		}
	}

	const openStatusDialog = (order: Order) => {
		setSelectedOrder(order)
		setNewStatus(order.status)
		setAdminNotes(order.adminNotes || '')
		setIsStatusDialogOpen(true)
	}

	const openDetailDialog = (order: Order) => {
		setSelectedOrder(order)
		setIsDetailDialogOpen(true)
	}

	const getTotalQuantity = (order: Order): number => {
		return order.items.reduce((total, item) => total + item.quantity, 0)
	}

	const getTotalValue = (order: Order): number => {
		return order.items.reduce(
			(total, item) => total + item.quantity * item.product.price,
			0
		)
	}

	if (loading && orders.length === 0) {
		return (
			<ProtectedRoute requiredRole='admin'>
				<AdminLayout>
					<div className='flex items-center justify-center h-64'>
						<div className='text-center'>
							<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto'></div>
							<p className='mt-4 text-gray-600'>Loading orders...</p>
						</div>
					</div>
				</AdminLayout>
			</ProtectedRoute>
		)
	}

	return (
		<ProtectedRoute requiredRole='admin'>
			<AdminLayout>
				<div className='space-y-6'>
					{/* Header */}
					<div className='flex justify-between items-center'>
						<div>
							<h1 className='text-2xl font-bold text-gray-900'>
								Orders Management
							</h1>
							<p className='mt-2 text-gray-600'>
								Manage and track all restaurant supply orders
							</p>
						</div>
						<Button
							onClick={handleDownloadPDF}
							disabled={!selectedDate}
							variant='outline'
						>
							<Download className='h-4 w-4 mr-2' />
							Download PDF
						</Button>
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
							<CardTitle>Filters</CardTitle>
						</CardHeader>
						<CardContent>
							<div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
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
									<Label htmlFor='branch-filter'>Branch</Label>
									<Select
										value={branchFilter}
										onValueChange={value => {
											setBranchFilter(value)
											setCurrentPage(1)
										}}
									>
										<SelectTrigger>
											<SelectValue placeholder='All branches' />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value='all'>All Branches</SelectItem>
											{branches.map(branch => (
												<SelectItem key={branch} value={branch}>
													{branch}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
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
											setBranchFilter('all')
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
							<CardTitle>Orders ({totalOrders})</CardTitle>
							<CardDescription>
								Manage order requests from all branches
							</CardDescription>
						</CardHeader>
						<CardContent>
							{orders.length === 0 ? (
								<div className='text-center py-8'>
									<ShoppingCart className='h-12 w-12 text-gray-400 mx-auto mb-4' />
									<p className='text-gray-500'>No orders found</p>
									<p className='text-sm text-gray-400 mt-1'>
										{selectedDate ||
										branchFilter !== 'all' ||
										statusFilter !== 'all'
											? 'Try adjusting your filters'
											: 'No orders have been created yet'}
									</p>
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
														Worker
													</th>
													<th className='text-left py-3 px-4 font-medium bg-gray-50'>
														Branch
													</th>
													<th className='text-left py-3 px-4 font-medium bg-gray-50'>
														Requested Date
													</th>
													<th className='text-left py-3 px-4 font-medium bg-gray-50'>
														Items
													</th>
													<th className='text-left py-3 px-4 font-medium bg-gray-50'>
														Total Value
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
																<div className='font-mono text-sm'>
																	{order.orderNumber}
																</div>
															</td>
															<td className='py-3 px-4'>
																<div>
																	<p className='font-medium'>
																		{order.worker.username}
																	</p>
																</div>
															</td>
															<td className='py-3 px-4'>
																<span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800'>
																	{order.branch}
																</span>
															</td>
															<td className='py-3 px-4 text-sm text-gray-600'>
																{formatDate(order.requestedDate)}
															</td>
															<td className='py-3 px-4 text-sm text-gray-600'>
																{order.items.length} items (
																{getTotalQuantity(order)} total)
															</td>
															<td className='py-3 px-4 text-sm text-gray-600'>
																{formatKRW(getTotalValue(order))}
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
																		<DropdownMenuItem
																			onClick={() => openStatusDialog(order)}
																		>
																			<FileText className='h-4 w-4 mr-2' />
																			Update Status
																		</DropdownMenuItem>
																		<DropdownMenuItem
																			onClick={() =>
																				handleDownloadOrderPDF(order)
																			}
																		>
																			<Download className='h-4 w-4 mr-2' />
																			Download Order PDF
																		</DropdownMenuItem>
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
								<div className='space-y-4'>
									{/* Order Info */}
									<div className='grid grid-cols-2 gap-4'>
										<div>
											<Label className='text-sm font-medium text-gray-500'>
												Worker
											</Label>
											<p className='text-sm'>{selectedOrder.worker.username}</p>
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
									</div>

									{/* Order Items */}
									<div>
										<Label className='text-sm font-medium text-gray-500'>
											Items
										</Label>
										<div className='mt-2 space-y-2'>
											{selectedOrder.items.map(item => (
												<div
													key={item.product._id}
													className='flex justify-between items-center p-2 bg-gray-50 rounded'
												>
													<div>
														<p className='font-medium'>{item.product.name}</p>
														<p className='text-sm text-gray-500'>
															{item.quantity} {item.product.unit} ×{' '}
															{formatKRW(item.product.price)}
														</p>
														{item.notes && (
															<p className='text-sm text-gray-400 italic'>
																Note: {item.notes}
															</p>
														)}
													</div>
													<div className='text-right'>
														<p className='font-medium'>
															{formatKRW(item.quantity * item.product.price)}
														</p>
													</div>
												</div>
											))}
										</div>
										<div className='mt-2 pt-2 border-t'>
											<div className='flex justify-between font-medium'>
												<span>Total Value:</span>
												<span>{formatKRW(getTotalValue(selectedOrder))}</span>
											</div>
										</div>
									</div>

									{/* Notes */}
									{selectedOrder.notes && (
										<div>
											<Label className='text-sm font-medium text-gray-500'>
												Worker Notes
											</Label>
											<p className='text-sm mt-1 p-2 bg-gray-50 rounded'>
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
											<p className='text-sm mt-1 p-2 bg-blue-50 rounded'>
												{selectedOrder.adminNotes}
											</p>
										</div>
									)}

									{/* Processing Info */}
									{selectedOrder.processedBy && (
										<div className='grid grid-cols-2 gap-4'>
											<div>
												<Label className='text-sm font-medium text-gray-500'>
													Processed By
												</Label>
												<p className='text-sm'>
													{selectedOrder.processedBy.username}
												</p>
											</div>
											<div>
												<Label className='text-sm font-medium text-gray-500'>
													Processed At
												</Label>
												<p className='text-sm'>
													{selectedOrder.processedAt &&
														formatDate(selectedOrder.processedAt)}
												</p>
											</div>
										</div>
									)}
								</div>
							)}
						</DialogContent>
					</Dialog>

					{/* Status Update Dialog */}
					<Dialog
						open={isStatusDialogOpen}
						onOpenChange={setIsStatusDialogOpen}
					>
						<DialogContent className='sm:max-w-[425px]'>
							<DialogHeader>
								<DialogTitle>Update Order Status</DialogTitle>
								<DialogDescription>
									{selectedOrder &&
										`Update status for order ${selectedOrder.orderNumber}`}
								</DialogDescription>
							</DialogHeader>
							<div className='space-y-4'>
								<div>
									<Label htmlFor='status'>Status</Label>
									<Select
										value={newStatus}
										onValueChange={(value: OrderStatus) => setNewStatus(value)}
									>
										<SelectTrigger>
											<SelectValue placeholder='Select status' />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value='pending'>Pending</SelectItem>
											<SelectItem value='approved'>Approved</SelectItem>
											<SelectItem value='rejected'>Rejected</SelectItem>
											<SelectItem value='completed'>Completed</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div>
									<Label htmlFor='admin-notes'>Admin Notes</Label>
									<textarea
										id='admin-notes'
										value={adminNotes}
										onChange={e => setAdminNotes(e.target.value)}
										placeholder='Add notes about this status change...'
										rows={3}
										className='flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
									/>
								</div>
								<div className='flex justify-end space-x-2'>
									<Button
										type='button'
										variant='outline'
										onClick={() => setIsStatusDialogOpen(false)}
									>
										Cancel
									</Button>
									<Button
										onClick={handleStatusUpdate}
										disabled={updatingStatus}
									>
										{updatingStatus ? 'Updating...' : 'Update Status'}
									</Button>
								</div>
							</div>
						</DialogContent>
					</Dialog>
				</div>
			</AdminLayout>
		</ProtectedRoute>
	)
}

export default OrdersManagement
