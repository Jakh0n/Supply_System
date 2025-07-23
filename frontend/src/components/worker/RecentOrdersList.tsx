import { RecentOrdersListSkeleton } from '@/components/skeletonLoadings/worker'
import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { Order } from '@/types'
import { ShoppingCart } from 'lucide-react'
import Link from 'next/link'
import React from 'react'
import EmptyOrdersState from './EmptyOrdersState'
import ErrorState from './ErrorState'
import OrderCard from './OrderCard'
import Pagination from './Pagination'

interface RecentOrdersListProps {
	orders: Order[]
	totalOrders: number
	currentPage: number
	totalPages: number
	loading: boolean
	error: string
	onViewOrder: (orderId: string) => void
	onPageChange: (page: number) => void
	onRetry: () => void
}

const RecentOrdersList: React.FC<RecentOrdersListProps> = ({
	orders,
	totalOrders,
	currentPage,
	totalPages,
	loading,
	error,
	onViewOrder,
	onPageChange,
	onRetry,
}) => {
	// Show skeleton during initial loading
	if (loading && orders.length === 0) {
		return <RecentOrdersListSkeleton />
	}

	const renderContent = () => {
		if (error) {
			return (
				<div className='text-center py-6 sm:py-8'>
					<ErrorState error={error} onRetry={onRetry} retryText='Retry' />
				</div>
			)
		}

		if (orders.length === 0) {
			return <EmptyOrdersState />
		}

		return (
			<div className='space-y-4'>
				{/* Orders List */}
				<div className='space-y-3 sm:space-y-4'>
					{orders.map(order => (
						<OrderCard
							key={order._id}
							order={order}
							onViewOrder={onViewOrder}
						/>
					))}
				</div>

				{/* Pagination */}
				<Pagination
					currentPage={currentPage}
					totalPages={totalPages}
					totalItems={totalOrders}
					onPageChange={onPageChange}
					loading={loading}
					itemName='orders'
				/>

				{/* View All Orders Link */}
				<div className='pt-2 sm:pt-4 border-t border-gray-200'>
					<Link href='/worker/orders' className='block'>
						<Button className='w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-medium h-10 sm:h-9 text-sm sm:text-base shadow-sm hover:shadow-md transition-all duration-200'>
							<ShoppingCart className='h-4 w-4 mr-2' />
							View All Orders
						</Button>
					</Link>
				</div>
			</div>
		)
	}

	return (
		<Card>
			<CardHeader className='p-4 sm:p-6'>
				<div className='flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4'>
					<div>
						<CardTitle className='text-lg sm:text-xl'>Recent Orders</CardTitle>
						<CardDescription className='text-sm sm:text-base'>
							Your latest order submissions
							{totalOrders > 0 && ` (${totalOrders} total)`}
						</CardDescription>
					</div>
				</div>
			</CardHeader>
			<CardContent className='p-4 sm:p-6 pt-0'>{renderContent()}</CardContent>
		</Card>
	)
}

export default RecentOrdersList
