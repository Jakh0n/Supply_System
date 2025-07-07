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
			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6'>
				{[...Array(4)].map((_, i) => (
					<Card key={i} className='animate-pulse'>
						<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
							<div className='h-4 bg-gray-200 rounded w-1/2'></div>
							<div className='h-4 w-4 bg-gray-200 rounded'></div>
						</CardHeader>
						<CardContent>
							<div className='h-8 bg-gray-200 rounded w-3/4 mb-2'></div>
							<div className='h-3 bg-gray-200 rounded w-1/2'></div>
						</CardContent>
					</Card>
				))}
			</div>
		)
	}

	if (!stats) {
		return (
			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6'>
				{[...Array(4)].map((_, i) => (
					<Card key={i}>
						<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
							<CardTitle className='text-sm font-medium text-gray-500'>
								No Data
							</CardTitle>
							<Activity className='h-4 w-4 text-gray-400' />
						</CardHeader>
						<CardContent>
							<div className='text-2xl font-bold text-gray-400'>--</div>
							<p className='text-xs text-gray-500'>Data unavailable</p>
						</CardContent>
					</Card>
				))}
			</div>
		)
	}

	const statsData = [
		{
			title: 'Today Orders',
			value: stats.todayOrders,
			icon: ShoppingCart,
			color: 'text-blue-600',
			bgColor: 'bg-blue-50',
		},
		{
			title: 'Total Orders',
			value: stats.totalOrders,
			icon: ShoppingCart,
			color: 'text-green-600',
			bgColor: 'bg-green-50',
		},
		{
			title: 'Pending Orders',
			value: stats.pendingOrders,
			icon: Clock,
			color: 'text-orange-600',
			bgColor: 'bg-orange-50',
		},
		{
			title: 'Total Revenue',
			value: stats.totalRevenue ? formatKRW(stats.totalRevenue) : '--',
			icon: DollarSign,
			color: 'text-purple-600',
			bgColor: 'bg-purple-50',
		},
	]

	return (
		<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6'>
			{statsData.map((stat, index) => (
				<Card key={index} className='hover:shadow-md transition-shadow'>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-sm font-medium text-gray-700'>
							{stat.title}
						</CardTitle>
						<div className={`p-2 rounded-lg ${stat.bgColor}`}>
							<stat.icon className={`h-4 w-4 ${stat.color}`} />
						</div>
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold text-gray-900 mb-1'>
							{typeof stat.value === 'number'
								? stat.value.toLocaleString()
								: stat.value}
						</div>
						<p className='text-xs text-gray-500'>
							{stat.title === 'Today Orders' && 'Orders placed today'}
							{stat.title === 'Total Orders' && 'All time orders'}
							{stat.title === 'Pending Orders' && 'Awaiting approval'}
							{stat.title === 'Total Revenue' && 'All time revenue'}
						</p>
					</CardContent>
				</Card>
			))}
		</div>
	)
}

export default DashboardStats
