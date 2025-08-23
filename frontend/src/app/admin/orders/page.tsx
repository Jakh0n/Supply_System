'use client'

import OrdersFilters from '@/components/admin/orders/OrdersFilters'
import OrdersHeader from '@/components/admin/orders/OrdersHeader'
import OrdersTable from '@/components/admin/orders/OrdersTable'
import AdminLayout from '@/components/shared/AdminLayout'
import ProtectedRoute from '@/components/shared/ProtectedRoute'
import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
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
	Package,
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

	const getTotalValue = (order: Order): number => {
		return order.items.reduce(
			(total, item) =>
				total + (item.product?.price ? item.quantity * item.product.price : 0),
			0
		)
	}

	const handleClearFilters = () => {
		setSelectedDate('')
		setBranchFilter('all')
		setStatusFilter('all')
		setCurrentPage(1)
	}

	const handleDateChange = (date: string) => {
		setSelectedDate(date)
		setCurrentPage(1)
	}

	const handleBranchChange = (branch: string) => {
		setBranchFilter(branch)
		setCurrentPage(1)
	}

	const handleStatusChange = (status: OrderStatus | 'all') => {
		setStatusFilter(status)
		setCurrentPage(1)
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
				<div className='space-y-4 sm:space-y-6 p-4 sm:p-6'>
					{/* Header */}
					<OrdersHeader
						onDownloadPDF={handleDownloadPDF}
						selectedDate={selectedDate}
					/>

					{/* Error message */}
					{error && (
						<div className='bg-red-50 border border-red-200 rounded-md p-4'>
							<div className='flex'>
								<AlertCircle className='h-5 w-5 text-red-400 flex-shrink-0' />
								<div className='ml-3'>
									<p className='text-sm text-red-800'>{error}</p>
								</div>
							</div>
						</div>
					)}

					{/* Filters */}
					<OrdersFilters
						selectedDate={selectedDate}
						branchFilter={branchFilter}
						statusFilter={statusFilter}
						branches={branches}
						onDateChange={handleDateChange}
						onBranchChange={handleBranchChange}
						onStatusChange={handleStatusChange}
						onClearFilters={handleClearFilters}
					/>

					{/* Orders Table */}
					<OrdersTable
						orders={orders}
						totalOrders={totalOrders}
						currentPage={currentPage}
						totalPages={totalPages}
						selectedDate={selectedDate}
						branchFilter={branchFilter}
						statusFilter={statusFilter}
						onViewDetails={openDetailDialog}
						onUpdateStatus={openStatusDialog}
						onDownloadOrderPDF={handleDownloadOrderPDF}
						onPageChange={setCurrentPage}
					/>

					{/* Order Detail Dialog */}
					<Dialog
						open={isDetailDialogOpen}
						onOpenChange={setIsDetailDialogOpen}
					>
						<DialogContent className='sm:max-w-[600px] max-h-[80vh] overflow-y-auto mx-4'>
							<DialogHeader>
								<DialogTitle className='text-lg sm:text-xl'>
									Order Details
								</DialogTitle>
								<DialogDescription>
									{selectedOrder && `Order ${selectedOrder.orderNumber}`}
								</DialogDescription>
							</DialogHeader>
							{selectedOrder && (
								<div className='space-y-4'>
									{/* Order Info */}
									<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
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
										<div className='mt-2 space-y-2 max-h-60 overflow-y-auto'>
											{selectedOrder.items.map(item => {
												// Handle null product case
												if (!item.product) {
													return (
														<div
															key={`deleted-${item.quantity}`}
															className='flex flex-col sm:flex-row sm:justify-between sm:items-center p-2 bg-red-50 rounded gap-2'
														>
															<div className='flex-1'>
																<p className='font-medium text-sm text-red-600'>
																	Product Deleted
																</p>
																<p className='text-sm text-red-500'>
																	{item.quantity} × [Product no longer
																	available]
																</p>
																{/* Item notes removed - using order-level notes only */}
															</div>
															<div className='text-right'>
																<p className='font-medium text-sm text-red-600'>
																	N/A
																</p>
															</div>
														</div>
													)
												}

												return (
													<div
														key={item.product._id}
														className='flex flex-col sm:flex-row sm:justify-between sm:items-center p-2 bg-gray-50 rounded gap-2'
													>
														<div className='flex-1'>
															<p className='font-medium text-sm'>
																{item.product.name}
															</p>
															<p className='text-sm text-gray-500'>
																{item.quantity} {item.product.unit} ×{' '}
																{formatKRW(item.product.price)}
															</p>
															{/* Item notes removed - using order-level notes only */}
														</div>
														<div className='text-right'>
															<p className='font-medium text-sm'>
																{formatKRW(item.quantity * item.product.price)}
															</p>
														</div>
													</div>
												)
											})}
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
										<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
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
						<DialogContent className='sm:max-w-[425px] mx-4'>
							<DialogHeader>
								<DialogTitle className='text-lg sm:text-xl'>
									Update Order Status
								</DialogTitle>
								<DialogDescription>
									{selectedOrder &&
										`Update status for order ${selectedOrder.orderNumber}`}
								</DialogDescription>
							</DialogHeader>
							<div className='space-y-4'>
								<div>
									<Label htmlFor='status' className='text-sm font-medium'>
										Status
									</Label>
									<Select
										value={newStatus}
										onValueChange={(value: OrderStatus) => setNewStatus(value)}
									>
										<SelectTrigger className='mt-1'>
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
									<Label htmlFor='admin-notes' className='text-sm font-medium'>
										Admin Notes
									</Label>
									<textarea
										id='admin-notes'
										value={adminNotes}
										onChange={e => setAdminNotes(e.target.value)}
										placeholder='Add notes about this status change...'
										rows={3}
										className='flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1'
									/>
								</div>
								<div className='flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2'>
									<Button
										type='button'
										variant='outline'
										onClick={() => setIsStatusDialogOpen(false)}
										className='w-full sm:w-auto'
									>
										Cancel
									</Button>
									<Button
										onClick={handleStatusUpdate}
										disabled={updatingStatus}
										className='w-full sm:w-auto'
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
