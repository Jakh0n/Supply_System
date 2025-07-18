'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BranchAnalytics as BranchAnalyticsType } from '@/types'
import {
	Activity,
	ChevronDown,
	ChevronUp,
	MapPin,
	TrendingDown,
	TrendingUp,
} from 'lucide-react'

interface BranchAnalyticsProps {
	branchAnalytics: BranchAnalyticsType[]
	loading: boolean
	showAllBranches: boolean
	onToggleShowAll: () => void
	formatKRW: (amount: number) => string
}

const BranchAnalytics: React.FC<BranchAnalyticsProps> = ({
	branchAnalytics,
	showAllBranches,
	onToggleShowAll,
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

	const branchesToDisplay = showAllBranches
		? branchAnalytics
		: branchAnalytics.slice(0, 2)

	if (loading) {
		return (
			<Card>
				<CardHeader>
					<div className='h-6 bg-gray-200 rounded w-1/3 animate-pulse'></div>
				</CardHeader>
				<CardContent>
					<div className='grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6'>
						{[...Array(2)].map((_, i) => (
							<div
								key={i}
								className='border rounded-lg p-4 sm:p-6 animate-pulse'
							>
								<div className='h-5 bg-gray-200 rounded w-1/2 mb-4'></div>
								<div className='grid grid-cols-2 gap-3 sm:gap-4 mb-4'>
									{[...Array(4)].map((_, j) => (
										<div key={j}>
											<div className='h-3 bg-gray-200 rounded w-3/4 mb-1'></div>
											<div className='h-5 bg-gray-200 rounded w-1/2'></div>
										</div>
									))}
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		)
	}

	return (
		<Card>
			<CardHeader className='pb-4'>
				<div className='flex items-center justify-between'>
					<CardTitle className='flex items-center gap-2 text-lg sm:text-xl'>
						<MapPin className='h-5 w-5' />
						Branch Performance Analytics
					</CardTitle>
					{branchAnalytics.length > 2 && (
						<Button
							variant='ghost'
							size='sm'
							onClick={onToggleShowAll}
							className='flex items-center gap-1'
						>
							{showAllBranches ? (
								<>
									Show Less <ChevronUp className='h-4 w-4' />
								</>
							) : (
								<>
									Show All ({branchAnalytics.length}){' '}
									<ChevronDown className='h-4 w-4' />
								</>
							)}
						</Button>
					)}
				</div>
			</CardHeader>
			<CardContent className='pt-0'>
				{branchAnalytics.length === 0 ? (
					<div className='text-center text-gray-500 py-6 sm:py-8'>
						No branch data available for the selected timeframe
					</div>
				) : (
					<div className='grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6'>
						{branchesToDisplay.map(branch => (
							<div
								key={branch.branch}
								className='border rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow'
							>
								<div className='flex items-center justify-between mb-4'>
									<h3 className='font-semibold text-base sm:text-lg'>
										{branch.branch}
									</h3>
									<div className='flex items-center gap-1'>
										{getTrendIcon(branch.weeklyTrend)}
										<span
											className={`text-sm font-medium ${
												branch.weeklyTrend > 0
													? 'text-green-600'
													: 'text-red-600'
											}`}
										>
											{branch.weeklyTrend > 0 ? '+' : ''}
											{branch.weeklyTrend}%
										</span>
									</div>
								</div>

								<div className='grid grid-cols-2 gap-3 sm:gap-4 mb-4'>
									<div className='p-3 bg-blue-50 rounded-lg'>
										<p className='text-xs sm:text-sm text-blue-600 font-medium'>
											Total Orders
										</p>
										<p className='text-lg sm:text-xl font-bold text-blue-900'>
											{branch.totalOrders}
										</p>
									</div>
									<div className='p-3 bg-green-50 rounded-lg'>
										<p className='text-xs sm:text-sm text-green-600 font-medium'>
											Total Value
										</p>
										<p className='text-lg sm:text-xl font-bold text-green-900'>
											{formatKRW(branch.totalValue)}
										</p>
									</div>
									<div className='p-3 bg-purple-50 rounded-lg'>
										<p className='text-xs sm:text-sm text-purple-600 font-medium'>
											Avg Order Value
										</p>
										<p className='text-base sm:text-lg font-semibold text-purple-900'>
											{formatKRW(branch.avgOrderValue)}
										</p>
									</div>
									<div className='p-3 bg-orange-50 rounded-lg'>
										<p className='text-xs sm:text-sm text-orange-600 font-medium'>
											Pending
										</p>
										<p className='text-base sm:text-lg font-semibold text-orange-900'>
											{branch.pendingOrders}
										</p>
									</div>
								</div>

								<div className='bg-gray-50 rounded-lg p-3'>
									<p className='text-sm font-medium text-gray-700 mb-2'>
										Top Products
									</p>
									<div className='space-y-2'>
										{branch.mostOrderedProducts.map((product, idx) => (
											<div
												key={idx}
												className='flex justify-between items-center text-xs sm:text-sm bg-white p-2 rounded'
											>
												<span className='truncate mr-2 font-medium'>
													{product.name}
												</span>
												<span className='text-gray-600 flex-shrink-0 bg-gray-100 px-2 py-1 rounded'>
													{product.quantity} units
												</span>
											</div>
										))}
									</div>
								</div>
							</div>
						))}
					</div>
				)}
			</CardContent>
		</Card>
	)
}

export default BranchAnalytics
