'use client'

import DashboardLayout from '@/components/shared/DashboardLayout'
import ProtectedRoute from '@/components/shared/ProtectedRoute'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import { ordersApi, usersApi } from '@/lib/api'
import { Order, OrderStatus } from '@/types'
import {
	AlertCircle,
	Calendar,
	CheckCircle,
	CheckCircle2,
	Clock,
	Eye,
	Filter,
	Package,
	RefreshCw,
	RotateCcw,
	ShoppingCart,
	Users,
	X,
	XCircle,
} from 'lucide-react'
import React, { useCallback, useEffect, useState } from 'react'

// Helper functions
const formatDate = (dateString: string): string => {
	return new Date(dateString).toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
	})
}

const formatKRW = (price: number): string => {
	return new Intl.NumberFormat('ko-KR', {
		style: 'currency',
		currency: 'KRW',
		minimumFractionDigits: 0,
	}).format(price)
}

const getStatusDisplay = (status: OrderStatus) => {
	switch (status) {
		case 'pending':
			return {
				color: 'bg-yellow-100 text-yellow-700',
				icon: <Clock className='h-4 w-4' />,
				label: 'Pending',
			}
		case 'approved':
			return {
				color: 'bg-green-100 text-green-700',
				icon: <CheckCircle className='h-4 w-4' />,
				label: 'Approved',
			}
		case 'rejected':
			return {
				color: 'bg-red-100 text-red-700',
				icon: <XCircle className='h-4 w-4' />,
				label: 'Rejected',
			}
		case 'completed':
			return {
				color: 'bg-blue-100 text-blue-700',
				icon: <Package className='h-4 w-4' />,
				label: 'Completed',
			}
		default:
			return {
				color: 'bg-gray-100 text-gray-700',
				icon: <Package className='h-4 w-4' />,
				label: status,
			}
	}
}

