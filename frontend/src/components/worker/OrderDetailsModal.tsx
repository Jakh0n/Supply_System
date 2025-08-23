import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { ProductThumbnail } from '@/components/ui/ProductImage'
import { getPrimaryImage } from '@/lib/imageUtils'
import { Order } from '@/types'
import { Package } from 'lucide-react'
import React from 'react'
import { formatDate, getStatusDisplay, getTotalQuantity } from './utils'

interface OrderDetailsModalProps {
	order: Order | null
	isOpen: boolean
	onClose: () => void
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
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

	const statusDisplay = getStatusDisplay(order.status)

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className='w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto'>
				<DialogHeader className='pb-4'>
					<DialogTitle className='text-lg sm:text-xl'>
						Order {order.orderNumber}
					</DialogTitle>
					<DialogDescription className='text-sm sm:text-base'>
						Order details and current status
					</DialogDescription>
				</DialogHeader>

				<div className='space-y-4 sm:space-y-6'>
					{/* Order Info */}
					<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4'>
						<div className='space-y-1'>
							<Label className='text-xs sm:text-sm font-medium text-gray-500'>
								Order Number
							</Label>
							<p className='text-sm sm:text-base font-mono font-medium break-all'>
								{order.orderNumber}
							</p>
						</div>
						<div className='space-y-1'>
							<Label className='text-xs sm:text-sm font-medium text-gray-500'>
								Branch
							</Label>
							<p className='text-sm sm:text-base truncate'>{order.branch}</p>
						</div>
						<div className='space-y-1'>
							<Label className='text-xs sm:text-sm font-medium text-gray-500'>
								Status
							</Label>
							<span
								className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusDisplay.color}`}
							>
								{statusDisplay.icon}
								<span className='ml-1'>{statusDisplay.label}</span>
							</span>
						</div>
						<div className='space-y-1'>
							<Label className='text-xs sm:text-sm font-medium text-gray-500'>
								Requested Date
							</Label>
							<p className='text-sm sm:text-base'>
								{formatDate(order.requestedDate)}
							</p>
						</div>
						<div className='space-y-1'>
							<Label className='text-xs sm:text-sm font-medium text-gray-500'>
								Created Date
							</Label>
							<p className='text-sm sm:text-base'>
								{formatDate(order.createdAt)}
							</p>
						</div>
						<div className='space-y-1'>
							<Label className='text-xs sm:text-sm font-medium text-gray-500'>
								Total Items
							</Label>
							<p className='text-sm sm:text-base font-medium'>
								{getTotalQuantity(order)} items
							</p>
						</div>
					</div>

					{/* Order Notes */}
					{order.notes && (
						<div className='space-y-2'>
							<Label className='text-xs sm:text-sm font-medium text-gray-500'>
								Order Notes
							</Label>
							<p className='text-xs sm:text-sm bg-gray-50 p-3 rounded-lg'>
								{order.notes}
							</p>
						</div>
					)}

					{/* Admin Notes */}
					{order.adminNotes && (
						<div className='space-y-2'>
							<Label className='text-xs sm:text-sm font-medium text-gray-500'>
								Admin Notes
							</Label>
							<p className='text-xs sm:text-sm bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400'>
								{order.adminNotes}
							</p>
						</div>
					)}

					{/* Order Items */}
					<div className='space-y-3'>
						<Label className='text-xs sm:text-sm font-medium text-gray-500 block'>
							Order Items ({order.items.length})
						</Label>
						<div
							className={`space-y-2 sm:space-y-3 ${
								order.items.length > 6
									? 'max-h-60 sm:max-h-80 overflow-y-auto pr-2'
									: ''
							}`}
						>
							{order.items.map((item, index) => (
								<div
									key={item.product?._id || `deleted-${index}`}
									className='flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg'
								>
									<div className='flex-1 min-w-0'>
										<div className='flex items-center'>
											{item.product ? (
												<>
													<div className='w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0 mr-2'>
														<ProductThumbnail
															src={getPrimaryImage(item.product)}
															alt={item.product.name}
															category={item.product.category}
															size='sm'
															className='rounded-lg'
														/>
													</div>
													<div className='min-w-0 flex-1'>
														<p className='font-medium text-xs sm:text-sm truncate'>
															{item.product.name}
														</p>
														<p className='text-xs text-gray-500 truncate'>
															{getCategoryDisplayName(item.product.category)} •{' '}
															{item.product.unit}
														</p>
													</div>
												</>
											) : (
												<>
													<div className='w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0 mr-2 bg-red-100 rounded-lg flex items-center justify-center'>
														<Package className='h-4 w-4 text-red-500' />
													</div>
													<div className='min-w-0 flex-1'>
														<p className='font-medium text-xs sm:text-sm truncate text-red-600'>
															Product Deleted
														</p>
														<p className='text-xs text-red-500 truncate'>
															Product no longer available
														</p>
														{/* Item notes removed - using order-level notes only */}
													</div>
												</>
											)}
										</div>
									</div>
									<div className='text-right flex-shrink-0 ml-2'>
										<p
											className={`font-medium text-xs sm:text-sm ${
												!item.product ? 'text-red-600' : ''
											}`}
										>
											{item.quantity} {item.product?.unit || 'unit'}
										</p>
									</div>
								</div>
							))}
						</div>
					</div>

					{/* Order Summary */}
					<div className='border-t pt-3 sm:pt-4 space-y-2'>
						<div className='flex justify-between items-center'>
							<span className='text-xs sm:text-sm text-gray-600'>
								Total Items:
							</span>
							<span className='font-medium text-xs sm:text-sm'>
								{getTotalQuantity(order)} items
							</span>
						</div>
						<div className='flex justify-between items-center'>
							<span className='text-xs sm:text-sm text-gray-600'>
								Number of Products:
							</span>
							<span className='font-medium text-xs sm:text-sm'>
								{order.items.length}
							</span>
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	)
}

export default OrderDetailsModal
