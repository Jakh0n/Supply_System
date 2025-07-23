import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { Plus, ShoppingCart } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

const QuickActions: React.FC = () => {
	return (
		<div className='grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6'>
			<Link href='/worker/new-order' className='block'>
				<Card className='cursor-pointer hover:shadow-lg transition-all duration-200 h-full border-l-4 border-l-green-500 hover:border-l-green-600'>
					<CardHeader className='p-4 sm:p-6'>
						<CardTitle className='flex items-center text-base sm:text-lg'>
							<div className='p-2 bg-green-100 rounded-lg mr-3'>
								<Plus className='h-4 w-4 sm:h-5 sm:w-5 text-green-600' />
							</div>
							<span>Create New Order</span>
						</CardTitle>
						<CardDescription className='text-sm sm:text-base mt-2'>
							Submit a new supply request for your branch
						</CardDescription>
					</CardHeader>
				</Card>
			</Link>

			<Link href='/worker/orders' className='block'>
				<Card className='cursor-pointer hover:shadow-lg transition-all duration-200 h-full border-l-4 border-l-blue-500 hover:border-l-blue-600'>
					<CardHeader className='p-4 sm:p-6'>
						<CardTitle className='flex items-center text-base sm:text-lg'>
							<div className='p-2 bg-blue-100 rounded-lg mr-3'>
								<ShoppingCart className='h-4 w-4 sm:h-5 sm:w-5 text-blue-600' />
							</div>
							<span>View My Orders</span>
						</CardTitle>
						<CardDescription className='text-sm sm:text-base mt-2'>
							Check the status of your submitted orders
						</CardDescription>
					</CardHeader>
				</Card>
			</Link>
		</div>
	)
}

export default QuickActions