const WorkerAllOrders: React.FC = () => {
	const [orders, setOrders] = useState<Order[]>([])
	const [branches, setBranches] = useState<string[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')

	// Filter states
	const [selectedDate, setSelectedDate] = useState('')
	const [branchFilter, setBranchFilter] = useState<string>('all')
	const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all')
	const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)

	// Pagination
	const [currentPage, setCurrentPage] = useState(1)
	const [totalPages, setTotalPages] = useState(1)
	const [totalOrders, setTotalOrders] = useState(0)

	// Modal
	const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
	const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)

	// Fetch branches
	const fetchBranches = useCallback(async () => {
		try {
			const response = await usersApi.getBranches()
			setBranches(response.branches)
		} catch (err) {
			console.error('Failed to fetch branches:', err)
		}
	}, [])

	// Fetch all orders
	const fetchAllOrders = useCallback(async () => {
		try {
			setLoading(true)
			console.log('🔍 [FRONTEND DEBUG] Fetching all orders with params:', {
				date: selectedDate || undefined,
				branch: branchFilter !== 'all' ? branchFilter : undefined,
				status: statusFilter !== 'all' ? statusFilter : undefined,
				page: currentPage,
				limit: 15,
				viewAll: 'true',
			})

			const response = await ordersApi.getOrders({
				date: selectedDate || undefined,
				branch: branchFilter !== 'all' ? branchFilter : undefined,
				status: statusFilter !== 'all' ? statusFilter : undefined,
				page: currentPage,
				limit: 15,
				viewAll: 'true', // Special parameter to allow workers to see all orders
			})

			console.log('✅ [FRONTEND DEBUG] Response received:', {
				ordersCount: response.orders.length,
				totalOrders: response.pagination.total,
				currentPage: response.pagination.current,
				totalPages: response.pagination.pages,
			})

			setOrders(response.orders)
			setTotalPages(response.pagination.pages)
			setTotalOrders(response.pagination.total)
			setError('')
		} catch (err) {
			console.error('❌ [FRONTEND DEBUG] Orders fetch error:', err)
			setError(
				`Failed to load orders: ${
					err instanceof Error ? err.message : 'Unknown error'
				}`
			)
		} finally {
			setLoading(false)
		}
	}, [selectedDate, branchFilter, statusFilter, currentPage])

	useEffect(() => {
		fetchBranches()
	}, [fetchBranches])

	useEffect(() => {
		fetchAllOrders()
	}, [fetchAllOrders])

	// Filter functions
	const getTodayDate = () => {
		return new Date().toISOString().split('T')[0]
	}

	const getYesterdayDate = () => {
		const yesterday = new Date()
		yesterday.setDate(yesterday.getDate() - 1)
		return yesterday.toISOString().split('T')[0]
	}

	const getThisWeekStart = () => {
		const today = new Date()
		const dayOfWeek = today.getDay() // 0 = Sunday, 1 = Monday, etc.
		const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1 // Start from Monday
		const weekStart = new Date(today)
		weekStart.setDate(today.getDate() - daysToSubtract)
		return weekStart.toISOString().split('T')[0]
	}

	const applyQuickFilter = (filterType: string) => {
		console.log('🔄 [FILTER DEBUG] Applying quick filter:', filterType)

		switch (filterType) {
			case 'today':
				const todayDate = getTodayDate()
				console.log('📅 [FILTER DEBUG] Setting today date:', todayDate)
				setSelectedDate(todayDate)
				setStatusFilter('all') // Clear status filter when applying date filter
				break
			case 'yesterday':
				const yesterdayDate = getYesterdayDate()
				console.log('📅 [FILTER DEBUG] Setting yesterday date:', yesterdayDate)
				setSelectedDate(yesterdayDate)
				setStatusFilter('all')
				break
			case 'thisWeek':
				const weekStartDate = getThisWeekStart()
				console.log('📅 [FILTER DEBUG] Setting week start date:', weekStartDate)
				setSelectedDate(weekStartDate)
				setStatusFilter('all')
				break
			case 'pending':
				console.log('🔄 [FILTER DEBUG] Setting status to pending')
				setStatusFilter('pending')
				setSelectedDate('')
				break
			case 'approved':
				console.log('✅ [FILTER DEBUG] Setting status to approved')
				setStatusFilter('approved')
				setSelectedDate('')
				break
		}
		setCurrentPage(1)
	}

	const clearFilters = () => {
		console.log('🧹 [FILTER DEBUG] Clearing all filters')
		setSelectedDate('')
		setBranchFilter('all')
		setStatusFilter('all')
		setCurrentPage(1)
	}

	const activeFiltersCount =
		(selectedDate ? 1 : 0) +
		(branchFilter !== 'all' ? 1 : 0) +
		(statusFilter !== 'all' ? 1 : 0)

	// Helper function to check if a filter is active
	const isFilterActive = (filterType: string): boolean => {
		switch (filterType) {
			case 'today':
				return selectedDate === getTodayDate()
			case 'yesterday':
				return selectedDate === getYesterdayDate()
			case 'thisWeek':
				return selectedDate === getThisWeekStart()
			case 'pending':
				return statusFilter === 'pending'
			case 'approved':
				return statusFilter === 'approved'
			default:
				return false
		}
	}

	const quickFilters = [
		{
			label: 'Today',
			action: () => applyQuickFilter('today'),
			icon: Calendar,
			color: 'bg-blue-500',
			filterType: 'today',
		},
		{
			label: 'Yesterday',
			action: () => applyQuickFilter('yesterday'),
			icon: Calendar,
			color: 'bg-gray-500',
			filterType: 'yesterday',
		},
		{
			label: 'This Week',
			action: () => applyQuickFilter('thisWeek'),
			icon: Calendar,
			color: 'bg-purple-500',
			filterType: 'thisWeek',
		},
		{
			label: 'Pending',
			action: () => applyQuickFilter('pending'),
			icon: Clock,
			color: 'bg-yellow-500',
			filterType: 'pending',
		},
		{
			label: 'Approved',
			action: () => applyQuickFilter('approved'),
			icon: CheckCircle2,
			color: 'bg-green-500',
			filterType: 'approved',
		},
	]

	const openDetailDialog = (order: Order) => {
		setSelectedOrder(order)
		setIsDetailDialogOpen(true)
	}

	const getTotalQuantity = (order: Order): number => {
		return order.items.reduce((total, item) => total + item.quantity, 0)
	}

	const getTotalValue = (order: Order): number => {
		return order.items.reduce(
			(total, item) =>
				total + (item.product?.price ? item.quantity * item.product.price : 0),
			0
		)
	}

	return (
		<ProtectedRoute requiredRole='worker'>
			<DashboardLayout>
				<div className='space-y-4 sm:space-y-6'>
					{/* Header */}
					<div className='flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4'>
						<div className='min-w-0 flex-1'>
							<h1 className='text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 flex items-center gap-3'>
								<Users className='h-7 w-7 text-blue-600' />
								All Team Orders
							</h1>
							<p className='mt-1 sm:mt-2 text-sm sm:text-base text-gray-600'>
								View orders from all workers across all branches - read-only
								access for coordination
							</p>
						</div>
						<Button
							onClick={fetchAllOrders}
							variant='outline'
							className='flex items-center gap-2'
							disabled={loading}
						>
							<RefreshCw
								className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}
							/>
							Refresh
						</Button>
					</div>

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

					{/* UX-Friendly Filters */}
					<div className='space-y-4'>
						{/* Quick Filters Bar */}
						<div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
							<div className='flex flex-wrap items-center gap-2'>
								<span className='text-sm font-medium text-gray-700'>
									Quick filters:
								</span>
								{quickFilters.map((filter, index) => {
									const isActive = isFilterActive(filter.filterType)
									return (
										<Button
											key={index}
											onClick={filter.action}
											variant={isActive ? 'default' : 'outline'}
											size='sm'
											className={`h-8 px-3 text-xs font-medium transition-colors ${
												isActive
													? 'bg-blue-600 text-white hover:bg-blue-700'
													: 'hover:bg-gray-50'
											}`}
										>
											<filter.icon className='h-3 w-3 mr-1' />
											{filter.label}
										</Button>
									)
								})}
							</div>
							<div className='flex items-center gap-2'>
								<Button
									onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
									variant='outline'
									size='sm'
									className='h-8 px-3'
								>
									<Filter className='h-4 w-4 mr-2' />
									Advanced {activeFiltersCount > 0 && `(${activeFiltersCount})`}
								</Button>
								{activeFiltersCount > 0 && (
									<Button
										onClick={clearFilters}
										variant='ghost'
										size='sm'
										className='h-8 px-3 text-gray-500 hover:text-gray-700'
									>
										<RotateCcw className='h-4 w-4 mr-1' />
										Clear
									</Button>
								)}
							</div>
						</div>

						{/* Active Filters Display */}
						{activeFiltersCount > 0 && (
							<div className='flex flex-wrap items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200'>
								<span className='text-sm font-medium text-blue-700'>
									Active:
								</span>
								{selectedDate && (
									<div className='flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs font-medium'>
										<Calendar className='h-3 w-3' />
										{new Date(selectedDate).toLocaleDateString()}
										<Button
											onClick={() => {
												setSelectedDate('')
												setCurrentPage(1)
											}}
											variant='ghost'
											size='sm'
											className='h-4 w-4 p-0 ml-1 hover:bg-blue-200 text-blue-600'
										>
											<X className='h-3 w-3' />
										</Button>
									</div>
								)}
								{branchFilter !== 'all' && (
									<div className='flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs font-medium'>
										<Package className='h-3 w-3' />
										{branchFilter}
										<Button
											onClick={() => {
												setBranchFilter('all')
												setCurrentPage(1)
											}}
											variant='ghost'
											size='sm'
											className='h-4 w-4 p-0 ml-1 hover:bg-blue-200 text-blue-600'
										>
											<X className='h-3 w-3' />
										</Button>
									</div>
								)}
								{statusFilter !== 'all' && (
									<div className='flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs font-medium'>
										<CheckCircle className='h-3 w-3' />
										{statusFilter}
										<Button
											onClick={() => {
												setStatusFilter('all')
												setCurrentPage(1)
											}}
											variant='ghost'
											size='sm'
											className='h-4 w-4 p-0 ml-1 hover:bg-blue-200 text-blue-600'
										>
											<X className='h-3 w-3' />
										</Button>
									</div>
								)}
							</div>
						)}

						{/* Advanced Filters (Collapsible) */}
						{showAdvancedFilters && (
							<Card className='border-blue-200 shadow-sm'>
								<CardHeader className='pb-3'>
									<CardTitle className='text-base flex items-center gap-2'>
										<Filter className='h-4 w-4 text-blue-600' />
										Advanced Filters
									</CardTitle>
								</CardHeader>
								<CardContent className='space-y-4'>
									<div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
										<div className='space-y-2'>
											<Label
												htmlFor='date-filter'
												className='text-sm font-medium flex items-center gap-2'
											>
												<Calendar className='h-4 w-4 text-gray-500' />
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
												htmlFor='branch-filter'
												className='text-sm font-medium flex items-center gap-2'
											>
												<Package className='h-4 w-4 text-gray-500' />
												Filter by Branch
											</Label>
											<Select
												value={branchFilter}
												onValueChange={value => {
													setBranchFilter(value)
													setCurrentPage(1)
												}}
											>
												<SelectTrigger className='h-10'>
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
										<div className='space-y-2'>
											<Label
												htmlFor='status-filter'
												className='text-sm font-medium flex items-center gap-2'
											>
												<CheckCircle className='h-4 w-4 text-gray-500' />
												Filter by Status
											</Label>
											<Select
												value={statusFilter}
												onValueChange={value => {
													setStatusFilter(value as OrderStatus | 'all')
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
									</div>
								</CardContent>
							</Card>
						)}
					</div>

					{/* Orders Table */}
					<Card>
						<CardHeader>
							<CardTitle className='text-lg flex items-center gap-2'>
								<ShoppingCart className='h-5 w-5 text-blue-600' />
								Team Orders ({totalOrders} total)
							</CardTitle>
						</CardHeader>
						<CardContent>
							{loading ? (
								<div className='text-center py-8'>
									<RefreshCw className='h-8 w-8 animate-spin mx-auto text-gray-400' />
									<p className='text-gray-500 mt-2'>Loading orders...</p>
								</div>
							) : orders.length === 0 ? (
								<div className='text-center py-8'>
									<ShoppingCart className='h-12 w-12 text-gray-400 mx-auto mb-4' />
									<p className='text-gray-500'>No orders found</p>
									<p className='text-sm text-gray-400 mt-1'>
										{activeFiltersCount > 0
											? 'Try adjusting your filters'
											: 'No orders have been created yet'}
									</p>
								</div>
							) : (
								<>
									<div className='overflow-x-auto'>
										<Table>
											<TableHeader>
												<TableRow>
													<TableHead>Order #</TableHead>
													<TableHead>Worker</TableHead>
													<TableHead>Branch</TableHead>
													<TableHead>Date</TableHead>
													<TableHead>Items</TableHead>
													<TableHead>Total Value</TableHead>
													<TableHead>Status</TableHead>
													<TableHead className='text-right'>Actions</TableHead>
												</TableRow>
											</TableHeader>
											<TableBody>
												{orders.map(order => {
													const statusDisplay = getStatusDisplay(order.status)
													return (
														<TableRow
															key={order._id}
															className='hover:bg-gray-50'
														>
															<TableCell className='font-mono text-sm'>
																{order.orderNumber}
															</TableCell>
															<TableCell>
																<div>
																	<p className='font-medium text-sm'>
																		{order.worker.username}
																	</p>
																</div>
															</TableCell>
															<TableCell>
																<span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800'>
																	{order.branch}
																</span>
															</TableCell>
															<TableCell className='text-sm text-gray-600'>
																{formatDate(order.requestedDate)}
															</TableCell>
															<TableCell className='text-sm text-gray-600'>
																{order.items.length} items (
																{getTotalQuantity(order)} total)
															</TableCell>
															<TableCell className='text-sm text-gray-600'>
																{formatKRW(getTotalValue(order))}
															</TableCell>
															<TableCell>
																<span
																	className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusDisplay.color}`}
																>
																	{statusDisplay.icon}
																	<span className='ml-1'>
																		{statusDisplay.label}
																	</span>
																</span>
															</TableCell>
															<TableCell className='text-right'>
																<Button
																	onClick={() => openDetailDialog(order)}
																	variant='ghost'
																	size='sm'
																	className='h-8 w-8 p-0'
																>
																	<Eye className='h-4 w-4' />
																</Button>
															</TableCell>
														</TableRow>
													)
												})}
											</TableBody>
										</Table>
									</div>

									{/* Pagination */}
									{totalPages > 1 && (
										<div className='flex items-center justify-between px-2 py-4 border-t'>
											<div className='text-sm text-gray-700'>
												Showing page {currentPage} of {totalPages}
											</div>
											<div className='flex items-center space-x-2'>
												<Button
													variant='outline'
													size='sm'
													onClick={() =>
														setCurrentPage(Math.max(1, currentPage - 1))
													}
													disabled={currentPage === 1}
												>
													Previous
												</Button>
												<Button
													variant='outline'
													size='sm'
													onClick={() =>
														setCurrentPage(
															Math.min(totalPages, currentPage + 1)
														)
													}
													disabled={currentPage === totalPages}
												>
													Next
												</Button>
											</div>
										</div>
									)}
								</>
							)}
						</CardContent>
					</Card>
				</div>

				{/* Order Detail Dialog */}
				<Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
					<DialogContent className='max-w-4xl max-h-[80vh] overflow-y-auto'>
						<DialogHeader>
							<DialogTitle className='flex items-center gap-2'>
								<Package className='h-5 w-5 text-blue-600' />
								Order Details - {selectedOrder?.orderNumber}
							</DialogTitle>
							<DialogDescription>
								Read-only view of order information
							</DialogDescription>
						</DialogHeader>

						{selectedOrder && (
							<div className='space-y-6'>
								{/* Order Info */}
								<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
									<div>
										<h3 className='font-medium text-gray-900 mb-2'>
											Order Information
										</h3>
										<div className='space-y-1 text-sm'>
											<p>
												<span className='text-gray-600'>Order Number:</span>{' '}
												{selectedOrder.orderNumber}
											</p>
											<p>
												<span className='text-gray-600'>Worker:</span>{' '}
												{selectedOrder.worker.username}
											</p>
											<p>
												<span className='text-gray-600'>Branch:</span>{' '}
												{selectedOrder.branch}
											</p>
											<p>
												<span className='text-gray-600'>Requested Date:</span>{' '}
												{formatDate(selectedOrder.requestedDate)}
											</p>
											<p>
												<span className='text-gray-600'>Created:</span>{' '}
												{formatDate(selectedOrder.createdAt)}
											</p>
										</div>
									</div>
									<div>
										<h3 className='font-medium text-gray-900 mb-2'>Status</h3>
										<div className='space-y-2'>
											{(() => {
												const statusDisplay = getStatusDisplay(
													selectedOrder.status
												)
												return (
													<span
														className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusDisplay.color}`}
													>
														{statusDisplay.icon}
														<span className='ml-2'>{statusDisplay.label}</span>
													</span>
												)
											})()}
											{selectedOrder.adminNotes && (
												<div className='mt-2'>
													<p className='text-sm text-gray-600'>Admin Notes:</p>
													<p className='text-sm bg-gray-50 p-2 rounded'>
														{selectedOrder.adminNotes}
													</p>
												</div>
											)}
										</div>
									</div>
								</div>

								{/* Order Items */}
								<div>
									<h3 className='font-medium text-gray-900 mb-3'>
										Order Items
									</h3>
									<div className='border rounded-lg overflow-hidden'>
										<Table>
											<TableHeader>
												<TableRow className='bg-gray-50'>
													<TableHead>Product</TableHead>
													<TableHead>Quantity</TableHead>
													<TableHead>Unit Price</TableHead>
													<TableHead className='text-right'>Total</TableHead>
												</TableRow>
											</TableHeader>
											<TableBody>
												{selectedOrder.items.map((item, index) => (
													<TableRow key={index}>
														<TableCell>
															<div>
																<p className='font-medium'>
																	{item.product.name}
																</p>
																<p className='text-sm text-gray-500'>
																	{item.product.description}
																</p>
															</div>
														</TableCell>
														<TableCell>{item.quantity}</TableCell>
														<TableCell>
															{item.product.price
																? formatKRW(item.product.price)
																: 'N/A'}
														</TableCell>
														<TableCell className='text-right'>
															{item.product.price
																? formatKRW(item.quantity * item.product.price)
																: 'N/A'}
														</TableCell>
													</TableRow>
												))}
											</TableBody>
										</Table>
									</div>
									<div className='mt-3 text-right'>
										<p className='text-lg font-semibold'>
											Total: {formatKRW(getTotalValue(selectedOrder))}
										</p>
									</div>
								</div>

								{/* Notes */}
								{selectedOrder.notes && (
									<div>
										<h3 className='font-medium text-gray-900 mb-2'>
											Order Notes
										</h3>
										<div className='bg-gray-50 p-3 rounded-lg text-sm'>
											{selectedOrder.notes}
										</div>
									</div>
								)}
							</div>
						)}
					</DialogContent>
				</Dialog>
			</DashboardLayout>
		</ProtectedRoute>
	)
}

export default WorkerAllOrders
