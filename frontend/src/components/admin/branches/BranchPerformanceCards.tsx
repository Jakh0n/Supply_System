import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BranchAnalytics } from '@/types'
import { ChevronDown, ChevronUp, MapPin, Package } from 'lucide-react'
import React from 'react'

interface BranchPerformanceCardsProps {
	filteredBranches: BranchAnalytics[]
	branchesToDisplay: BranchAnalytics[]
	showAllBranches: boolean
	selectedMonth: number
	selectedYear: number
	formatKRW: (amount: number) => string
	getEfficiencyScore: (branch: BranchAnalytics) => number
	getPerformanceLevel: (score: number) => {
		level: string
		color: string
	}
	getTrendIcon: (trend: string | number) => React.JSX.Element
	onToggleShowAll: () => void
}

const BranchPerformanceCards: React.FC<BranchPerformanceCardsProps> = ({
	filteredBranches,
	branchesToDisplay,
	showAllBranches,
	selectedMonth,
	selectedYear,
	formatKRW,
	getEfficiencyScore,
	getPerformanceLevel,
	getTrendIcon,
	onToggleShowAll,
}) => {
	if (filteredBranches.length === 0) {
		return (
			<Card>
				<CardContent className='p-8 sm:p-12 text-center'>
					<MapPin className='h-12 w-12 text-gray-400 mx-auto mb-4' />
					<h3 className='text-lg font-semibold text-gray-900 mb-2'>
						No branches found
					</h3>
					<p className='text-gray-600'>
						Try adjusting your search terms or filters to find branches.
					</p>
				</CardContent>
			</Card>
		)
	}

	return (
		<div className='space-y-4'>
			{/* Toggle Button */}
			{filteredBranches.length > 2 && (
				<div className='flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4'>
					<h2 className='text-lg sm:text-xl font-semibold text-gray-900'>
						Branch Performance Cards
					</h2>
					<Button
						variant='outline'
						size='sm'
						onClick={onToggleShowAll}
						className='flex items-center gap-2 w-full sm:w-auto'
					>
						{showAllBranches ? (
							<>
								<ChevronUp className='h-4 w-4' />
								<span className='hidden sm:inline'>Hide Branches</span>
								<span className='sm:hidden'>Hide</span>
								<span>({filteredBranches.length - 2} hidden)</span>
							</>
						) : (
							<>
								<ChevronDown className='h-4 w-4' />
								<span className='hidden sm:inline'>Show All Branches</span>
								<span className='sm:hidden'>Show All</span>
								<span>({filteredBranches.length} total)</span>
							</>
						)}
					</Button>
				</div>
			)}

			{/* Branch Cards */}
			<div className='grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6'>
				{branchesToDisplay.map(branch => {
					const efficiencyScore = getEfficiencyScore(branch)
					const performance = getPerformanceLevel(efficiencyScore)

					return (
						<Card
							key={branch.branch}
							className='hover:shadow-lg transition-shadow'
						>
							<CardHeader className='pb-3'>
								<div className='flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3'>
									<div className='flex items-center gap-3'>
										<MapPin className='h-5 w-5 text-blue-600 flex-shrink-0' />
										<div>
											<CardTitle className='text-base sm:text-lg'>
												{branch.branch}
											</CardTitle>
											<CardDescription>Performance Analysis</CardDescription>
										</div>
									</div>
									<div className='flex items-center gap-2 self-start'>
										<Badge className={performance.color} variant='secondary'>
											{performance.level}
										</Badge>
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
								</div>
							</CardHeader>
							<CardContent>
								<Tabs defaultValue='overview' className='w-full'>
									<TabsList className='grid w-full grid-cols-3'>
										<TabsTrigger
											value='overview'
											className='text-xs sm:text-sm'
										>
											Overview
										</TabsTrigger>
										<TabsTrigger
											value='products'
											className='text-xs sm:text-sm'
										>
											Products
										</TabsTrigger>
										<TabsTrigger
											value='efficiency'
											className='text-xs sm:text-sm'
										>
											Efficiency
										</TabsTrigger>
									</TabsList>

									<TabsContent value='overview' className='space-y-4 mt-4'>
										<div className='grid grid-cols-2 gap-3 sm:gap-4'>
											<div className='space-y-2'>
												<p className='text-xs sm:text-sm text-gray-600'>
													Total Orders
												</p>
												<p className='text-xl sm:text-2xl font-bold'>
													{branch.totalOrders}
												</p>
											</div>
											<div className='space-y-2'>
												<p className='text-xs sm:text-sm text-gray-600'>
													Total Value
												</p>
												<p className='text-lg sm:text-2xl font-bold text-green-600 break-all'>
													{formatKRW(branch.totalValue)}
												</p>
											</div>
											<div className='space-y-2'>
												<p className='text-xs sm:text-sm text-gray-600'>
													Avg Order Value
												</p>
												<p className='text-base sm:text-xl font-semibold break-all'>
													{formatKRW(branch.avgOrderValue)}
												</p>
											</div>
											<div className='space-y-2'>
												<p className='text-xs sm:text-sm text-gray-600'>
													Pending Orders
												</p>
												<p className='text-base sm:text-xl font-semibold text-orange-600'>
													{branch.pendingOrders}
												</p>
											</div>
										</div>
									</TabsContent>

									<TabsContent value='products' className='space-y-4 mt-4'>
										<div className='space-y-3'>
											<p className='text-xs sm:text-sm font-medium text-gray-700'>
												Top Products ({selectedMonth}/{selectedYear})
											</p>
											{branch.mostOrderedProducts
												.slice(0, 3)
												.map((product, idx) => (
													<div
														key={idx}
														className='flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg'
													>
														<div className='flex items-center gap-2 sm:gap-3 flex-1 min-w-0'>
															<div className='w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0'>
																<Package className='h-3 w-3 sm:h-4 sm:w-4 text-blue-600' />
															</div>
															<div className='min-w-0 flex-1'>
																<p className='font-medium text-sm truncate'>
																	{product.name}
																</p>
																<p className='text-xs text-gray-600'>
																	{product.quantity} units
																</p>
															</div>
														</div>
														<Badge variant='secondary' className='text-xs'>
															#{idx + 1}
														</Badge>
													</div>
												))}
											{branch.mostOrderedProducts.length === 0 && (
												<p className='text-center text-gray-500 py-4 text-sm'>
													No products data available
												</p>
											)}
										</div>
									</TabsContent>

									<TabsContent value='efficiency' className='space-y-4 mt-4'>
										<div className='space-y-4'>
											<div className='flex items-center justify-between'>
												<p className='text-xs sm:text-sm font-medium'>
													Efficiency Score
												</p>
												<div className='flex items-center gap-2'>
													<div className='w-12 sm:w-16 h-2 bg-gray-200 rounded-full'>
														<div
															className='h-2 bg-blue-600 rounded-full transition-all'
															style={{ width: `${efficiencyScore}%` }}
														></div>
													</div>
													<span className='text-xs sm:text-sm font-bold'>
														{efficiencyScore}%
													</span>
												</div>
											</div>

											<div className='grid grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm'>
												<div className='space-y-1'>
													<p className='text-gray-600'>Completion Rate</p>
													<p className='font-semibold'>
														{branch.totalOrders > 0
															? Math.round(
																	(branch.completedOrders /
																		branch.totalOrders) *
																		100
															  )
															: 0}
														%
													</p>
												</div>
												<div className='space-y-1'>
													<p className='text-gray-600'>Order Frequency</p>
													<p className='font-semibold'>
														{Math.round(branch.totalOrders / 7)} orders/week
													</p>
												</div>
												<div className='space-y-1'>
													<p className='text-gray-600'>Growth Trend</p>
													<p
														className={`font-semibold ${
															branch.weeklyTrend > 0
																? 'text-green-600'
																: 'text-red-600'
														}`}
													>
														{branch.weeklyTrend > 0 ? '+' : ''}
														{branch.weeklyTrend}%
													</p>
												</div>
												<div className='space-y-1'>
													<p className='text-gray-600'>Avg Response Time</p>
													<p className='font-semibold'>2.3 days</p>
												</div>
											</div>
										</div>
									</TabsContent>
								</Tabs>
							</CardContent>
						</Card>
					)
				})}
			</div>
		</div>
	)
}

export default BranchPerformanceCards
