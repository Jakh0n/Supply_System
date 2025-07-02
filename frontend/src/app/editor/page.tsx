'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
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
import { useAuth } from '@/contexts/AuthContext'
import { ordersApi } from '@/lib/api'
import { Order, OrderFilters, OrderStatus } from '@/types'
import { Calendar, Eye, FileText, LogOut, Package } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

interface DashboardStats {
	todayOrders: number
	totalOrders: number
	pendingOrders: number
	completedOrders?: number
	branchStats: Array<{
		_id: string
		totalOrders: number
		pendingOrders: number
	}>
}

export default function EditorDashboard() {
	const { user, logout } = useAuth()
	const [orders, setOrders] = useState<Order[]>([])
	const [stats, setStats] = useState<DashboardStats | null>(null)
	const [loading, setLoading] = useState(true)
	const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
	const [showOrderDialog, setShowOrderDialog] = useState(false)
	const [filters, setFilters] = useState<OrderFilters>({
		date: '',
		branch: '',
		status: 'all',
		page: 1,
		limit: 10,
	})

	useEffect(() => {
		fetchDashboardData()
	}, [])

	const fetchOrders = useCallback(async () => {
		try {
			setLoading(true)
			const response = await ordersApi.getOrders(filters)
			setOrders(response.orders)
		} catch (error) {
			console.error('Error fetching orders:', error)
			toast.error('Failed to load orders')
		} finally {
			setLoading(false)
		}
	}, [filters])

	useEffect(() => {
		fetchOrders()
	}, [fetchOrders])

	const fetchDashboardData = async () => {
		try {
			const statsData = await ordersApi.getDashboardStats()
			setStats(statsData)
		} catch (error) {
			console.error('Error fetching dashboard stats:', error)
			toast.error('Failed to load dashboard statistics')
		}
	}

	const handleViewOrder = (order: Order) => {
		setSelectedOrder(order)
		setShowOrderDialog(true)
	}

	const getStatusBadgeColor = (status: string) => {
		switch (status) {
			case 'pending':
				return 'bg-yellow-100 text-yellow-800'
			case 'approved':
				return 'bg-green-100 text-green-800'
			case 'rejected':
				return 'bg-red-100 text-red-800'
			case 'completed':
				return 'bg-blue-100 text-blue-800'
			default:
				return 'bg-gray-100 text-gray-800'
		}
	}

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString()
	}

	if (!user || user.position !== 'editor') {
		return <div>Access denied. Editor privileges required.</div>
	}

	return (
		<div className='min-h-screen bg-gray-50'>
			{/* Header */}
			<header className='bg-white shadow-sm border-b'>
				<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
					<div className='flex justify-between items-center h-16'>
						<div className='flex items-center'>
							<Package className='h-8 w-8 text-blue-600 mr-3' />
							<div>
								<h1 className='text-xl font-semibold text-gray-900'>
									Editor Dashboard
								</h1>
								<p className='text-sm text-gray-500'>
									Welcome back, {user.username}
								</p>
							</div>
						</div>
						<Button
							variant='outline'
							onClick={logout}
							className='flex items-center gap-2'
						>
							<LogOut className='h-4 w-4' />
							Logout
						</Button>
					</div>
				</div>
			</header>

			{/* Main Content */}
			<main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
				{/* Stats Cards */}
				{stats && (
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
						<Card>
							<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
								<CardTitle className='text-sm font-medium'>
									Today&apos;s Orders
								</CardTitle>
								<Calendar className='h-4 w-4 text-muted-foreground' />
							</CardHeader>
							<CardContent>
								<div className='text-2xl font-bold'>{stats.todayOrders}</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
								<CardTitle className='text-sm font-medium'>
									Total Orders
								</CardTitle>
								<FileText className='h-4 w-4 text-muted-foreground' />
							</CardHeader>
							<CardContent>
								<div className='text-2xl font-bold'>{stats.totalOrders}</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
								<CardTitle className='text-sm font-medium'>
									Pending Orders
								</CardTitle>
								<FileText className='h-4 w-4 text-yellow-500' />
							</CardHeader>
							<CardContent>
								<div className='text-2xl font-bold'>{stats.pendingOrders}</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
								<CardTitle className='text-sm font-medium'>
									Completed Orders
								</CardTitle>
								<FileText className='h-4 w-4 text-green-500' />
							</CardHeader>
							<CardContent>
								<div className='text-2xl font-bold'>
									{stats.completedOrders || 0}
								</div>
							</CardContent>
						</Card>
					</div>
				)}

				{/* Orders Section */}
				<Card>
					<CardHeader>
						<CardTitle>All Branch Orders</CardTitle>
						<div className='flex flex-col sm:flex-row gap-4 mt-4'>
							<Input
								placeholder='Filter by date (YYYY-MM-DD)'
								value={filters.date || ''}
								onChange={e =>
									setFilters(prev => ({ ...prev, date: e.target.value }))
								}
								className='max-w-xs'
							/>
							<Input
								placeholder='Filter by branch'
								value={filters.branch || ''}
								onChange={e =>
									setFilters(prev => ({ ...prev, branch: e.target.value }))
								}
								className='max-w-xs'
							/>
							<Select
								value={filters.status || 'all'}
								onValueChange={value =>
									setFilters(prev => ({
										...prev,
										status: value as OrderStatus | 'all',
									}))
								}
							>
								<SelectTrigger className='max-w-xs'>
									<SelectValue placeholder='Filter by status' />
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
					</CardHeader>
					<CardContent>
						{loading ? (
							<div className='text-center py-8'>Loading orders...</div>
						) : orders.length === 0 ? (
							<div className='text-center py-8 text-gray-500'>
								No orders found
							</div>
						) : (
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Order #</TableHead>
										<TableHead>Worker</TableHead>
										<TableHead>Branch</TableHead>
										<TableHead>Requested Date</TableHead>
										<TableHead>Status</TableHead>
										<TableHead>Items</TableHead>
										<TableHead>Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{orders.map(order => (
										<TableRow key={order._id}>
											<TableCell className='font-medium'>
												{order.orderNumber}
											</TableCell>
											<TableCell>{order.worker.username}</TableCell>
											<TableCell>{order.branch}</TableCell>
											<TableCell>{formatDate(order.requestedDate)}</TableCell>
											<TableCell>
												<span className={getStatusBadgeColor(order.status)}>
													{order.status}
												</span>
											</TableCell>
											<TableCell>{order.items.length} items</TableCell>
											<TableCell>
												<Button
													variant='outline'
													size='sm'
													onClick={() => handleViewOrder(order)}
												>
													<Eye className='h-4 w-4 mr-1' />
													View
												</Button>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						)}
					</CardContent>
				</Card>
			</main>

			{/* Order Details Dialog */}
			<Dialog open={showOrderDialog} onOpenChange={setShowOrderDialog}>
				<DialogContent className='max-w-4xl max-h-[80vh] overflow-y-auto'>
					<DialogHeader>
						<DialogTitle>
							Order Details - {selectedOrder?.orderNumber}
						</DialogTitle>
					</DialogHeader>
					{selectedOrder && (
						<div className='space-y-6'>
							<div className='grid grid-cols-2 gap-4'>
								<div>
									<h3 className='font-semibold mb-2'>Order Information</h3>
									<p>
										<strong>Worker:</strong> {selectedOrder.worker.username}
									</p>
									<p>
										<strong>Branch:</strong> {selectedOrder.branch}
									</p>
									<p>
										<strong>Requested Date:</strong>{' '}
										{formatDate(selectedOrder.requestedDate)}
									</p>
									<p>
										<strong>Status:</strong>{' '}
										<span className={getStatusBadgeColor(selectedOrder.status)}>
											{selectedOrder.status}
										</span>
									</p>
								</div>
								<div>
									<h3 className='font-semibold mb-2'>Processing Information</h3>
									{selectedOrder.processedBy && (
										<p>
											<strong>Processed By:</strong>{' '}
											{selectedOrder.processedBy.username}
										</p>
									)}
									{selectedOrder.processedAt && (
										<p>
											<strong>Processed At:</strong>{' '}
											{formatDate(selectedOrder.processedAt)}
										</p>
									)}
								</div>
							</div>

							<div>
								<h3 className='font-semibold mb-2'>Order Items</h3>
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Product</TableHead>
											<TableHead>Category</TableHead>
											<TableHead>Quantity</TableHead>
											<TableHead>Unit</TableHead>
											<TableHead>Notes</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{selectedOrder.items.map(item => (
											<TableRow key={item.product._id}>
												<TableCell>{item.product.name}</TableCell>
												<TableCell>{item.product.category}</TableCell>
												<TableCell>{item.quantity}</TableCell>
												<TableCell>{item.product.unit}</TableCell>
												<TableCell>{item.notes || '-'}</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</div>

							{selectedOrder.notes && (
								<div>
									<h3 className='font-semibold mb-2'>Order Notes</h3>
									<p className='text-gray-700 bg-gray-50 p-3 rounded'>
										{selectedOrder.notes}
									</p>
								</div>
							)}

							{selectedOrder.adminNotes && (
								<div>
									<h3 className='font-semibold mb-2'>Admin Notes</h3>
									<p className='text-gray-700 bg-blue-50 p-3 rounded'>
										{selectedOrder.adminNotes}
									</p>
								</div>
							)}
						</div>
					)}
				</DialogContent>
			</Dialog>
		</div>
	)
}
