import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { Plus, ShoppingCart, Users } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

const QuickActions: React.FC = () => {
	return (
		<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6'>
			<Link href='/worker/new-order' className='block group'>
				<Card className='cursor-pointer transition-all duration-300 h-full border-0 bg-gradient-to-br from-white to-green-50 sm:hover:from-green-50 sm:hover:to-green-100 shadow-lg sm:hover:shadow-2xl sm:hover:scale-105'>
					<CardHeader className='p-5 sm:p-6'>
						<CardTitle className='flex items-center text-base sm:text-lg text-gray-900'>
							<div className='p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl mr-4 shadow-lg sm:group-hover:shadow-xl transition-shadow'>
								<Plus className='h-5 w-5 sm:h-6 sm:w-6 text-white' />
							</div>
							<span className='font-semibold'>Create New Order</span>
						</CardTitle>
						<CardDescription className='text-sm sm:text-base mt-3 text-gray-600 leading-relaxed'>
							Submit a new supply request for your branch
						</CardDescription>
					</CardHeader>
				</Card>
			</Link>

			<Link href='/worker/orders' className='block group'>
				<Card className='cursor-pointer transition-all duration-300 h-full border-0 bg-gradient-to-br from-white to-blue-50 sm:hover:from-blue-50 sm:hover:to-blue-100 shadow-lg sm:hover:shadow-2xl sm:hover:scale-105'>
					<CardHeader className='p-5 sm:p-6'>
						<CardTitle className='flex items-center text-base sm:text-lg text-gray-900'>
							<div className='p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl mr-4 shadow-lg sm:group-hover:shadow-xl transition-shadow'>
								<ShoppingCart className='h-5 w-5 sm:h-6 sm:w-6 text-white' />
							</div>
							<span className='font-semibold'>View My Orders</span>
						</CardTitle>
						<CardDescription className='text-sm sm:text-base mt-3 text-gray-600 leading-relaxed'>
							Check the status of your submitted orders
						</CardDescription>
					</CardHeader>
				</Card>
			</Link>

			<Link href='/worker/all-orders' className='block group'>
				<Card className='cursor-pointer transition-all duration-300 h-full border-0 bg-gradient-to-br from-white to-purple-50 sm:hover:from-purple-50 sm:hover:to-purple-100 shadow-lg sm:hover:shadow-2xl sm:hover:scale-105'>
					<CardHeader className='p-5 sm:p-6'>
						<CardTitle className='flex items-center text-base sm:text-lg text-gray-900'>
							<div className='p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl mr-4 shadow-lg sm:group-hover:shadow-xl transition-shadow'>
								<Users className='h-5 w-5 sm:h-6 sm:w-6 text-white' />
							</div>
							<span className='font-semibold'>All Team Orders</span>
						</CardTitle>
						<CardDescription className='text-sm sm:text-base mt-3 text-gray-600 leading-relaxed'>
							View all orders from your team - perfect for coordination
						</CardDescription>
					</CardHeader>
				</Card>
			</Link>
		</div>
	)
}

export default QuickActions
