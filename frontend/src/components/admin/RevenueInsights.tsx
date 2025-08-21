'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FinancialMetrics } from '@/types'
import {
	ArrowDownIcon,
	ArrowUpIcon,
	Calendar,
	DollarSign,
	Minus,
	Package,
	ShoppingCart,
	Target,
	TrendingUp,
} from 'lucide-react'

interface RevenueInsightsProps {
	financialMetrics: FinancialMetrics | null
	loading: boolean
	formatKRW: (amount: number) => string
}

const RevenueInsights: React.FC<RevenueInsightsProps> = ({
	financialMetrics,
	loading,
	formatKRW,
}) => {
	if (loading || !financialMetrics) {
		return (
			<Card className='h-fit'>
				<CardHeader className='pb-4'>
					<CardTitle className='flex items-center gap-2 text-lg sm:text-xl'>
						<TrendingUp className='h-5 w-5' />
						Revenue Insights
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className='animate-pulse'>
						<div className='space-y-4'>
							{[1, 2, 3].map(i => (
								<div key={i} className='bg-gray-200 h-16 rounded-lg'></div>
							))}
						</div>
					</div>
				</CardContent>
			</Card>
		)
	}

	// Growth analysis
	const getGrowthIcon = (growth: number) => {
		if (growth > 5) return <ArrowUpIcon className='h-4 w-4 text-green-500' />
		if (growth < -5) return <ArrowDownIcon className='h-4 w-4 text-red-500' />
		return <Minus className='h-4 w-4 text-gray-500' />
	}

	const getGrowthColor = (growth: number) => {
		if (growth > 0) return 'text-green-600'
		if (growth < 0) return 'text-red-600'
		return 'text-gray-600'
	}

	const getBadgeVariant = (growth: number) => {
		if (growth > 5) return 'default' // Green
		if (growth > 0) return 'secondary' // Light green
		if (growth < -5) return 'destructive' // Red
		return 'outline' // Gray
	}

	// Key insights
	const insights = [
		{
			title: 'Monthly Performance',
			value: formatKRW(financialMetrics.monthlySpending),
			growth: financialMetrics.monthlyGrowth || 0,
			comparison: financialMetrics.previousPeriod?.monthlySpending || 0,
			description: 'vs last month',
			icon: Calendar,
		},
		{
			title: 'Average Order Value',
			value: formatKRW(financialMetrics.avgOrderValue),
			growth: financialMetrics.avgOrderGrowth || 0,
			comparison: financialMetrics.previousPeriod?.avgOrderValue || 0,
			description: 'per order',
			icon: Target,
		},
		{
			title: 'Total Orders',
			value: (financialMetrics.totalOrders || 0).toLocaleString(),
			growth: 0, // We don't have order growth yet
			comparison: 0,
			description: 'this month',
			icon: ShoppingCart,
		},
	]

	// Revenue breakdown
	const revenueBreakdown = [
		{
			period: 'Today',
			amount: financialMetrics.dailySpending,
			growth: financialMetrics.dailyGrowth || 0,
			previous: financialMetrics.previousPeriod?.dailySpending || 0,
		},
		{
			period: 'This Week',
			amount: financialMetrics.weeklySpending,
			growth: financialMetrics.weeklyGrowth || 0,
			previous: financialMetrics.previousPeriod?.weeklySpending || 0,
		},
		{
			period: 'This Month',
			amount: financialMetrics.monthlySpending,
			growth: financialMetrics.monthlyGrowth || 0,
			previous: financialMetrics.previousPeriod?.monthlySpending || 0,
		},
	]

	return (
		<div className='space-y-6'>
			{/* Key Performance Indicators */}
			<Card>
				<CardHeader className='pb-4'>
					<CardTitle className='flex items-center gap-2 text-lg'>
						<DollarSign className='h-5 w-5 text-green-600' />
						Key Performance Indicators
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
						{insights.map((insight, index) => (
							<div
								key={index}
								className='p-4 border rounded-lg hover:shadow-sm transition-shadow'
							>
								<div className='flex items-start justify-between mb-2'>
									<div className='flex items-center gap-2'>
										<insight.icon className='h-4 w-4 text-gray-600' />
										<span className='text-sm font-medium text-gray-700'>
											{insight.title}
										</span>
									</div>
									{insight.growth !== 0 && (
										<Badge
											variant={getBadgeVariant(insight.growth)}
											className='text-xs'
										>
											{getGrowthIcon(insight.growth)}
											{Math.abs(insight.growth).toFixed(1)}%
										</Badge>
									)}
								</div>
								<div className='text-xl font-bold text-gray-900 mb-1'>
									{insight.value}
								</div>
								<div className='text-xs text-gray-500'>
									{insight.description}
								</div>
								{insight.comparison > 0 && (
									<div className='text-xs text-gray-400 mt-1'>
										Previous:{' '}
										{typeof insight.comparison === 'number' &&
										insight.title !== 'Total Orders'
											? formatKRW(insight.comparison)
											: insight.comparison.toLocaleString()}
									</div>
								)}
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Revenue Breakdown */}
			<Card>
				<CardHeader className='pb-4'>
					<CardTitle className='flex items-center gap-2 text-lg'>
						<TrendingUp className='h-5 w-5 text-blue-600' />
						Revenue Breakdown
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className='space-y-4'>
						{revenueBreakdown.map((item, index) => (
							<div
								key={index}
								className='flex items-center justify-between p-3 border rounded-lg'
							>
								<div className='flex-1'>
									<div className='flex items-center gap-3'>
										<span className='font-medium text-gray-900'>
											{item.period}
										</span>
										<Badge
											variant={getBadgeVariant(item.growth)}
											className='text-xs'
										>
											{getGrowthIcon(item.growth)}
											{item.growth === 0
												? 'N/A'
												: `${item.growth > 0 ? '+' : ''}${item.growth.toFixed(
														1
												  )}%`}
										</Badge>
									</div>
									<div className='text-sm text-gray-500 mt-1'>
										Previous: {formatKRW(item.previous)}
									</div>
								</div>
								<div className='text-right'>
									<div className='text-lg font-bold text-gray-900'>
										{formatKRW(item.amount)}
									</div>
									<div
										className={`text-sm font-medium ${getGrowthColor(
											item.growth
										)}`}
									>
										{item.growth !== 0 && (
											<span>
												{item.growth > 0 ? '+' : ''}
												{formatKRW(item.amount - item.previous)}
											</span>
										)}
									</div>
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Top Spending Branches */}
			{financialMetrics.topSpendingBranches &&
				financialMetrics.topSpendingBranches.length > 0 && (
					<Card>
						<CardHeader className='pb-4'>
							<CardTitle className='flex items-center gap-2 text-lg'>
								<Package className='h-5 w-5 text-purple-600' />
								Top Spending Branches
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className='space-y-3'>
								{financialMetrics.topSpendingBranches
									.slice(0, 5)
									.map((branch, index) => (
										<div
											key={index}
											className='flex items-center justify-between p-3 border rounded-lg'
										>
											<div className='flex items-center gap-3'>
												<div
													className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
														index === 0
															? 'bg-yellow-500'
															: index === 1
															? 'bg-gray-400'
															: index === 2
															? 'bg-orange-500'
															: 'bg-blue-500'
													}`}
												>
													{index + 1}
												</div>
												<div>
													<div className='font-medium text-gray-900'>
														{branch.branch}
													</div>
													{branch.orderCount && (
														<div className='text-xs text-gray-500'>
															{branch.orderCount} orders • Avg:{' '}
															{formatKRW(branch.avgOrderValue || 0)}
														</div>
													)}
												</div>
											</div>
											<div className='text-right'>
												<div className='font-bold text-gray-900'>
													{formatKRW(branch.spending)}
												</div>
												{branch.itemCount && (
													<div className='text-xs text-gray-500'>
														{branch.itemCount} items
													</div>
												)}
											</div>
										</div>
									))}
							</div>
						</CardContent>
					</Card>
				)}
		</div>
	)
}

export default RevenueInsights
