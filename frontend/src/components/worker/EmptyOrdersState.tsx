import { Button } from '@/components/ui/button'
import { Plus, ShoppingCart } from 'lucide-react'
import Link from 'next/link'

const EmptyOrdersState = () => {
	return (
		<div className='text-center py-6 sm:py-8'>
			<div className='mb-4'>
				<ShoppingCart className='h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-3 sm:mb-4' />
				<p className='text-gray-500 text-sm sm:text-base mb-4'>
					No recent orders found
				</p>
			</div>
			<Link href='/worker/new-order'>
				<Button className='w-full sm:w-auto'>
					<Plus className='h-4 w-4 mr-2' />
					Create Your First Order
				</Button>
			</Link>
		</div>
	)
}

export default EmptyOrdersState
