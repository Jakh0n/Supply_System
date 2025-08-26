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
			color: 'bg-slate-600 hover:bg-slate-700',
			activeColor: 'bg-slate-800',
		},
		{
			label: 'Today',
			action: () => applyQuickFilter('today'),
			icon: Calendar,
			color: 'bg-blue-600 hover:bg-blue-700',
			activeColor: 'bg-blue-800',
		},
		{
			label: 'Yesterday',
			action: () => applyQuickFilter('yesterday'),
			icon: Clock,
			color: 'bg-purple-600 hover:bg-purple-700',
			activeColor: 'bg-purple-800',
		},
		{
			label: 'This Week',
			action: () => applyQuickFilter('weekly'),
			icon: CalendarDays,
			color: 'bg-emerald-600 hover:bg-emerald-700',
			activeColor: 'bg-emerald-800',
		},
	]

	const renderContent = () => {
		if (error) {
			return (
				<div className='text-center py-8 sm:py-12'>
					<ErrorState error={error} onRetry={onRetry} retryText='Retry' />
				</div>
			)
		}

		if (orders.length === 0) {
			return <EmptyOrdersState />
		}

		return (
			<div className='space-y-6'>
				{/* Orders List */}
				<div className='space-y-4'>
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
				<div className='pt-4 border-t border-gray-100'>
					<Link href='/worker/orders' className='block'>
						<Button className='w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-700 sm:hover:from-blue-700 sm:hover:to-blue-800 text-white font-medium h-11 sm:h-10 text-sm sm:text-base shadow-lg sm:hover:shadow-xl transition-all duration-200 sm:hover:scale-105'>
							<ShoppingCart className='h-4 w-4 mr-2' />
							View All Orders
						</Button>
					</Link>
				</div>
			</div>
		)
	}

	return (
		<Card className='shadow-lg border-0 bg-gradient-to-br from-white to-gray-50'>
			<CardHeader className='p-6 sm:p-8 pb-4'>
				<div className='flex flex-col gap-6'>
					<div className='flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4'>
						<div className='text-center sm:text-left'>
							<CardTitle className='text-xl sm:text-2xl flex items-center justify-center sm:justify-start gap-3 text-gray-900'>
								<div className='p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg'>
									<ShoppingCart className='h-5 w-5 text-white' />
								</div>
								Recent Orders
							</CardTitle>
							<CardDescription className='text-sm sm:text-base mt-2 text-gray-600'>
								Your latest order submissions
								{totalOrders > 0 && (
									<span className='font-medium text-blue-600'>
										{' '}
										• {totalOrders} total
									</span>
								)}
							</CardDescription>
						</div>
						<Button
							onClick={onRetry}
							variant='ghost'
							size='sm'
							className='h-10 w-10 p-0 self-center sm:self-start rounded-full sm:hover:bg-blue-50 sm:hover:text-blue-600 transition-colors'
							disabled={loading}
						>
							<RefreshCw
								className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`}
							/>
						</Button>
					</div>

					{/* Enhanced Quick Filters */}
					<div className='space-y-4'>
						<div className='text-center sm:text-left'>
							<span className='text-sm font-semibold text-gray-700 bg-gray-100 px-3 py-1 rounded-full'>
								Quick Filters
							</span>
						</div>
						<div className='flex flex-wrap justify-center sm:justify-start items-center gap-3'>
							{quickFilters.map((filter, index) => {
								const isActive =
									(filter.label === 'All Time' && dateFilter === 'all') ||
									(filter.label === 'Today' && dateFilter === 'today') ||
									(filter.label === 'Yesterday' &&
										dateFilter === 'yesterday') ||
									(filter.label === 'This Week' && dateFilter === 'weekly')

								return (
									<Button
										key={index}
										onClick={filter.action}
										variant={isActive ? 'default' : 'outline'}
										size='sm'
										className={`h-9 px-4 text-sm font-medium rounded-full transition-all duration-200 ${
											isActive
												? `${filter.activeColor} text-white shadow-lg`
												: 'border-gray-200 sm:hover:border-gray-300 sm:hover:bg-gray-50'
										}`}
									>
										<filter.icon className='h-4 w-4 mr-2' />
										{filter.label}
									</Button>
								)
							})}
						</div>

						{/* Active Filters Display */}
						{activeFiltersCount > 0 && (
							<div className='flex items-center justify-center sm:justify-start gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100'>
								<span className='text-sm font-semibold text-blue-700'>
									Active Filter:
								</span>
								<div className='flex items-center gap-2 px-3 py-1.5 bg-white text-blue-800 rounded-full text-sm font-medium shadow-sm'>
									<Calendar className='h-4 w-4' />
									{getFilterDisplayName(dateFilter)}
									<Button
										onClick={clearFilters}
										variant='ghost'
										size='sm'
										className='h-5 w-5 p-0 ml-1 sm:hover:bg-blue-100 text-blue-600 rounded-full'
									>
										<X className='h-3 w-3' />
									</Button>
								</div>
							</div>
						)}
					</div>
				</div>
			</CardHeader>
			<CardContent className='p-6 sm:p-8 pt-0'>{renderContent()}</CardContent>
		</Card>
	)
}

export default RecentOrdersList
