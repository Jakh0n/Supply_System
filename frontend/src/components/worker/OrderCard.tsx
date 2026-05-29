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
		<div className='group flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 sm:p-5 bg-white sm:hover:bg-gradient-to-r sm:hover:from-blue-50 sm:hover:to-indigo-50 rounded-xl transition-all duration-300 border border-gray-100 sm:hover:border-blue-200 shadow-md sm:shadow-lg sm:hover:shadow-xl'>
			<div className='flex-1 min-w-0'>
				<div className='flex items-start justify-between gap-3'>
					<div className='flex items-center min-w-0 flex-1'>
						<div className='p-2 sm:p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg mr-3 shrink-0 shadow-md sm:group-hover:shadow-lg transition-shadow'>
							<FileText className='h-4 w-4 sm:h-5 sm:w-5 text-white' />
						</div>
						<div className='min-w-0 flex-1'>
							<p className='font-semibold text-sm sm:text-base truncate text-gray-900 sm:group-hover:text-blue-900 transition-colors'>
								Order {order.orderNumber}
							</p>
							<p className='text-xs sm:text-sm text-gray-600 truncate mt-0.5 sm:mt-1'>
								{order.branch} • {formatDate(order.requestedDate)}
							</p>
							<p className='text-xs text-gray-500 mt-1 md:hidden'>
								{order.items.length} items • {getTotalQuantity(order)} total
							</p>
						</div>
					</div>
					<span
						className={`inline-flex items-center px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 shadow-sm ${statusDisplay.color}`}
					>
						{statusDisplay.icon}
						<span className='ml-1 sm:ml-1.5'>{statusDisplay.label}</span>
					</span>
				</div>
				<p className='hidden md:block text-xs text-gray-500 font-medium mt-2 pl-11 sm:pl-12'>
					{order.items.length} items • {getTotalQuantity(order)} total
				</p>
			</div>
			<div className='shrink-0 md:ml-4'>
				<Button
					variant='outline'
					size='sm'
					onClick={() => onViewOrder(order._id)}
					className='w-full md:w-auto text-xs sm:text-sm h-9 sm:h-9 bg-white sm:hover:bg-blue-50 border-blue-200 sm:hover:border-blue-300 text-blue-700 sm:hover:text-blue-800 font-medium rounded-lg transition-all duration-200 shadow-sm sm:hover:shadow-md'
				>
					View Details
				</Button>
			</div>
		</div>
	)
}

export default OrderCard
