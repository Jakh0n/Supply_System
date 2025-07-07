'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FinancialMetrics as FinancialMetricsType } from '@/types'
import { Activity, DollarSign, TrendingDown, TrendingUp } from 'lucide-react'

interface FinancialMetricsProps {
	financialMetrics: FinancialMetricsType | null
	loading: boolean
	formatKRW: (amount: number) => string
}

const FinancialMetrics: React.FC<FinancialMetricsProps> = ({
	financialMetrics,
	formatKRW,
	loading,
}) => {
	const getTrendIcon = (trend: string | number) => {
		if (typeof trend === 'number') {
			return trend > 0 ? (
				<TrendingUp className='h-4 w-4 text-green-500' />
			) : (
				<TrendingDown className='h-4 w-4 text-red-500' />
			)
		}
		return trend === 'up' ? (
			<TrendingUp className='h-4 w-4 text-green-500' />
		) : trend === 'down' ? (
			<TrendingDown className='h-4 w-4 text-red-500' />
		) : (
			<Activity className='h-4 w-4 text-gray-500' />
		)
	}

	if (loading) {
		return (
			<Card>
				<CardHeader>
					<div className='h-6 bg-gray-200 rounded w-1/3 animate-pulse'></div>
				</CardHeader>
				<CardContent>
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
						{[...Array(4)].map((_, i) => (
							<div key={i} className='p-4 bg-gray-50 rounded-lg animate-pulse'>
								<div className='h-4 bg-gray-200 rounded w-3/4 mb-2'></div>
								<div className='h-6 bg-gray-200 rounded w-1/2 mb-2'></div>
								<div className='h-3 bg-gray-200 rounded w-full'></div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		)
	}

	if (!financialMetrics) return null

	const metrics = [
		{
			title: 'Daily Spending',
			value: formatKRW(financialMetrics.dailySpending),
			change: 5, // Mock trend data since it's not in the interface
			icon: DollarSign,
			color: 'text-green-600',
			bgColor: 'bg-green-50',
		},
		{
			title: 'Weekly Spending',
			value: formatKRW(financialMetrics.weeklySpending),
			change: 3, // Mock trend data since it's not in the interface
			icon: DollarSign,
			color: 'text-blue-600',
			bgColor: 'bg-blue-50',
		},
		{
			title: 'Monthly Spending',
			value: formatKRW(financialMetrics.monthlySpending),
			change: 8, // Mock trend data since it's not in the interface
			icon: TrendingUp,
			color: 'text-purple-600',
			bgColor: 'bg-purple-50',
		},
		{
			title: 'Average Order Value',
			value: formatKRW(financialMetrics.avgOrderValue),
			change: -2, // Mock trend data since it's not in the interface
			icon: Activity,
			color: 'text-orange-600',
			bgColor: 'bg-orange-50',
		},
	]

	return (
		<Card>
			<CardHeader className='pb-4'>
				<CardTitle className='flex items-center gap-2 text-lg sm:text-xl'>
					<DollarSign className='h-5 w-5' />
					Financial Overview
				</CardTitle>
			</CardHeader>
			<CardContent className='pt-0'>
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6'>
					{metrics.map((metric, index) => (
						<div
							key={index}
							className={`p-4 sm:p-6 ${metric.bgColor} rounded-lg border hover:shadow-md transition-shadow`}
						>
							<div className='flex items-center justify-between mb-3'>
								<metric.icon className={`h-5 w-5 ${metric.color}`} />
								<div className='flex items-center gap-1'>
									{getTrendIcon(metric.change)}
									<span
										className={`text-sm font-medium ${
											metric.change > 0 ? 'text-green-600' : 'text-red-600'
										}`}
									>
										{metric.change > 0 ? '+' : ''}
										{metric.change}%
									</span>
								</div>
							</div>
							<div>
								<p className='text-sm text-gray-600 mb-1'>{metric.title}</p>
								<p className='text-xl sm:text-2xl font-bold text-gray-900'>
									{metric.value}
								</p>
							</div>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	)
}

export default FinancialMetrics
