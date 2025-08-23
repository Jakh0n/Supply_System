import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { ProductThumbnail } from '@/components/ui/ProductImage'
import { getPrimaryImage } from '@/lib/imageUtils'
import { Order } from '@/types'
import { Calendar, MapPin, Package, User, X } from 'lucide-react'
import React from 'react'

interface OrderDetailModalProps {
	order: Order | null
	isOpen: boolean
	onClose: () => void
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
		month: 'long',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	})
}

// Helper function to get total quantity
const getTotalQuantity = (items: Array<{ quantity: number }>): number => {
	return items.reduce((total, item) => total + item.quantity, 0)
}

// getPrimaryImage function is now imported from imageUtils

const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
	order,
	isOpen,
	onClose,
}) => {
	// Map legacy categories to display names
	const getCategoryDisplayName = (category: string): string => {
		const categoryMap: Record<string, string> = {
			// Legacy categories mapping
			food: 'Main Products',
			beverages: 'Desserts and Drinks',
			cleaning: 'Cleaning Materials',
			equipment: 'Packaging Materials',
			packaging: 'Packaging Materials',
			other: 'Main Products',
		}
		return categoryMap[category] || category
	}
	if (!order) return null

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
				<DialogHeader>
					<div className='flex items-center justify-between'>
						<div>
							<DialogTitle className='flex items-center space-x-2'>
								<Package className='h-5 w-5' />
								<span>Order #{order._id.slice(-6).toUpperCase()}</span>
							</DialogTitle>
							<DialogDescription className='mt-1'>
								Order details and information
							</DialogDescription>
						</div>
						<Badge
							variant={getStatusBadgeVariant(order.status)}
							className='ml-2'
						>
							{order.status.charAt(0).toUpperCase() + order.status.slice(1)}
						</Badge>
					</div>
				</DialogHeader>

				<div className='space-y-6'>
					{/* Order Information */}
					<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
						<div className='space-y-3'>
							<div className='flex items-center space-x-2'>
								<User className='h-4 w-4 text-gray-500' />
								<div>
									<div className='text-sm font-medium'>Worker</div>
									<div className='text-sm text-gray-600'>
										{order.worker.username}
									</div>
								</div>
							</div>
							<div className='flex items-center space-x-2'>
								<MapPin className='h-4 w-4 text-gray-500' />
								<div>
									<div className='text-sm font-medium'>Branch</div>
									<div className='text-sm text-gray-600'>{order.branch}</div>
								</div>
							</div>
						</div>
						<div className='space-y-3'>
							<div className='flex items-center space-x-2'>
								<Calendar className='h-4 w-4 text-gray-500' />
								<div>
									<div className='text-sm font-medium'>Created</div>
									<div className='text-sm text-gray-600'>
										{formatDate(order.createdAt)}
									</div>
								</div>
							</div>
							<div className='flex items-center space-x-2'>
								<Calendar className='h-4 w-4 text-gray-500' />
								<div>
									<div className='text-sm font-medium'>Requested Date</div>
									<div className='text-sm text-gray-600'>
										{formatDate(order.requestedDate)}
									</div>
								</div>
							</div>
						</div>
					</div>

					<div className='border-t border-gray-200 my-6'></div>

					{/* Order Items */}
					<div>
						<h3 className='text-lg font-semibold mb-4 flex items-center space-x-2'>
							<Package className='h-5 w-5' />
							<span>Order Items ({order.items.length})</span>
						</h3>
						<div className='space-y-3'>
							{order.items.map((item, index) => {
								if (!item.product) {
									return (
										<div
											key={`deleted-${index}`}
											className='flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200'
										>
											<div className='flex items-center flex-1'>
												<div className='w-10 h-10 flex-shrink-0 mr-3 bg-red-100 rounded-lg flex items-center justify-center'>
													<Package className='h-5 w-5 text-red-500' />
												</div>
												<div className='flex-1'>
													<div className='font-medium text-red-600'>
														Product Deleted
													</div>
													<div className='text-sm text-red-500'>
														Product no longer available
													</div>
												</div>
											</div>
											<div className='text-right'>
												<div className='font-medium text-red-600'>
													x{item.quantity}
												</div>
												<div className='text-sm text-red-500'>N/A</div>
											</div>
										</div>
									)
								}

								return (
									<div
										key={index}
										className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'
									>
										<div className='flex items-center flex-1'>
											<div className='w-10 h-10 flex-shrink-0 mr-3'>
												<ProductThumbnail
													src={getPrimaryImage(item.product)}
													alt={item.product.name}
													category={item.product.category}
													size='sm'
													priority={false}
												/>
											</div>
											<div className='flex-1'>
												<div className='font-medium'>{item.product.name}</div>
												<div className='text-sm text-gray-600'>
													{getCategoryDisplayName(item.product.category)} •{' '}
													{item.product.unit}
												</div>
											</div>
										</div>
										<div className='text-right'>
											<div className='font-medium'>x{item.quantity}</div>
											<div className='text-sm text-gray-600'>
												${(item.product.price * item.quantity).toFixed(2)}
											</div>
										</div>
									</div>
								)
							})}
						</div>

						{/* Order Summary */}
						<div className='mt-4 p-3 bg-blue-50 rounded-lg'>
							<div className='flex justify-between items-center'>
								<span className='font-medium'>Total Quantity:</span>
								<span className='font-semibold'>
									{getTotalQuantity(order.items)}
								</span>
							</div>
							<div className='flex justify-between items-center mt-1'>
								<span className='font-medium'>Total Value:</span>
								<span className='font-semibold'>
									$
									{order.items
										.reduce(
											(total, item) =>
												total +
												(item.product?.price
													? item.product.price * item.quantity
													: 0),
											0
										)
										.toFixed(2)}
								</span>
							</div>
						</div>
					</div>

					{/* Notes */}
					{(order.notes || order.adminNotes) && (
						<>
							<div className='border-t border-gray-200 my-6'></div>
							<div>
								<h3 className='text-lg font-semibold mb-3'>Notes</h3>
								{order.notes && (
									<div className='mb-3'>
										<div className='text-sm font-medium text-gray-700 mb-1'>
											Worker Notes:
										</div>
										<div className='text-sm text-gray-600 p-2 bg-gray-50 rounded'>
											{order.notes}
										</div>
									</div>
								)}
								{order.adminNotes && (
									<div>
										<div className='text-sm font-medium text-gray-700 mb-1'>
											Admin Notes:
										</div>
										<div className='text-sm text-gray-600 p-2 bg-gray-50 rounded'>
											{order.adminNotes}
										</div>
									</div>
								)}
							</div>
						</>
					)}

					{/* Processing Information */}
					{order.processedBy && order.processedAt && (
						<>
							<div className='border-t border-gray-200 my-6'></div>
							<div>
								<h3 className='text-lg font-semibold mb-3'>Processing Info</h3>
								<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
									<div>
										<div className='text-sm font-medium text-gray-700'>
											Processed By:
										</div>
										<div className='text-sm text-gray-600'>
											{order.processedBy.username}
										</div>
									</div>
									<div>
										<div className='text-sm font-medium text-gray-700'>
											Processed At:
										</div>
										<div className='text-sm text-gray-600'>
											{formatDate(order.processedAt)}
										</div>
									</div>
								</div>
							</div>
						</>
					)}
				</div>

				{/* Close Button */}
				<div className='flex justify-end pt-4'>
					<Button onClick={onClose} variant='outline'>
						<X className='h-4 w-4 mr-2' />
						Close
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	)
}

export default OrderDetailModal
