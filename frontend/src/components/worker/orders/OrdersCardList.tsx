import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Order, Product } from '@/types'
import { Calendar, Eye, Package, Trash2 } from 'lucide-react'
import Image from 'next/image'
import React from 'react'

// Helper function to get primary image
const getPrimaryImage = (product: Product) => {
	return product.images?.find(img => img.isPrimary) || product.images?.[0]
}

interface OrdersCardListProps {
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

const OrdersCardList: React.FC<OrdersCardListProps> = ({
	orders,
	onViewOrder,
	onDeleteOrder,
}) => {
	return (
		<div className='sm:hidden space-y-3'>
			{orders.map(order => (
				<Card key={order._id} className='overflow-hidden'>
					<CardContent className='p-4'>
						{/* Header with Order ID and Status */}
						<div className='flex items-center justify-between mb-3'>
							<div className='flex items-center space-x-2'>
								<Package className='h-4 w-4 text-gray-500' />
								<span className='font-medium text-sm'>
									#{order._id.slice(-6).toUpperCase()}
								</span>
							</div>
							<Badge variant={getStatusBadgeVariant(order.status)}>
								{order.status.charAt(0).toUpperCase() + order.status.slice(1)}
							</Badge>
						</div>

						{/* Date */}
						<div className='flex items-center space-x-2 mb-3'>
							<Calendar className='h-4 w-4 text-gray-500' />
							<span className='text-sm text-gray-600'>
								{formatDate(order.createdAt)}
							</span>
						</div>

						{/* Items Preview */}
						<div className='mb-3'>
							<div className='text-xs text-gray-500 mb-2'>Items:</div>
							<div className='space-y-2'>
								{order.items.slice(0, 2).map((item, index) => (
									<div key={index} className='flex items-center gap-2'>
										<div className='w-6 h-6 rounded overflow-hidden bg-gray-100 flex-shrink-0'>
											{getPrimaryImage(item.product) ? (
												<Image
													src={getPrimaryImage(item.product)!.url}
													alt={item.product.name}
													width={24}
													height={24}
													className='w-full h-full object-cover'
												/>
											) : (
												<div className='w-full h-full flex items-center justify-center'>
													<Package className='w-3 h-3 text-gray-400' />
												</div>
											)}
										</div>
										<div className='text-sm truncate flex-1'>
											{item.product.name} (x{item.quantity})
										</div>
									</div>
								))}
								{order.items.length > 2 && (
									<div className='text-xs text-gray-500 ml-8'>
										+{order.items.length - 2} more items
									</div>
								)}
							</div>
						</div>

						{/* Total Quantity */}
						<div className='mb-4'>
							<span className='text-xs text-gray-500'>Total Quantity: </span>
							<span className='text-sm font-medium'>
								{getTotalQuantity(order.items)}
							</span>
						</div>

						{/* Actions */}
						<div className='flex items-center justify-between'>
							<Button
								variant='outline'
								size='sm'
								onClick={() => onViewOrder(order)}
								className='flex items-center space-x-1 h-8'
							>
								<Eye className='h-3 w-3' />
								<span className='text-xs'>View</span>
							</Button>
							{order.status === 'pending' && (
								<Button
									variant='outline'
									size='sm'
									onClick={() => onDeleteOrder(order._id)}
									className='flex items-center space-x-1 h-8 text-red-600 hover:text-red-700 hover:bg-red-50'
								>
									<Trash2 className='h-3 w-3' />
									<span className='text-xs'>Delete</span>
								</Button>
							)}
						</div>
					</CardContent>
				</Card>
			))}
		</div>
	)
}

export default OrdersCardList
