import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Order, OrderStatus } from '@/types'
import {
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

interface OrdersTableProps {
	orders: Order[]
	totalOrders: number
	currentPage: number
	totalPages: number
	selectedDate: string
	branchFilter: string
	statusFilter: OrderStatus | 'all'
	onViewDetails: (order: Order) => void
	onUpdateStatus: (order: Order) => void
	onDownloadOrderPDF: (order: Order) => void
	onPageChange: (page: number) => void
}

const OrdersTable: React.FC<OrdersTableProps> = ({
	orders,
	totalOrders,
	currentPage,
	totalPages,
	selectedDate,
	branchFilter,
	statusFilter,
	onViewDetails,
	onUpdateStatus,
	onDownloadOrderPDF,
	onPageChange,
}) => {
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

	if (orders.length === 0) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className='text-base sm:text-lg'>
						Orders ({totalOrders})
					</CardTitle>
					<CardDescription>
						Manage order requests from all branches
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className='text-center py-8'>
						<ShoppingCart className='h-12 w-12 text-gray-400 mx-auto mb-4' />
						<p className='text-gray-500'>No orders found</p>
						<p className='text-sm text-gray-400 mt-1'>
							{selectedDate || branchFilter !== 'all' || statusFilter !== 'all'
								? 'Try adjusting your filters'
								: 'No orders have been created yet'}
						</p>
					</div>
				</CardContent>
			</Card>
		)
	}

	return (
		<>
			{/* Desktop Table View */}
			<Card className='hidden lg:block'>
				<CardHeader>
					<CardTitle className='text-base sm:text-lg'>
						Orders ({totalOrders})
					</CardTitle>
					<CardDescription>
						Manage order requests from all branches
					</CardDescription>
				</CardHeader>
				<CardContent className='p-0'>
					<div className='overflow-x-auto'>
						<div className='max-h-[70vh] overflow-y-auto scroll-smooth border-t'>
							<table className='w-full'>
								<thead className='bg-gray-50 sticky top-0 z-10 shadow-sm'>
									<tr className='border-b border-gray-200'>
										<th className='text-left py-3 px-4 font-medium bg-gray-50 text-sm whitespace-nowrap'>
											Order #
										</th>
										<th className='text-left py-3 px-4 font-medium bg-gray-50 text-sm whitespace-nowrap'>
											Worker
										</th>
										<th className='text-left py-3 px-4 font-medium bg-gray-50 text-sm whitespace-nowrap'>
											Branch
										</th>
										<th className='text-left py-3 px-4 font-medium bg-gray-50 text-sm whitespace-nowrap'>
											Requested Date
										</th>
										<th className='text-left py-3 px-4 font-medium bg-gray-50 text-sm whitespace-nowrap'>
											Items
										</th>
										<th className='text-left py-3 px-4 font-medium bg-gray-50 text-sm whitespace-nowrap'>
											Total Value
										</th>
										<th className='text-left py-3 px-4 font-medium bg-gray-50 text-sm whitespace-nowrap'>
											Status
										</th>
										<th className='text-left py-3 px-4 font-medium bg-gray-50 text-sm whitespace-nowrap'>
											Created
										</th>
										<th className='text-right py-3 px-4 font-medium bg-gray-50 text-sm whitespace-nowrap'>
											Actions
										</th>
									</tr>
								</thead>
								<tbody className='bg-white'>
									{orders.map(order => {
										const statusDisplay = getStatusDisplay(order.status)
										return (
											<tr
												key={order._id}
												className='border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer'
												onClick={() => onViewDetails(order)}
											>
												<td className='py-3 px-4'>
													<div className='font-mono text-sm'>
														{order.orderNumber}
													</div>
												</td>
												<td className='py-3 px-4'>
													<div>
														<p className='font-medium text-sm'>
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
													{order.items.length} items ({getTotalQuantity(order)}{' '}
													total)
												</td>
												<td className='py-3 px-4 text-sm text-gray-600'>
													{formatKRW(getTotalValue(order))}
												</td>
												<td className='py-3 px-4'>
													<span
														className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusDisplay.color}`}
													>
														{statusDisplay.icon}
														<span className='ml-1'>{statusDisplay.label}</span>
													</span>
												</td>
												<td className='py-3 px-4 text-sm text-gray-600'>
													{formatDate(order.createdAt)}
												</td>
												<td className='py-3 px-4 text-right'>
													<DropdownMenu>
														<DropdownMenuTrigger asChild>
															<Button
																variant='ghost'
																size='sm'
																onClick={e => e.stopPropagation()}
															>
																<MoreHorizontal className='h-4 w-4' />
															</Button>
														</DropdownMenuTrigger>
														<DropdownMenuContent align='end'>
															<DropdownMenuLabel>Actions</DropdownMenuLabel>
															<DropdownMenuItem
																onClick={e => {
																	e.stopPropagation()
																	onViewDetails(order)
																}}
															>
																<Eye className='h-4 w-4 mr-2' />
																View Details
															</DropdownMenuItem>
															<DropdownMenuItem
																onClick={e => {
																	e.stopPropagation()
																	onUpdateStatus(order)
																}}
															>
																<FileText className='h-4 w-4 mr-2' />
																Update Status
															</DropdownMenuItem>
															<DropdownMenuItem
																onClick={e => {
																	e.stopPropagation()
																	onDownloadOrderPDF(order)
																}}
															>
																<Download className='h-4 w-4 mr-2' />
																Download PDF
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
					</div>
				</CardContent>
			</Card>

			{/* Mobile Card View */}
			<div className='lg:hidden'>
				<div className='flex items-center justify-between mb-4'>
					<h2 className='text-lg font-semibold text-gray-900'>
						Orders ({totalOrders})
					</h2>
				</div>

				<div className='max-h-[70vh] overflow-y-auto scroll-smooth space-y-3 pr-1'>
					{orders.map(order => {
						const statusDisplay = getStatusDisplay(order.status)
						return (
							<Card
								key={order._id}
								className='hover:shadow-md transition-shadow cursor-pointer border border-gray-200'
								onClick={() => onViewDetails(order)}
							>
								<CardContent className='p-4'>
									<div className='flex items-start justify-between mb-3'>
										<div>
											<div className='font-mono text-sm font-medium text-gray-900'>
												{order.orderNumber}
											</div>
											<div className='text-sm text-gray-600'>
												{order.worker.username}
											</div>
										</div>
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button
													variant='ghost'
													size='sm'
													onClick={e => e.stopPropagation()}
												>
													<MoreHorizontal className='h-4 w-4' />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align='end'>
												<DropdownMenuLabel>Actions</DropdownMenuLabel>
												<DropdownMenuItem
													onClick={e => {
														e.stopPropagation()
														onViewDetails(order)
													}}
												>
													<Eye className='h-4 w-4 mr-2' />
													View Details
												</DropdownMenuItem>
												<DropdownMenuItem
													onClick={e => {
														e.stopPropagation()
														onUpdateStatus(order)
													}}
												>
													<FileText className='h-4 w-4 mr-2' />
													Update Status
												</DropdownMenuItem>
												<DropdownMenuItem
													onClick={e => {
														e.stopPropagation()
														onDownloadOrderPDF(order)
													}}
												>
													<Download className='h-4 w-4 mr-2' />
													Download PDF
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</div>

									<div className='grid grid-cols-2 gap-3 mb-3'>
										<div>
											<div className='text-xs text-gray-500 mb-1'>Branch</div>
											<span className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800'>
												{order.branch}
											</span>
										</div>
										<div>
											<div className='text-xs text-gray-500 mb-1'>Status</div>
											<span
												className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusDisplay.color}`}
											>
												{statusDisplay.icon}
												<span className='ml-1'>{statusDisplay.label}</span>
											</span>
										</div>
									</div>

									<div className='grid grid-cols-2 gap-3 mb-3'>
										<div>
											<div className='text-xs text-gray-500'>Items</div>
											<div className='text-sm font-medium'>
												{order.items.length} items ({getTotalQuantity(order)}{' '}
												total)
											</div>
										</div>
										<div>
											<div className='text-xs text-gray-500'>Total Value</div>
											<div className='text-sm font-medium'>
												{formatKRW(getTotalValue(order))}
											</div>
										</div>
									</div>

									<div className='grid grid-cols-2 gap-3 text-xs text-gray-500'>
										<div>
											<span className='font-medium'>Requested:</span>{' '}
											{formatDate(order.requestedDate)}
										</div>
										<div>
											<span className='font-medium'>Created:</span>{' '}
											{formatDate(order.createdAt)}
										</div>
									</div>
								</CardContent>
							</Card>
						)
					})}
				</div>
			</div>

			{/* Pagination */}
			{totalPages > 1 && (
				<div className='flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 border-t bg-white rounded-lg mt-4'>
					<div className='text-sm text-gray-500 text-center sm:text-left'>
						Showing page {currentPage} of {totalPages} ({totalOrders} total
						orders)
					</div>
					<div className='flex space-x-2'>
						<Button
							variant='outline'
							size='sm'
							disabled={currentPage === 1}
							onClick={() => onPageChange(currentPage - 1)}
						>
							Previous
						</Button>
						<Button
							variant='outline'
							size='sm'
							disabled={currentPage === totalPages}
							onClick={() => onPageChange(currentPage + 1)}
						>
							Next
						</Button>
					</div>
				</div>
			)}
		</>
	)
}

export default OrdersTable
