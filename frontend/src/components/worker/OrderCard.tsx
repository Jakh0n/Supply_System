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
		<div className='group flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 bg-white sm:hover:bg-gradient-to-r sm:hover:from-blue-50 sm:hover:to-indigo-50 rounded-xl transition-all duration-300 border border-gray-100 sm:hover:border-blue-200 shadow-lg sm:hover:shadow-xl sm:hover:scale-[1.02]'>
			<div className='flex-1 min-w-0'>
				<div className='flex items-start sm:items-center justify-between mb-4 sm:mb-0'>
					<div className='flex items-center min-w-0 flex-1'>
						<div className='p-2 sm:p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg mr-3 sm:mr-4 flex-shrink-0 shadow-md sm:group-hover:shadow-lg transition-shadow'>
							<FileText className='h-4 w-4 sm:h-5 sm:w-5 text-white' />
						</div>
						<div className='min-w-0 flex-1'>
							<p className='font-semibold text-sm sm:text-base truncate text-gray-900 sm:group-hover:text-blue-900 transition-colors'>
								Order {order.orderNumber}
							</p>
							<p className='text-xs sm:text-sm text-gray-600 truncate mt-1'>
								{order.branch} • {formatDate(order.requestedDate)}
							</p>
							<p className='text-xs text-gray-500 sm:hidden mt-1'>
								{order.items.length} items • {getTotalQuantity(order)} total
							</p>
						</div>
					</div>
					<div className='flex flex-col sm:flex-row items-end sm:items-center gap-2 sm:gap-3 ml-2'>
						<span
							className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shadow-sm transition-all duration-200 ${statusDisplay.color}`}
						>
							{statusDisplay.icon}
							<span className='ml-1.5'>{statusDisplay.label}</span>
						</span>
						<div className='hidden sm:block text-xs text-gray-500 font-medium'>
							{order.items.length} items • {getTotalQuantity(order)} total
						</div>
					</div>
				</div>
			</div>
			<div className='mt-4 sm:mt-0 sm:ml-4 flex-shrink-0'>
				<Button
					variant='outline'
					size='sm'
					onClick={() => onViewOrder(order._id)}
					className='w-full sm:w-auto text-xs sm:text-sm h-10 sm:h-9 bg-white sm:hover:bg-blue-50 border-blue-200 sm:hover:border-blue-300 text-blue-700 sm:hover:text-blue-800 font-medium rounded-lg transition-all duration-200 shadow-sm sm:hover:shadow-md'
				>
					View Details
				</Button>
			</div>
		</div>
	)
}

export default OrderCard
