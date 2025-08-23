'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DashboardStats as DashboardStatsType } from '@/types'
import { Activity, Clock, DollarSign, ShoppingCart } from 'lucide-react'

interface DashboardStatsProps {
	stats: DashboardStatsType | null
	loading: boolean
	formatKRW: (amount: number) => string
}

const DashboardStats: React.FC<DashboardStatsProps> = ({
	stats,
	loading,
	formatKRW,
}) => {
	if (loading) {
		return (
			<div className='grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6'>
				{[...Array(4)].map((_, i) => (
					<Card key={i} className='animate-pulse'>
						<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
							<div className='h-4 bg-gray-200 rounded w-1/2'></div>
							<div className='h-4 w-4 bg-gray-200 rounded'></div>
						</CardHeader>
						<CardContent>
							<div className='h-6 sm:h-8 bg-gray-200 rounded w-3/4 mb-2'></div>
							<div className='h-3 bg-gray-200 rounded w-1/2'></div>
						</CardContent>
					</Card>
				))}
			</div>
		)
	}

	if (!stats) {
		return (
			<div className='grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6'>
				{[...Array(4)].map((_, i) => (
					<Card key={i}>
						<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
							<CardTitle className='text-xs sm:text-sm font-medium text-gray-500'>
								No Data
							</CardTitle>
							<Activity className='h-3 w-3 sm:h-4 sm:w-4 text-gray-400' />
						</CardHeader>
						<CardContent>
							<div className='text-xl sm:text-2xl font-bold text-gray-400'>
								--
							</div>
							<p className='text-xs text-gray-500'>Data unavailable</p>
						</CardContent>
					</Card>
				))}
			</div>
		)
	}

	const statsData = [
		{
			title: "Today's Orders",
			value: stats.todayOrders || 0,
			icon: ShoppingCart,
			color: 'text-blue-600',
			bgColor: 'bg-blue-50',
			description: 'Orders placed today',
		},
		{
			title: 'Completed Today',
			value: stats.todayCompletedOrders || 0,
			icon: ShoppingCart,
			color: 'text-green-600',
			bgColor: 'bg-green-50',
			description: 'Orders completed today',
		},
		{
			title: 'Pending Orders',
			value: stats.pendingOrders || 0,
			icon: Clock,
			color: 'text-orange-600',
			bgColor: 'bg-orange-50',
			description: 'Awaiting approval',
		},
		{
			title: "Today's Revenue",
			value: stats.todayRevenue ? formatKRW(stats.todayRevenue) : '₩0',
			icon: DollarSign,
			color: 'text-purple-600',
			bgColor: 'bg-purple-50',
			description: 'Revenue earned today',
		},
	]

	return (
		<div className='grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6'>
			{statsData.map((stat, index) => (
				<Card key={index} className='hover:shadow-md transition-shadow'>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-xs sm:text-sm font-medium text-gray-700 truncate mr-2'>
							{stat.title}
						</CardTitle>
						<div
							className={`p-1.5 sm:p-2 rounded-lg ${stat.bgColor} flex-shrink-0`}
						>
							<stat.icon className={`h-3 w-3 sm:h-4 sm:w-4 ${stat.color}`} />
						</div>
					</CardHeader>
					<CardContent className='pt-0'>
						<div
							className='text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-1 truncate'
							title={
								typeof stat.value === 'number'
									? stat.value.toLocaleString()
									: stat.value
							}
						>
							{typeof stat.value === 'number'
								? stat.value.toLocaleString()
								: stat.value}
						</div>
						<p className='text-xs text-gray-500 truncate'>{stat.description}</p>
						{stat.subValue && (
							<p className='text-xs text-green-600 font-medium mt-1 truncate'>
								{stat.subValue}
							</p>
						)}
					</CardContent>
				</Card>
			))}
		</div>
	)
}

export default DashboardStats
