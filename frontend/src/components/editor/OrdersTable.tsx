import { Button } from '@/components/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import { formatDate } from '@/lib/formatDate'
import { Order, OrderStatus } from '@/types'
import { Edit, Eye, MoreHorizontal, Printer } from 'lucide-react'
import OrderMobileCard from './OrderMobileCard'
import {
	getOrderRowClass,
	getOrderStatusBadgeClass,
} from './orderStatus'
import StatusSelect from './StatusSelect'

interface OrdersTableProps {
	orders: Order[]
	loading: boolean
	onViewOrder: (order: Order) => void
	onPrintOrder: (order: Order) => void
	/** Opens dialog with admin notes (optional when inline status is enabled) */
	onUpdateStatus?: (order: Order) => void
	/** Inline status change without dialog */
	onStatusChange?: (order: Order, status: OrderStatus) => void
	inlineStatus?: boolean
	compact?: boolean
	updatingOrderId?: string | null
}

const OrdersTable: React.FC<OrdersTableProps> = ({
	orders,
	loading,
	onViewOrder,
	onPrintOrder,
	onUpdateStatus,
	onStatusChange,
	inlineStatus = false,
	compact = false,
	updatingOrderId = null,
}) => {
	if (loading) {
		return (
			<div className='space-y-3'>
				{[...Array(compact ? 3 : 5)].map((_, i) => (
					<Skeleton key={i} className='h-[3.25rem] w-full rounded-lg' />
				))}
			</div>
		)
	}

	if (orders.length === 0) {
		return (
			<div className='text-center py-8 text-gray-500'>
				<p className='text-lg mb-2'>No orders found</p>
				<p className='text-sm'>Try adjusting your filters</p>
			</div>
		)
	}

	const showActionsMenu = Boolean(onUpdateStatus)

	return (
		<>
			<div className='hidden lg:block overflow-x-auto'>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className='text-xs font-medium'>Order #</TableHead>
							<TableHead className='text-xs font-medium'>Branch</TableHead>
							{!compact && (
								<TableHead className='text-xs font-medium'>
									Requested Date
								</TableHead>
							)}
							<TableHead className='text-xs font-medium'>Status</TableHead>
							<TableHead className='text-xs font-medium'>Items</TableHead>
							<TableHead className='text-xs font-medium text-right'>
								Actions
							</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{orders.map(order => {
							const isUpdating = updatingOrderId === order._id

							return (
								<TableRow
									key={order._id}
									className={`cursor-pointer ${getOrderRowClass(order.status)}`}
									onClick={() => onViewOrder(order)}
								>
									<TableCell className='font-medium text-sm'>
										{order.orderNumber}
									</TableCell>
									<TableCell className='text-sm'>{order.branch}</TableCell>
									{!compact && (
										<TableCell className='text-sm'>
											{formatDate(order.requestedDate)}
										</TableCell>
									)}
									<TableCell onClick={e => e.stopPropagation()}>
										{inlineStatus && onStatusChange ? (
											<StatusSelect
												value={order.status}
												onValueChange={status =>
													onStatusChange(order, status)
												}
												className={`h-8 w-[130px] text-xs ${
													isUpdating ? 'opacity-50 pointer-events-none' : ''
												}`}
											/>
										) : (
											<span
												className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getOrderStatusBadgeClass(
													order.status
												)}`}
											>
												{order.status}
											</span>
										)}
									</TableCell>
									<TableCell className='text-sm'>
										{order.items.length} items
									</TableCell>
									<TableCell
										className='text-right'
										onClick={e => e.stopPropagation()}
									>
										<div className='flex gap-1 justify-end'>
											<Button
												variant='outline'
												size='sm'
												onClick={() => onViewOrder(order)}
												className='h-7 px-2 text-xs'
											>
												<Eye className='h-3 w-3 mr-1' />
												View
											</Button>
											{!compact && (
												<Button
													variant='outline'
													size='sm'
													onClick={() => onPrintOrder(order)}
													className='h-7 px-2 text-xs'
												>
													<Printer className='h-3 w-3 mr-1' />
													Print
												</Button>
											)}
											{showActionsMenu && (
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<Button
															variant='outline'
															size='sm'
															className='h-7 w-7 p-0'
														>
															<MoreHorizontal className='h-3 w-3' />
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent>
														<DropdownMenuItem
															onClick={() => onUpdateStatus?.(order)}
														>
															<Edit className='h-4 w-4 mr-2' />
															{inlineStatus
																? 'Add admin notes'
																: 'Update Status'}
														</DropdownMenuItem>
														{compact && (
															<DropdownMenuItem
																onClick={() => onPrintOrder(order)}
															>
																<Printer className='h-4 w-4 mr-2' />
																Print
															</DropdownMenuItem>
														)}
													</DropdownMenuContent>
												</DropdownMenu>
											)}
										</div>
									</TableCell>
								</TableRow>
							)
						})}
					</TableBody>
				</Table>
			</div>

			<div className='lg:hidden space-y-1.5'>
				{orders.map(order => (
					<OrderMobileCard
						key={order._id}
						order={order}
						compact={compact}
						inlineStatus={inlineStatus}
						isUpdating={updatingOrderId === order._id}
						onView={() => onViewOrder(order)}
						onPrint={() => onPrintOrder(order)}
						onStatusChange={
							onStatusChange
								? status => onStatusChange(order, status)
								: undefined
						}
						onAddNotes={
							onUpdateStatus ? () => onUpdateStatus(order) : undefined
						}
					/>
				))}
			</div>
		</>
	)
}

export default OrdersTable
