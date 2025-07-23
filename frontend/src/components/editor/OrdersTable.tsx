import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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
import { Order } from '@/types'
import { Edit, Eye, MoreHorizontal, Printer } from 'lucide-react'

interface OrdersTableProps {
	orders: Order[]
	loading: boolean
	onViewOrder: (order: Order) => void
	onUpdateStatus: (order: Order) => void
	onPrintOrder: (order: Order) => void
}

const OrdersTable: React.FC<OrdersTableProps> = ({
	orders,
	loading,
	onViewOrder,
	onUpdateStatus,
	onPrintOrder,
}) => {
	const getStatusBadgeColor = (status: string) => {
		switch (status) {
			case 'pending':
				return 'bg-yellow-100 text-yellow-800 border border-yellow-200'
			case 'approved':
				return 'bg-green-100 text-green-800 border border-green-200'
			case 'rejected':
				return 'bg-red-100 text-red-800 border border-red-200'
			case 'completed':
				return 'bg-blue-100 text-blue-800 border border-blue-200'
			default:
				return 'bg-gray-100 text-gray-800 border border-gray-200'
		}
	}

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString()
	}

	if (loading) {
		return (
			<>
				{/* Desktop Table Skeleton */}
				<div className='hidden lg:block overflow-x-auto'>
					<div className='w-full'>
						{/* Table Header */}
						<div className='grid grid-cols-7 gap-4 py-3 px-4 bg-gray-50 border-b'>
							{[...Array(7)].map((_, i) => (
								<Skeleton key={i} className='h-4 w-full' />
							))}
						</div>

						{/* Table Rows */}
						{[...Array(5)].map((_, rowIndex) => (
							<div
								key={rowIndex}
								className='grid grid-cols-7 gap-4 py-3 px-4 border-b'
							>
								<Skeleton className='h-4 w-full' />
								<Skeleton className='h-4 w-full' />
								<Skeleton className='h-4 w-full' />
								<Skeleton className='h-4 w-full' />
								<Skeleton className='h-6 w-16 rounded-full' />
								<Skeleton className='h-4 w-full' />
								<div className='flex gap-1'>
									<Skeleton className='h-7 w-12' />
									<Skeleton className='h-7 w-12' />
									<Skeleton className='h-7 w-7' />
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Mobile Cards Skeleton */}
				<div className='lg:hidden space-y-3'>
					{[...Array(3)].map((_, i) => (
						<Card key={i}>
							<CardContent className='p-4'>
								<div className='flex items-start justify-between mb-3'>
									<div className='flex-1 min-w-0'>
										<Skeleton className='h-4 w-24 mb-1' />
										<Skeleton className='h-3 w-20' />
									</div>
									<Skeleton className='h-8 w-8 rounded' />
								</div>

								<div className='grid grid-cols-2 gap-3 mb-3'>
									<div>
										<Skeleton className='h-3 w-10 mb-1' />
										<Skeleton className='h-4 w-16' />
									</div>
									<div>
										<Skeleton className='h-3 w-10 mb-1' />
										<Skeleton className='h-5 w-14 rounded-full' />
									</div>
								</div>

								<div className='grid grid-cols-2 gap-3'>
									<Skeleton className='h-4 w-20' />
									<Skeleton className='h-4 w-18' />
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			</>
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

	return (
		<>
			{/* Desktop Table View */}
			<div className='hidden lg:block overflow-x-auto'>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className='text-xs font-medium'>Order #</TableHead>
							<TableHead className='text-xs font-medium'>Worker</TableHead>
							<TableHead className='text-xs font-medium'>Branch</TableHead>
							<TableHead className='text-xs font-medium'>
								Requested Date
							</TableHead>
							<TableHead className='text-xs font-medium'>Status</TableHead>
							<TableHead className='text-xs font-medium'>Items</TableHead>
							<TableHead className='text-xs font-medium'>Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{orders.map(order => (
							<TableRow
								key={order._id}
								className='hover:bg-gray-50 cursor-pointer'
								onClick={() => onViewOrder(order)}
							>
								<TableCell className='font-medium text-sm'>
									{order.orderNumber}
								</TableCell>
								<TableCell className='text-sm'>
									{order.worker.username}
								</TableCell>
								<TableCell className='text-sm'>{order.branch}</TableCell>
								<TableCell className='text-sm'>
									{formatDate(order.requestedDate)}
								</TableCell>
								<TableCell>
									<span
										className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(
											order.status
										)}`}
									>
										{order.status}
									</span>
								</TableCell>
								<TableCell className='text-sm'>
									{order.items.length} items
								</TableCell>
								<TableCell onClick={e => e.stopPropagation()}>
									<div className='flex gap-1'>
										<Button
											variant='outline'
											size='sm'
											onClick={() => onViewOrder(order)}
											className='h-7 px-2 text-xs'
										>
											<Eye className='h-3 w-3 mr-1' />
											View
										</Button>
										<Button
											variant='outline'
											size='sm'
											onClick={() => onPrintOrder(order)}
											className='h-7 px-2 text-xs'
										>
											<Printer className='h-3 w-3 mr-1' />
											Print
										</Button>
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
												<DropdownMenuItem onClick={() => onUpdateStatus(order)}>
													<Edit className='h-4 w-4 mr-2' />
													Update Status
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</div>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>

			{/* Mobile Card View */}
			<div className='lg:hidden'>
				<div
					className={`space-y-3 ${
						orders.length > 3
							? 'max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100'
							: ''
					}`}
				>
					{orders.map(order => (
						<Card
							key={order._id}
							className='hover:shadow-md transition-shadow cursor-pointer'
							onClick={() => onViewOrder(order)}
						>
							<CardContent className='p-4'>
								<div className='flex items-start justify-between mb-3'>
									<div className='flex-1 min-w-0'>
										<div className='font-mono text-sm font-medium text-gray-900 truncate'>
											{order.orderNumber}
										</div>
										<div className='text-sm text-gray-600 truncate'>
											{order.worker.username}
										</div>
									</div>
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button
												variant='ghost'
												size='sm'
												className='h-8 w-8 p-0'
												onClick={e => e.stopPropagation()}
											>
												<MoreHorizontal className='h-4 w-4' />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align='end'>
											<DropdownMenuItem
												onClick={e => {
													e.stopPropagation()
													onViewOrder(order)
												}}
											>
												<Eye className='h-4 w-4 mr-2' />
												View Details
											</DropdownMenuItem>
											<DropdownMenuItem
												onClick={e => {
													e.stopPropagation()
													onPrintOrder(order)
												}}
											>
												<Printer className='h-4 w-4 mr-2' />
												Print Order
											</DropdownMenuItem>
											<DropdownMenuItem
												onClick={e => {
													e.stopPropagation()
													onUpdateStatus(order)
												}}
											>
												<Edit className='h-4 w-4 mr-2' />
												Update Status
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</div>

								<div className='grid grid-cols-2 gap-3 mb-3'>
									<div>
										<div className='text-xs text-gray-500 mb-1'>Branch</div>
										<div className='text-sm font-medium truncate'>
											{order.branch}
										</div>
									</div>
									<div>
										<div className='text-xs text-gray-500 mb-1'>Status</div>
										<span
											className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(
												order.status
											)} truncate max-w-full`}
										>
											{order.status}
										</span>
									</div>
								</div>

								<div className='grid grid-cols-2 gap-3 text-sm text-gray-600'>
									<div>
										<span className='font-medium'>Items:</span>{' '}
										{order.items.length}
									</div>
									<div>
										<span className='font-medium'>Date:</span>{' '}
										{formatDate(order.requestedDate)}
									</div>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		</>
	)
}

export default OrdersTable
