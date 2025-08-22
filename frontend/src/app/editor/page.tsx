'use client'

import EditorHeader from '@/components/editor/EditorHeader'
import EditorSkeleton from '@/components/editor/EditorSkeleton'
import OrdersFilters from '@/components/editor/OrdersFilters'
import OrdersTable from '@/components/editor/OrdersTable'
import StatsCards from '@/components/editor/StatsCards'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
	Dialog,
	DialogContent,
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
	const [initialLoading, setInitialLoading] = useState(true)
	const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
	const [showOrderDialog, setShowOrderDialog] = useState(false)
	const [showStatusDialog, setShowStatusDialog] = useState(false)
	const [newStatus, setNewStatus] = useState<OrderStatus>('pending')
	const [adminNotes, setAdminNotes] = useState('')
	const [updatingStatus, setUpdatingStatus] = useState(false)
	const [filters, setFilters] = useState<OrderFilters>({
		date: '',
		branch: '',
		status: 'all' as OrderStatus | 'all',
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
			setInitialLoading(false)
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

	const handleUpdateStatus = (order: Order) => {
		setSelectedOrder(order)
		setNewStatus(order.status)
		setAdminNotes(order.adminNotes || '')
		setShowStatusDialog(true)
	}

	const handleStatusUpdate = async () => {
		if (!selectedOrder) return

		try {
			setUpdatingStatus(true)
			await ordersApi.updateOrderStatus(
				selectedOrder._id,
				newStatus,
				adminNotes
			)

			await fetchOrders()
			setShowStatusDialog(false)
			toast.success('Order status updated successfully')
		} catch (error) {
			console.error('Error updating order status:', error)
			toast.error('Failed to update order status')
		} finally {
			setUpdatingStatus(false)
		}
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
									<td>${item.product?.name || 'Product Deleted'}</td>
									<td>${item.product?.category || '-'}</td>
									<td>${item.quantity}</td>
									<td>${item.product?.unit || 'unit'}</td>
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
						window.focus();
						setTimeout(() => {
							printWindow.focus()
						}, 100);
					</script>
				</body>
				</html>
			`

			printWindow.document.write(printContent)
			printWindow.document.close()

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
			const response = await ordersApi.getOrders({ ...filters, limit: 1000 })

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
		order.items.map(item => item.product?.name || 'Product Deleted').join('; '),
		order.items
			.map(item => `${item.quantity} ${item.product?.unit || 'unit'}`)
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
									<span class="product-name">${item.product?.name || 'Product Deleted'}</span>
									<span class="product-quantity">- ${item.quantity} ${item.product?.unit || 'unit'}</span>
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
			<EditorHeader username={user.username} onLogout={logout} />

			<main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8'>
				{initialLoading ? (
					<EditorSkeleton />
				) : (
					<>
						{stats && <StatsCards stats={stats} />}

						<Card>
							<CardHeader className='pb-4'>
								<CardTitle className='text-lg sm:text-xl'>
									All Branch Orders
								</CardTitle>
								<OrdersFilters
									filters={filters}
									loading={loading}
									onFiltersChange={setFilters}
									onDownloadCSV={handleDownloadAllOrders}
									onDownloadPDF={handleDownloadPDF}
								/>
							</CardHeader>
							<CardContent className='pt-0'>
								<OrdersTable
									orders={orders}
									loading={loading}
									onViewOrder={handleViewOrder}
									onUpdateStatus={handleUpdateStatus}
									onPrintOrder={handlePrintOrder}
								/>
							</CardContent>
						</Card>
					</>
				)}
			</main>

			{/* Order Details Dialog */}
			<Dialog open={showOrderDialog} onOpenChange={setShowOrderDialog}>
				<DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
					<DialogHeader>
						<DialogTitle className='text-lg sm:text-xl'>
							Order Details - {selectedOrder?.orderNumber}
						</DialogTitle>
					</DialogHeader>
					{selectedOrder && (
						<div className='space-y-6'>
							<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
								<div>
									<h3 className='font-semibold mb-2 text-sm sm:text-base'>
										Order Information
									</h3>
									<div className='space-y-1 text-sm'>
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
											<span className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800'>
												{selectedOrder.status}
											</span>
										</p>
									</div>
								</div>
								<div>
									<h3 className='font-semibold mb-2 text-sm sm:text-base'>
										Processing Information
									</h3>
									<div className='space-y-1 text-sm'>
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
							</div>

							<div>
								<h3 className='font-semibold mb-2 text-sm sm:text-base'>
									Order Items
								</h3>
								<div className='overflow-x-auto'>
									<Table>
										<TableHeader>
											<TableRow>
												<TableHead className='text-xs'>Product</TableHead>
												<TableHead className='text-xs'>Category</TableHead>
												<TableHead className='text-xs'>Quantity</TableHead>
												<TableHead className='text-xs'>Unit</TableHead>
												<TableHead className='text-xs'>Notes</TableHead>
											</TableRow>
										</TableHeader>
																			<TableBody>
										{selectedOrder.items.map((item, index) => (
											<TableRow key={item.product?._id || `deleted-${index}`}>
												<TableCell className='text-sm'>
													{item.product?.name || 'Product Deleted'}
												</TableCell>
												<TableCell className='text-sm'>
													{item.product?.category || '-'}
												</TableCell>
												<TableCell className='text-sm'>
													{item.quantity}
												</TableCell>
												<TableCell className='text-sm'>
													{item.product?.unit || 'unit'}
												</TableCell>
													<TableCell className='text-sm'>
														{item.notes || '-'}
													</TableCell>
												</TableRow>
											))}
										</TableBody>
									</Table>
								</div>
							</div>

							{selectedOrder.notes && (
								<div>
									<h3 className='font-semibold mb-2 text-sm sm:text-base'>
										Order Notes
									</h3>
									<p className='text-sm text-gray-700 bg-gray-50 p-3 rounded'>
										{selectedOrder.notes}
									</p>
								</div>
							)}

							{selectedOrder.adminNotes && (
								<div>
									<h3 className='font-semibold mb-2 text-sm sm:text-base'>
										Admin Notes
									</h3>
									<p className='text-sm text-gray-700 bg-blue-50 p-3 rounded border border-blue-200'>
										{selectedOrder.adminNotes}
									</p>
								</div>
							)}
						</div>
					)}
				</DialogContent>
			</Dialog>

			{/* Status Update Dialog */}
			<Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
				<DialogContent className='max-w-md'>
					<DialogHeader>
						<DialogTitle className='text-lg'>
							Update Order Status - {selectedOrder?.orderNumber}
						</DialogTitle>
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
							<Label htmlFor='adminNotes' className='text-sm font-medium'>
								Admin Notes (Optional)
							</Label>
							<textarea
								id='adminNotes'
								value={adminNotes}
								onChange={e => setAdminNotes(e.target.value)}
								placeholder='Add notes about this status update...'
								className='w-full p-2 border rounded-md min-h-[80px] resize-none mt-1 text-sm'
							/>
						</div>
						<div className='flex flex-col sm:flex-row justify-end gap-2'>
							<Button
								variant='outline'
								onClick={() => setShowStatusDialog(false)}
								disabled={updatingStatus}
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
	)
}
