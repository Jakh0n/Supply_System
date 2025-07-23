import { Button } from '@/components/ui/button'
import { Order } from '@/types'
import { FileText } from 'lucide-react'
import React from 'react'
import { formatDate, getStatusDisplay, getTotalQuantity } from './utils'

interface OrderCardProps {
	order: Order
	onViewOrder: (orderId: string) => void
}

const OrderCard: React.FC<OrderCardProps> = ({ order, onViewOrder }) => {
	const statusDisplay = getStatusDisplay(order.status)

	return (
		<div className='flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200'>
			<div className='flex-1 min-w-0'>
				<div className='flex items-start sm:items-center justify-between mb-2 sm:mb-0'>
					<div className='flex items-center min-w-0 flex-1'>
						<div className='p-1.5 sm:p-2 bg-white rounded-md mr-2 sm:mr-3 flex-shrink-0'>
							<FileText className='h-4 w-4 sm:h-5 sm:w-5 text-gray-400' />
						</div>
						<div className='min-w-0 flex-1'>
							<p className='font-medium text-sm sm:text-base truncate'>
								Order {order.orderNumber}
							</p>
							<p className='text-xs sm:text-sm text-gray-500 truncate'>
								{order.branch} • {formatDate(order.requestedDate)}
							</p>
							<p className='text-xs text-gray-400 sm:hidden mt-1'>
								{order.items.length} items • {getTotalQuantity(order)} total
							</p>
						</div>
					</div>
					<div className='flex flex-col sm:flex-row items-end sm:items-center gap-2 sm:gap-3 ml-2'>
						<span
							className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${statusDisplay.color}`}
						>
							{statusDisplay.icon}
							<span className='ml-1'>{statusDisplay.label}</span>
						</span>
						<div className='hidden sm:block text-xs text-gray-500'>
							{order.items.length} items • {getTotalQuantity(order)} total
						</div>
					</div>
				</div>
			</div>
			<div className='mt-3 sm:mt-0 sm:ml-4 flex-shrink-0'>
				<Button
					variant='outline'
					size='sm'
					onClick={() => onViewOrder(order._id)}
					className='w-full sm:w-auto text-xs sm:text-sm h-8 sm:h-9'
				>
					View Details
				</Button>
			</div>
		</div>
	)
}

export default OrderCard
