import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import { Order } from '@/types'
import { Eye, Trash2 } from 'lucide-react'
import React from 'react'

interface OrdersTableProps {
	orders: Order[]
	onViewOrder: (order: Order) => void
	onDeleteOrder: (orderId: string) => void
}

// Helper function to get status badge variant
const getStatusBadgeVariant = (status: string) => {
	switch (status) {
		case 'pending':
			return 'secondary'
		case 'approved':
			return 'default'
		case 'rejected':
			return 'destructive'
		case 'completed':
			return 'outline'
		default:
			return 'secondary'
	}
}

// Helper function to format date
const formatDate = (dateString: string): string => {
	return new Date(dateString).toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
	})
}

// Helper function to get total quantity
const getTotalQuantity = (items: Array<{ quantity: number }>): number => {
	return items.reduce((total, item) => total + item.quantity, 0)
}

const OrdersTable: React.FC<OrdersTableProps> = ({
	orders,
	onViewOrder,
	onDeleteOrder,
}) => {
	return (
		<div className='hidden sm:block'>
			<div className='rounded-md border'>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className='w-[100px]'>Order ID</TableHead>
							<TableHead>Date</TableHead>
							<TableHead>Items</TableHead>
							<TableHead>Total Qty</TableHead>
							<TableHead>Status</TableHead>
							<TableHead className='text-right'>Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{orders.map(order => (
							<TableRow key={order._id}>
								<TableCell className='font-medium'>
									#{order._id.slice(-6).toUpperCase()}
								</TableCell>
								<TableCell>{formatDate(order.createdAt)}</TableCell>
								<TableCell>
									<div className='space-y-1'>
										{order.items.slice(0, 2).map((item, index) => (
											<div key={index} className='text-sm'>
												{item.product.name} (x{item.quantity})
											</div>
										))}
										{order.items.length > 2 && (
											<div className='text-xs text-gray-500'>
												+{order.items.length - 2} more items
											</div>
										)}
									</div>
								</TableCell>
								<TableCell>{getTotalQuantity(order.items)}</TableCell>
								<TableCell>
									<Badge variant={getStatusBadgeVariant(order.status)}>
										{order.status.charAt(0).toUpperCase() +
											order.status.slice(1)}
									</Badge>
								</TableCell>
								<TableCell className='text-right'>
									<div className='flex items-center justify-end space-x-2'>
										<Button
											variant='outline'
											size='sm'
											onClick={() => onViewOrder(order)}
											className='h-8 w-8 p-0'
										>
											<Eye className='h-4 w-4' />
											<span className='sr-only'>View order</span>
										</Button>
										{order.status === 'pending' && (
											<Button
												variant='outline'
												size='sm'
												onClick={() => onDeleteOrder(order._id)}
												className='h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50'
											>
												<Trash2 className='h-4 w-4' />
												<span className='sr-only'>Delete order</span>
											</Button>
										)}
									</div>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
		</div>
	)
}

export default OrdersTable
