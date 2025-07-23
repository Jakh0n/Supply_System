import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

interface MyOrdersHeaderProps {
	branch?: string
}

const MyOrdersHeader: React.FC<MyOrdersHeaderProps> = ({ branch }) => {
	return (
		<div className='flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4'>
			<div className='min-w-0 flex-1'>
				<h1 className='text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900'>
					My Orders
				</h1>
				<p className='mt-1 sm:mt-2 text-sm sm:text-base text-gray-600'>
					Track and manage your supply requests
					{branch && ` for ${branch}`}
				</p>
			</div>
			<div className='flex-shrink-0 hidden sm:block'>
				<Link href='/worker/new-order'>
					<Button className='flex items-center justify-center h-9 text-base'>
						<Plus className='h-4 w-4 mr-2' />
						New Order
					</Button>
				</Link>
			</div>
		</div>
	)
}

export default MyOrdersHeader
