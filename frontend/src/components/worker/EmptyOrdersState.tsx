import { Button } from '@/components/ui/button'
import { Plus, ShoppingCart } from 'lucide-react'
import Link from 'next/link'

const EmptyOrdersState = () => {
	return (
		<div className='text-center py-8 sm:py-12'>
			<div className='mb-6'>
				<div className='p-4 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center shadow-lg'>
					<ShoppingCart className='h-8 w-8 text-blue-600' />
				</div>
				<h3 className='text-lg sm:text-xl font-semibold text-gray-900 mb-2'>
					No Recent Orders
				</h3>
				<p className='text-gray-600 text-sm sm:text-base leading-relaxed max-w-md mx-auto'>
					You haven't submitted any orders yet. Start by creating your first
					supply request!
				</p>
			</div>
			<Link href='/worker/new-order'>
				<Button className='w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-700 sm:hover:from-blue-700 sm:hover:to-blue-800 text-white font-medium h-11 sm:h-10 text-sm sm:text-base shadow-lg sm:hover:shadow-xl transition-all duration-200 sm:hover:scale-105'>
					<Plus className='h-4 w-4 mr-2' />
					Create Your First Order
				</Button>
			</Link>
		</div>
	)
}

export default EmptyOrdersState
