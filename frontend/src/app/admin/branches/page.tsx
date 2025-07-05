'use client'

import AdminLayout from '@/components/shared/AdminLayout'
import ProtectedRoute from '@/components/shared/ProtectedRoute'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ordersApi } from '@/lib/api'
import { AnalyticsTimeframe, BranchAnalytics, BranchFilter } from '@/types'
import {
	Activity,
	BarChart3,
	ChevronDown,
	ChevronUp,
	DollarSign,
	Download,
	Filter,
	MapPin,
	Package,
	RefreshCw,
	Search,
	ShoppingCart,
	TrendingDown,
	TrendingUp,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

const BranchPerformancePage: React.FC = () => {
	const [branchAnalytics, setBranchAnalytics] = useState<BranchAnalytics[]>([])
	const [loading, setLoading] = useState(true)
	const [searchTerm, setSearchTerm] = useState('')
	const [showAllBranches, setShowAllBranches] = useState(false)
	const [filters, setFilters] = useState<BranchFilter>({
		branch: 'all',
		timeframe: 'month',
		category: 'all',
		dateRange: {
			start: '',
			end: '',
		},
	})

	const fetchBranchData = useCallback(async () => {
		try {
			setLoading(true)

			const analyticsResponse = await ordersApi.getBranchAnalytics(
				filters.timeframe
			)
			setBranchAnalytics(analyticsResponse.branches)
		} catch (error) {
			console.error('Branch data fetch error:', error)
		} finally {
			setLoading(false)
		}
	}, [filters.timeframe])

	useEffect(() => {
		fetchBranchData()
	}, [fetchBranchData])

	const formatKRW = (amount: number) => {
		return new Intl.NumberFormat('ko-KR', {
			style: 'currency',
			currency: 'KRW',
			minimumFractionDigits: 0,
		}).format(amount)
	}

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

	const filteredBranches = branchAnalytics.filter(branch => {
		const matchesSearch = branch.branch
			.toLowerCase()
			.includes(searchTerm.toLowerCase())
		const matchesBranch =
			filters.branch === 'all' || branch.branch === filters.branch
		return matchesSearch && matchesBranch
	})

	// Determine which branches to display based on showAllBranches state
	const branchesToDisplay = showAllBranches
		? filteredBranches
		: filteredBranches.slice(0, 2)

	const getEfficiencyScore = (branch: BranchAnalytics) => {
		const completionRate =
			branch.totalOrders > 0
				? (branch.completedOrders / branch.totalOrders) * 100
				: 0
		const avgOrderValue = branch.avgOrderValue || 0
		const trend = branch.weeklyTrend || 0

		// Calculate efficiency score based on completion rate, order value, and trend
		const score =
			completionRate * 0.4 +
			Math.min(avgOrderValue / 100000, 1) * 0.3 +
			Math.max(trend, 0) * 0.3
		return Math.min(Math.round(score), 100)
	}

	const getPerformanceLevel = (score: number) => {
		if (score >= 80)
			return { level: 'Excellent', color: 'bg-green-100 text-green-800' }
		if (score >= 60)
			return { level: 'Good', color: 'bg-blue-100 text-blue-800' }
		if (score >= 40)
			return { level: 'Average', color: 'bg-yellow-100 text-yellow-800' }
		return { level: 'Needs Improvement', color: 'bg-red-100 text-red-800' }
	}

	if (loading) {
		return (
			<ProtectedRoute requiredRole='admin'>
				<AdminLayout>
					<div className='flex items-center justify-center h-64'>
						<div className='text-center'>
							<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto'></div>
							<p className='mt-4 text-gray-600'>Loading branch analytics...</p>
						</div>
					</div>
				</AdminLayout>
			</ProtectedRoute>
		)
	}

	return (
		<ProtectedRoute requiredRole='admin'>
			<AdminLayout>
				<div className='space-y-6'>
					{/* Header */}
					<div className='flex justify-between items-center'>
						<div>
							<h1 className='text-3xl font-bold text-gray-900'>
								Branch Performance Analysis
							</h1>
							<p className='text-gray-600 mt-1'>
								Detailed consumption tracking and performance metrics for each
								branch
							</p>
						</div>
						<div className='flex gap-3'>
							<Button onClick={fetchBranchData} variant='outline' size='sm'>
								<RefreshCw className='h-4 w-4 mr-2' />
								Refresh
							</Button>
							<Button variant='outline' size='sm'>
								<Download className='h-4 w-4 mr-2' />
								Export Report
							</Button>
						</div>
					</div>

					{/* Filters */}
					<Card>
						<CardHeader>
							<CardTitle className='flex items-center gap-2'>
								<Filter className='h-5 w-5' />
								Filters & Search
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
								<div className='space-y-2'>
									<label className='text-sm font-medium'>Search Branch</label>
									<div className='relative'>
										<Search className='absolute left-3 top-3 h-4 w-4 text-gray-400' />
										<Input
											placeholder='Search branches...'
											value={searchTerm}
											onChange={e => setSearchTerm(e.target.value)}
											className='pl-10'
										/>
									</div>
								</div>

								<div className='space-y-2'>
									<label className='text-sm font-medium'>Branch</label>
									<Select
										value={filters.branch}
										onValueChange={(value: string) =>
											setFilters((prev: BranchFilter) => ({
												...prev,
												branch: value,
											}))
										}
									>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value='all'>All Branches</SelectItem>
											{branchAnalytics.map(branch => (
												<SelectItem key={branch.branch} value={branch.branch}>
													{branch.branch}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>

								<div className='space-y-2'>
									<label className='text-sm font-medium'>Time Period</label>
									<Select
										value={filters.timeframe}
										onValueChange={(value: string) =>
											setFilters((prev: BranchFilter) => ({
												...prev,
												timeframe: value as AnalyticsTimeframe,
											}))
										}
									>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value='day'>Last 24 Hours</SelectItem>
											<SelectItem value='week'>Last Week</SelectItem>
											<SelectItem value='month'>Last Month</SelectItem>
											<SelectItem value='quarter'>Last Quarter</SelectItem>
										</SelectContent>
									</Select>
								</div>

								<div className='space-y-2'>
									<label className='text-sm font-medium'>Category</label>
									<Select
										value={filters.category}
										onValueChange={(value: string) =>
											setFilters((prev: BranchFilter) => ({
												...prev,
												category: value,
											}))
										}
									>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value='all'>All Categories</SelectItem>
											<SelectItem value='food'>Food</SelectItem>
											<SelectItem value='beverages'>Beverages</SelectItem>
											<SelectItem value='cleaning'>Cleaning</SelectItem>
											<SelectItem value='equipment'>Equipment</SelectItem>
											<SelectItem value='packaging'>Packaging</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Overview Stats */}
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
						<Card>
							<CardContent className='p-6'>
								<div className='flex items-center justify-between'>
									<div>
										<p className='text-sm font-medium text-gray-600'>
											Total Branches
										</p>
										<p className='text-2xl font-bold'>
											{filteredBranches.length}
										</p>
									</div>
									<MapPin className='h-8 w-8 text-blue-600' />
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardContent className='p-6'>
								<div className='flex items-center justify-between'>
									<div>
										<p className='text-sm font-medium text-gray-600'>
											Total Orders
										</p>
										<p className='text-2xl font-bold'>
											{filteredBranches.reduce(
												(sum, branch) => sum + branch.totalOrders,
												0
											)}
										</p>
									</div>
									<ShoppingCart className='h-8 w-8 text-green-600' />
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardContent className='p-6'>
								<div className='flex items-center justify-between'>
									<div>
										<p className='text-sm font-medium text-gray-600'>
											Total Spending
										</p>
										<p className='text-2xl font-bold text-purple-600'>
											{formatKRW(
												filteredBranches.reduce(
													(sum, branch) => sum + branch.totalValue,
													0
												)
											)}
										</p>
									</div>
									<DollarSign className='h-8 w-8 text-purple-600' />
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardContent className='p-6'>
								<div className='flex items-center justify-between'>
									<div>
										<p className='text-sm font-medium text-gray-600'>
											Avg Efficiency
										</p>
										<p className='text-2xl font-bold text-orange-600'>
											{filteredBranches.length > 0
												? Math.round(
														filteredBranches.reduce(
															(sum, branch) => sum + getEfficiencyScore(branch),
															0
														) / filteredBranches.length
												  )
												: 0}
											%
										</p>
									</div>
									<BarChart3 className='h-8 w-8 text-orange-600' />
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Branch Performance Cards */}
					<div className='space-y-4'>
						{/* Toggle Button */}
						{filteredBranches.length > 2 && (
							<div className='flex justify-between items-center'>
								<h2 className='text-xl font-semibold text-gray-900'>
									Branch Performance Cards
								</h2>
								<Button
									variant='outline'
									size='sm'
									onClick={() => setShowAllBranches(!showAllBranches)}
									className='flex items-center gap-2'
								>
									{showAllBranches ? (
										<>
											<ChevronUp className='h-4 w-4' />
											Hide Branches ({filteredBranches.length - 2} hidden)
										</>
									) : (
										<>
											<ChevronDown className='h-4 w-4' />
											Show All Branches ({filteredBranches.length} total)
										</>
									)}
								</Button>
							</div>
						)}

						{filteredBranches.length === 0 ? (
							<Card>
								<CardContent className='p-12 text-center'>
									<MapPin className='h-12 w-12 text-gray-400 mx-auto mb-4' />
									<h3 className='text-lg font-semibold text-gray-900 mb-2'>
										No branches found
									</h3>
									<p className='text-gray-600'>
										Try adjusting your search terms or filters to find branches.
									</p>
								</CardContent>
							</Card>
						) : (
							<div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
								{branchesToDisplay.map(branch => {
									const efficiencyScore = getEfficiencyScore(branch)
									const performance = getPerformanceLevel(efficiencyScore)

									return (
										<Card
											key={branch.branch}
											className='hover:shadow-lg transition-shadow'
										>
											<CardHeader>
												<div className='flex items-center justify-between'>
													<div className='flex items-center gap-3'>
														<MapPin className='h-5 w-5 text-blue-600' />
														<div>
															<CardTitle className='text-lg'>
																{branch.branch}
															</CardTitle>
															<CardDescription>
																Performance Analysis
															</CardDescription>
														</div>
													</div>
													<div className='flex items-center gap-2'>
														<Badge className={performance.color}>
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
														<TabsTrigger value='overview'>Overview</TabsTrigger>
														<TabsTrigger value='products'>Products</TabsTrigger>
														<TabsTrigger value='efficiency'>
															Efficiency
														</TabsTrigger>
													</TabsList>

													<TabsContent value='overview' className='space-y-4'>
														<div className='grid grid-cols-2 gap-4'>
															<div className='space-y-2'>
																<p className='text-sm text-gray-600'>
																	Total Orders
																</p>
																<p className='text-2xl font-bold'>
																	{branch.totalOrders}
																</p>
															</div>
															<div className='space-y-2'>
																<p className='text-sm text-gray-600'>
																	Total Value
																</p>
																<p className='text-2xl font-bold text-green-600'>
																	{formatKRW(branch.totalValue)}
																</p>
															</div>
															<div className='space-y-2'>
																<p className='text-sm text-gray-600'>
																	Avg Order Value
																</p>
																<p className='text-xl font-semibold'>
																	{formatKRW(branch.avgOrderValue)}
																</p>
															</div>
															<div className='space-y-2'>
																<p className='text-sm text-gray-600'>
																	Pending Orders
																</p>
																<p className='text-xl font-semibold text-orange-600'>
																	{branch.pendingOrders}
																</p>
															</div>
														</div>
													</TabsContent>

													<TabsContent value='products' className='space-y-4'>
														<div className='space-y-3'>
															<p className='text-sm font-medium text-gray-700'>
																Top Products ({filters.timeframe})
															</p>
															{branch.mostOrderedProducts
																.slice(0, 3)
																.map((product, idx) => (
																	<div
																		key={idx}
																		className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'
																	>
																		<div className='flex items-center gap-3'>
																			<div className='w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center'>
																				<Package className='h-4 w-4 text-blue-600' />
																			</div>
																			<div>
																				<p className='font-medium'>
																					{product.name}
																				</p>
																				<p className='text-sm text-gray-600'>
																					{product.quantity} units
																				</p>
																			</div>
																		</div>
																		<Badge variant='secondary'>
																			#{idx + 1}
																		</Badge>
																	</div>
																))}
															{branch.mostOrderedProducts.length === 0 && (
																<p className='text-center text-gray-500 py-4'>
																	No products data available
																</p>
															)}
														</div>
													</TabsContent>

													<TabsContent value='efficiency' className='space-y-4'>
														<div className='space-y-4'>
															<div className='flex items-center justify-between'>
																<p className='text-sm font-medium'>
																	Efficiency Score
																</p>
																<div className='flex items-center gap-2'>
																	<div className='w-16 h-2 bg-gray-200 rounded-full'>
																		<div
																			className='h-2 bg-blue-600 rounded-full'
																			style={{ width: `${efficiencyScore}%` }}
																		></div>
																	</div>
																	<span className='text-sm font-bold'>
																		{efficiencyScore}%
																	</span>
																</div>
															</div>

															<div className='grid grid-cols-2 gap-4 text-sm'>
																<div className='space-y-1'>
																	<p className='text-gray-600'>
																		Completion Rate
																	</p>
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
																	<p className='text-gray-600'>
																		Order Frequency
																	</p>
																	<p className='font-semibold'>
																		{Math.round(branch.totalOrders / 7)}{' '}
																		orders/week
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
																	<p className='text-gray-600'>
																		Avg Response Time
																	</p>
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
						)}
					</div>
				</div>
			</AdminLayout>
		</ProtectedRoute>
	)
}

export default BranchPerformancePage
