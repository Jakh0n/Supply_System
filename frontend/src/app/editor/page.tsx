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
import {
	Calendar,
	Download,
	Eye,
	FileText,
	LogOut,
	Package,
	Printer,
} from 'lucide-react'
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

	const handlePrintOrder = (order: Order) => {
		try {
			const printWindow = window.open('', '_blank', 'width=800,height=600')

			if (!printWindow) {
				toast.error('Please allow popups to print orders')
				return
			}

			const printContent = `
				<!DOCTYPE html>
				<html>
				<head>
					<title>Order ${order.orderNumber}</title>
					<style>
						body { 
							font-family: Arial, sans-serif; 
							margin: 20px; 
							line-height: 1.4;
						}
						.header { 
							text-align: center; 
							border-bottom: 2px solid #333; 
							padding-bottom: 10px; 
							margin-bottom: 20px; 
						}
						.order-info { 
							display: grid; 
							grid-template-columns: 1fr 1fr; 
							gap: 20px; 
							margin-bottom: 20px; 
						}
						.section { 
							margin-bottom: 15px; 
						}
						.section h3 { 
							margin-bottom: 5px; 
							color: #333; 
							font-size: 16px;
						}
						table { 
							width: 100%; 
							border-collapse: collapse; 
							margin-top: 10px; 
						}
						th, td { 
							border: 1px solid #ddd; 
							padding: 8px; 
							text-align: left; 
							font-size: 12px;
						}
						th { 
							background-color: #f5f5f5; 
							font-weight: bold;
						}
						.status { 
							padding: 4px 8px; 
							border-radius: 4px; 
							font-weight: bold; 
							font-size: 12px;
						}
						.status.pending { 
							background-color: #fef3c7; 
							color: #92400e; 
						}
						.status.approved { 
							background-color: #d1fae5; 
							color: #065f46; 
						}
						.status.rejected { 
							background-color: #fee2e2; 
							color: #991b1b; 
						}
						.status.completed { 
							background-color: #dbeafe; 
							color: #1e40af; 
						}
						@media print { 
							body { margin: 0; }
							.no-print { display: none; }
						}
						.print-button {
							margin: 20px 0;
							text-align: center;
						}
						.print-btn {
							background-color: #007bff;
							color: white;
							border: none;
							padding: 10px 20px;
							border-radius: 4px;
							cursor: pointer;
							font-size: 14px;
						}
						.print-btn:hover {
							background-color: #0056b3;
						}
					</style>
				</head>
				<body>
					<div class="print-button no-print">
						<button class="print-btn" onclick="window.print()">🖨️ Print This Order</button>
						<button class="print-btn" onclick="window.close()" style="margin-left: 10px; background-color: #6c757d;">❌ Close</button>
					</div>
					
					<div class="header">
						<h1>Order Receipt</h1>
						<h2>Order #${order.orderNumber}</h2>
					</div>
					
					<div class="order-info">
						<div>
							<div class="section">
								<h3>Order Information</h3>
								<p><strong>Worker:</strong> ${order.worker.username}</p>
								<p><strong>Branch:</strong> ${order.branch}</p>
								<p><strong>Requested Date:</strong> ${formatDate(order.requestedDate)}</p>
								<p><strong>Status:</strong> <span class="status ${
									order.status
								}">${order.status.toUpperCase()}</span></p>
							</div>
						</div>
						<div>
							<div class="section">
								<h3>Processing Information</h3>
								${
									order.processedBy
										? `<p><strong>Processed By:</strong> ${order.processedBy.username}</p>`
										: '<p>Not yet processed</p>'
								}
								${
									order.processedAt
										? `<p><strong>Processed At:</strong> ${formatDate(
												order.processedAt
										  )}</p>`
										: ''
								}
							</div>
						</div>
					</div>

					<div class="section">
						<h3>Order Items</h3>
						<table>
							<thead>
								<tr>
									<th>Product</th>
									<th>Category</th>
									<th>Quantity</th>
									<th>Unit</th>
									<th>Notes</th>
								</tr>
							</thead>
							<tbody>
								${order.items
									.map(
										item => `
									<tr>
										<td>${item.product.name}</td>
										<td>${item.product.category}</td>
										<td>${item.quantity}</td>
										<td>${item.product.unit}</td>
										<td>${item.notes || '-'}</td>
									</tr>
								`
									)
									.join('')}
							</tbody>
						</table>
					</div>

					${
						order.notes
							? `
						<div class="section">
							<h3>Order Notes</h3>
							<p style="background-color: #f9f9f9; padding: 10px; border-radius: 4px;">${order.notes}</p>
						</div>
					`
							: ''
					}

					${
						order.adminNotes
							? `
						<div class="section">
							<h3>Admin Notes</h3>
							<p style="background-color: #eff6ff; padding: 10px; border-radius: 4px;">${order.adminNotes}</p>
						</div>
					`
							: ''
					}

					<div style="margin-top: 40px; text-align: center; color: #666; font-size: 12px;">
						<p>Printed on ${new Date().toLocaleString()}</p>
					</div>

					<script>
						// Auto-focus the window
						window.focus();
						
						// Optional: Auto-print after a short delay
						// setTimeout(() => {
						//     window.print();
						// }, 500);
					</script>
				</body>
				</html>
			`

			printWindow.document.write(printContent)
			printWindow.document.close()

			// Wait for content to load before focusing
			setTimeout(() => {
				printWindow.focus()
			}, 100)

			toast.success('Print window opened successfully')
		} catch (error) {
			console.error('Print error:', error)
			toast.error(
				'Failed to open print window. Please check your browser settings.'
			)
		}
	}

	const handleDownloadAllOrders = async () => {
		try {
			setLoading(true)
			const response = await ordersApi.getOrders({ ...filters, limit: 1000 }) // Get all orders

			if (response.orders.length === 0) {
				toast.error('No orders found to download')
				return
			}

			const csvContent = generateCSV(response.orders)
			const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
			const link = document.createElement('a')
			const url = URL.createObjectURL(blob)

			link.setAttribute('href', url)
			link.setAttribute(
				'download',
				`orders_${new Date().toISOString().split('T')[0]}.csv`
			)
			link.style.visibility = 'hidden'
			document.body.appendChild(link)
			link.click()
			document.body.removeChild(link)

			toast.success(`Downloaded ${response.orders.length} orders`)
		} catch (error) {
			console.error('Error downloading orders:', error)
			toast.error('Failed to download orders')
		} finally {
			setLoading(false)
		}
	}

	const generateCSV = (orders: Order[]) => {
		const headers = [
			'Order Number',
			'Worker',
			'Branch',
			'Requested Date',
			'Status',
			'Items Count',
			'Product Names',
			'Total Quantities',
			'Processed By',
			'Processed At',
			'Order Notes',
			'Admin Notes',
		]

		const rows = orders.map(order => [
			order.orderNumber,
			order.worker.username,
			order.branch,
			formatDate(order.requestedDate),
			order.status,
			order.items.length,
			order.items.map(item => item.product.name).join('; '),
			order.items
				.map(item => `${item.quantity} ${item.product.unit}`)
				.join('; '),
			order.processedBy?.username || 'Not processed',
			order.processedAt ? formatDate(order.processedAt) : 'Not processed',
			order.notes || '',
			order.adminNotes || '',
		])

		return [headers, ...rows]
			.map(row => row.map(field => `"${field}"`).join(','))
			.join('\n')
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

	const handleDownloadPDF = async () => {
		try {
			setLoading(true)
			const response = await ordersApi.getOrders({ ...filters, limit: 1000 })

			if (response.orders.length === 0) {
				toast.error('No orders found to download')
				return
			}

			generatePDFReport(response.orders)
			toast.success(
				`PDF report generated with ${response.orders.length} orders`
			)
		} catch (error) {
			console.error('Error generating PDF:', error)
			toast.error('Failed to generate PDF report')
		} finally {
			setLoading(false)
		}
	}

	const generatePDFReport = (orders: Order[]) => {
		// Group orders by branch
		const ordersByBranch = orders.reduce((acc, order) => {
			if (!acc[order.branch]) {
				acc[order.branch] = []
			}
			acc[order.branch].push(order)
			return acc
		}, {} as Record<string, Order[]>)

		const pdfContent = `
			<!DOCTYPE html>
			<html>
			<head>
				<title>Orders Checklist - ${new Date().toLocaleDateString()}</title>
				<style>
					body { 
						font-family: Arial, sans-serif; 
						margin: 20px; 
						font-size: 12px;
						line-height: 1.4;
					}
					.header { 
						text-align: center; 
						border-bottom: 2px solid #333; 
						padding-bottom: 15px; 
						margin-bottom: 30px; 
					}
					.header h1 {
						font-size: 20px;
						margin: 0 0 8px 0;
						color: #333;
					}
					.header h3 {
						font-size: 14px;
						margin: 0;
						color: #666;
						font-weight: normal;
					}
					.branch-section { 
						margin-bottom: 35px; 
						page-break-inside: avoid;
					}
					.branch-header { 
						background-color: #f5f5f5; 
						padding: 12px 15px; 
						border-left: 4px solid #2196f3; 
						margin-bottom: 15px;
						font-weight: bold;
						font-size: 16px;
						color: #333;
					}
					.products-list { 
						margin-top: 10px;
					}
					.product-item { 
						padding: 8px 0;
						border-bottom: 1px solid #eee;
						font-size: 12px;
						line-height: 1.3;
					}
					.product-name {
						font-weight: bold;
						color: #333;
						display: inline;
					}
					.product-quantity {
						color: #666;
						display: inline;
						margin-left: 8px;
					}
					.footer { 
						text-align: center; 
						margin-top: 40px; 
						padding-top: 15px; 
						border-top: 1px solid #ddd; 
						color: #666; 
						font-size: 10px;
					}
					@media print { 
						body { margin: 15px; }
						.no-print { display: none; }
						.branch-section { 
							page-break-inside: avoid;
						}
					}
					.download-btn {
						background-color: #007bff;
						color: white;
						border: none;
						padding: 10px 20px;
						border-radius: 4px;
						cursor: pointer;
						font-size: 14px;
						margin: 8px;
					}
					.download-btn:hover {
						background-color: #0056b3;
					}
				</style>
			</head>
			<body>
				<div class="no-print" style="text-align: center; margin-bottom: 20px;">
					<button class="download-btn" onclick="window.print()">📄 Save as PDF</button>
					<button class="download-btn" onclick="window.close()" style="background-color: #6c757d;">❌ Close</button>
				</div>

				<div class="header">
					<h1>Orders Checklist</h1>
					<h3>${new Date().toLocaleDateString()}</h3>
				</div>

				${Object.entries(ordersByBranch)
					.map(
						([branch, branchOrders]) => `
					<div class="branch-section">
						<div class="branch-header">
							📍 ${branch} Branch
						</div>
						<div class="products-list">
							${branchOrders
								.flatMap(order =>
									order.items.map(
										item => `
									<div class="product-item">
										<span class="product-name">${item.product.name}</span>
										<span class="product-quantity">- ${item.quantity} ${item.product.unit}</span>
									</div>
								`
									)
								)
								.join('')}
						</div>
					</div>
				`
					)
					.join('')}

				<div class="footer">
					<p>Generated on ${new Date().toLocaleString()}</p>
				</div>

				<script>
					window.onload = function() {
						window.focus();
					};
				</script>
			</body>
			</html>
		`

		const printWindow = window.open('', '_blank', 'width=800,height=600')
		if (!printWindow) {
			toast.error('Please allow popups to download PDF')
			return
		}

		printWindow.document.write(pdfContent)
		printWindow.document.close()
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
							<Button
								onClick={handleDownloadAllOrders}
								disabled={loading}
								className='flex items-center gap-2'
							>
								<Download className='h-4 w-4' />
								Download CSV
							</Button>
							<Button
								onClick={handleDownloadPDF}
								disabled={loading}
								className='flex items-center gap-2'
								variant='outline'
							>
								<FileText className='h-4 w-4' />
								Download PDF
							</Button>
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
												<div className='flex gap-2'>
													<Button
														variant='outline'
														size='sm'
														onClick={() => handleViewOrder(order)}
													>
														<Eye className='h-4 w-4 mr-1' />
														View
													</Button>
													<Button
														variant='outline'
														size='sm'
														onClick={() => handlePrintOrder(order)}
													>
														<Printer className='h-4 w-4 mr-1' />
														Print
													</Button>
												</div>
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
