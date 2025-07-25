'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FinancialMetrics as FinancialMetricsType } from '@/types'
import {
	Activity,
	Calendar,
	CalendarDays,
	CreditCard,
	DollarSign,
	TrendingDown,
	TrendingUp,
} from 'lucide-react'

interface FinancialMetricsProps {
	financialMetrics: FinancialMetricsType | null
	loading: boolean
	formatKRW: (amount: number) => string
}

const FinancialMetrics: React.FC<FinancialMetricsProps> = ({
	financialMetrics,
	loading,
	formatKRW,
}) => {
	const getTrendIcon = (change: number) => {
		if (change > 0) {
			return <TrendingUp className='h-3 w-3 sm:h-4 sm:w-4 text-green-500' />
		} else if (change < 0) {
			return <TrendingDown className='h-3 w-3 sm:h-4 sm:w-4 text-red-500' />
		}
		return <Activity className='h-3 w-3 sm:h-4 sm:w-4 text-gray-500' />
	}

	const getTrendColor = (change: number) => {
		if (change > 0) return 'text-green-600'
		if (change < 0) return 'text-red-600'
		return 'text-gray-600'
	}

	if (loading) {
		return (
			<Card className='h-fit'>
				<CardHeader className='pb-4'>
					<div className='h-6 bg-gray-200 rounded w-1/3 animate-pulse'></div>
				</CardHeader>
				<CardContent className='pt-0'>
					<div className='grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6'>
						{[...Array(4)].map((_, i) => (
							<div
								key={i}
								className='p-3 sm:p-4 lg:p-6 bg-gray-50 rounded-lg border animate-pulse'
							>
								<div className='h-4 bg-gray-200 rounded w-3/4 mb-2'></div>
								<div className='h-5 sm:h-6 bg-gray-200 rounded w-1/2 mb-2'></div>
								<div className='h-3 bg-gray-200 rounded w-1/3'></div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		)
	}

	if (!financialMetrics) {
		return (
			<Card className='h-fit'>
				<CardHeader className='pb-4'>
					<CardTitle className='flex items-center gap-2 text-lg sm:text-xl'>
						<DollarSign className='h-5 w-5 flex-shrink-0' />
						<span className='truncate'>Financial Overview</span>
					</CardTitle>
				</CardHeader>
				<CardContent className='pt-0'>
					<div className='text-center text-gray-500 py-6 sm:py-8 text-sm'>
						No financial data available for the selected timeframe
					</div>
				</CardContent>
			</Card>
		)
	}

	// Calculate mock trend data since the API doesn't provide growth percentages
	const calculateTrend = (current: number, previous: number) => {
		if (previous === 0) return 0
		return ((current - previous) / previous) * 100
	}

	// Mock previous values for trend calculation (in a real app, these would come from the API)
	const mockPreviousDaily = financialMetrics.dailySpending * 0.9
	const mockPreviousWeekly = financialMetrics.weeklySpending * 0.85
	const mockPreviousMonthly = financialMetrics.monthlySpending * 0.92
	const mockPreviousAvgOrder = financialMetrics.avgOrderValue * 0.95

	const metrics = [
		{
			title: 'Daily Spending',
			value: formatKRW(financialMetrics.dailySpending),
			change: calculateTrend(financialMetrics.dailySpending, mockPreviousDaily),
			icon: Calendar,
			color: 'text-green-600',
			bgColor: 'bg-green-50',
		},
		{
			title: 'Weekly Spending',
			value: formatKRW(financialMetrics.weeklySpending),
			change: calculateTrend(
				financialMetrics.weeklySpending,
				mockPreviousWeekly
			),
			icon: CalendarDays,
			color: 'text-blue-600',
			bgColor: 'bg-blue-50',
		},
		{
			title: 'Monthly Spending',
			value: formatKRW(financialMetrics.monthlySpending),
			change: calculateTrend(
				financialMetrics.monthlySpending,
				mockPreviousMonthly
			),
			icon: DollarSign,
			color: 'text-purple-600',
			bgColor: 'bg-purple-50',
		},
		{
			title: 'Avg Order Value',
			value: formatKRW(financialMetrics.avgOrderValue),
			change: calculateTrend(
				financialMetrics.avgOrderValue,
				mockPreviousAvgOrder
			),
			icon: CreditCard,
			color: 'text-orange-600',
			bgColor: 'bg-orange-50',
		},
	]

	return (
		<Card className='h-fit'>
			<CardHeader className='pb-4'>
				<CardTitle className='flex items-center gap-2 text-lg sm:text-xl'>
					<DollarSign className='h-5 w-5 flex-shrink-0' />
					<span className='truncate'>Financial Overview</span>
				</CardTitle>
			</CardHeader>
			<CardContent className='pt-0'>
				<div className='grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6'>
					{metrics.map((metric, index) => (
						<div
							key={index}
							className={`p-3 sm:p-4 lg:p-6 ${metric.bgColor} rounded-lg border hover:shadow-md transition-shadow`}
						>
							<div className='flex items-center justify-between mb-2 sm:mb-3'>
								<metric.icon
									className={`h-4 w-4 sm:h-5 sm:w-5 ${metric.color} flex-shrink-0`}
								/>
								<div className='flex items-center gap-1'>
									{getTrendIcon(metric.change)}
									<span
										className={`text-xs font-medium ${getTrendColor(
											metric.change
										)}`}
									>
										{metric.change > 0 ? '+' : ''}
										{metric.change.toFixed(1)}%
									</span>
								</div>
							</div>
							<div className='mb-1 sm:mb-2'>
								<p className='text-xs font-medium text-gray-600 mb-1 truncate'>
									{metric.title}
								</p>
								<p
									className='text-sm sm:text-lg lg:text-xl font-bold text-gray-900 truncate'
									title={metric.value}
								>
									{metric.value}
								</p>
							</div>
							<p className='text-xs text-gray-500 truncate'>
								{metric.change > 0
									? 'Increased'
									: metric.change < 0
									? 'Decreased'
									: 'No change'}{' '}
								from last period
							</p>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	)
}

export default FinancialMetrics
