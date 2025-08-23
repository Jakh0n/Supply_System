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
import {
	Calendar,
	CalendarDays,
	Clock,
	Package,
	RefreshCw,
	ShoppingCart,
	X,
} from 'lucide-react'
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
	dateFilter: 'all' | 'today' | 'yesterday' | 'weekly'
	onViewOrder: (orderId: string) => void
	onPageChange: (page: number) => void
	onDateFilterChange: (
		dateFilter: 'all' | 'today' | 'yesterday' | 'weekly'
	) => void
	onRetry: () => void
}

const RecentOrdersList: React.FC<RecentOrdersListProps> = ({
	orders,
	totalOrders,
	currentPage,
	totalPages,
	loading,
	error,
	dateFilter,
	onViewOrder,
	onPageChange,
	onDateFilterChange,
	onRetry,
}) => {
	// Show skeleton during initial loading
	if (loading && orders.length === 0) {
		return <RecentOrdersListSkeleton />
	}

	// Quick filter functions
	const applyQuickFilter = (
		filterType: 'all' | 'today' | 'yesterday' | 'weekly'
	) => {
		onDateFilterChange(filterType)
	}

	const clearFilters = () => {
		onDateFilterChange('all')
	}

	const activeFiltersCount = dateFilter !== 'all' ? 1 : 0

	const getFilterDisplayName = (filter: string) => {
		switch (filter) {
			case 'today':
				return 'Today'
			case 'yesterday':
				return 'Yesterday'
			case 'weekly':
				return 'This Week'
			case 'all':
				return 'All Time'
			default:
				return filter
		}
	}

	const quickFilters = [
		{
			label: 'All Time',
			action: () => applyQuickFilter('all'),
			icon: Package,
			color: 'bg-gray-500',
		},
		{
			label: 'Today',
			action: () => applyQuickFilter('today'),
			icon: Calendar,
			color: 'bg-blue-500',
		},
		{
			label: 'Yesterday',
			action: () => applyQuickFilter('yesterday'),
			icon: Clock,
			color: 'bg-purple-500',
		},
		{
			label: 'This Week',
			action: () => applyQuickFilter('weekly'),
			icon: CalendarDays,
			color: 'bg-green-500',
		},
	]

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
				<div className='flex flex-col gap-4'>
					<div className='flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4'>
						<div>
							<CardTitle className='text-lg sm:text-xl flex items-center gap-2'>
								<ShoppingCart className='h-5 w-5 text-blue-500' />
								Recent Orders
							</CardTitle>
							<CardDescription className='text-sm sm:text-base'>
								Your latest order submissions
								{totalOrders > 0 && ` (${totalOrders} total)`}
							</CardDescription>
						</div>
						<Button
							onClick={onRetry}
							variant='ghost'
							size='sm'
							className='h-7 w-7 p-0'
							disabled={loading}
						>
							<RefreshCw
								className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}
							/>
						</Button>
					</div>

					{/* UX-Friendly Filters */}
					<div className='space-y-3'>
						{/* Quick Filters */}
						<div className='flex items-center justify-between'>
							<div className='flex items-center gap-2'>
								<span className='text-sm font-medium text-gray-700'>
									Quick filters:
								</span>
								<div className='flex items-center gap-1'>
									{quickFilters.map((filter, index) => (
										<Button
											key={index}
											onClick={filter.action}
											variant={
												(filter.label === 'All Time' && dateFilter === 'all') ||
												(filter.label === 'Today' && dateFilter === 'today') ||
												(filter.label === 'Yesterday' &&
													dateFilter === 'yesterday') ||
												(filter.label === 'This Week' &&
													dateFilter === 'weekly')
													? 'default'
													: 'outline'
											}
											size='sm'
											className='h-7 px-3 text-xs font-medium'
										>
											<filter.icon className='h-3 w-3 mr-1' />
											{filter.label}
										</Button>
									))}
								</div>
							</div>
						</div>

						{/* Active Filters Display */}
						{activeFiltersCount > 0 && (
							<div className='flex items-center gap-2 p-3 bg-blue-50 rounded-md border border-blue-200'>
								<span className='text-sm font-medium text-blue-700'>
									Active:
								</span>
								<div className='flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs font-medium'>
									<Calendar className='h-3 w-3' />
									{getFilterDisplayName(dateFilter)}
									<Button
										onClick={clearFilters}
										variant='ghost'
										size='sm'
										className='h-4 w-4 p-0 ml-1 hover:bg-blue-200 text-blue-600'
									>
										<X className='h-3 w-3' />
									</Button>
								</div>
							</div>
						)}
					</div>
				</div>
			</CardHeader>
			<CardContent className='p-4 sm:p-6 pt-0'>{renderContent()}</CardContent>
		</Card>
	)
}

export default RecentOrdersList
