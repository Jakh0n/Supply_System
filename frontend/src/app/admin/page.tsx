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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { ordersApi } from '@/lib/api'
import {
	AnalyticsTimeframe,
	BranchAnalytics,
	DashboardStats,
	FinancialMetrics,
	ProductInsights,
} from '@/types'
import {
	Activity,
	AlertTriangle,
	BarChart3,
	Calendar,
	Clock,
	DollarSign,
	Download,
	FileText,
	MapPin,
	Package,
	RefreshCw,
	ShoppingCart,
	TrendingDown,
	TrendingUp,
	Users,
} from 'lucide-react'
import React, { useCallback, useEffect, useState } from 'react'

const AdminDashboard: React.FC = () => {
	const [stats, setStats] = useState<DashboardStats | null>(null)
	const [branchAnalytics, setBranchAnalytics] = useState<BranchAnalytics[]>([])
	const [productInsights, setProductInsights] = useState<ProductInsights[]>([])
	const [financialMetrics, setFinancialMetrics] =
		useState<FinancialMetrics | null>(null)
	const [loading, setLoading] = useState(true)
	const [selectedTimeframe, setSelectedTimeframe] =
		useState<AnalyticsTimeframe>('week')

	const fetchDashboardData = useCallback(async () => {
		try {
			setLoading(true)

			// Fetch all analytics data in parallel
			const [
				statsResponse,
				analyticsResponse,
				insightsResponse,
				financialResponse,
			] = await Promise.all([
				ordersApi.getDashboardStats(),
				ordersApi.getBranchAnalytics(selectedTimeframe),
				ordersApi.getProductInsights(selectedTimeframe),
				ordersApi.getFinancialMetrics(selectedTimeframe),
			])

			setStats(statsResponse)
			setBranchAnalytics(analyticsResponse.branches)
			setProductInsights(insightsResponse.products)
			setFinancialMetrics(financialResponse)
		} catch (error) {
			console.error('Dashboard fetch error:', error)
		} finally {
			setLoading(false)
		}
	}, [selectedTimeframe])

	useEffect(() => {
		fetchDashboardData()
	}, [fetchDashboardData])

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

	if (loading) {
		return (
			<ProtectedRoute requiredRole='admin'>
				<AdminLayout>
					<div className='flex items-center justify-center h-64'>
						<div className='text-center'>
							<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto'></div>
							<p className='mt-4 text-gray-600'>Loading dashboard...</p>
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
								Admin Dashboard
							</h1>
							<p className='text-gray-600 mt-1'>
								Complete overview of your restaurant supply operations
							</p>
						</div>
						<div className='flex gap-3'>
							<Select
								value={selectedTimeframe}
								onValueChange={(value: string) =>
									setSelectedTimeframe(value as AnalyticsTimeframe)
								}
							>
								<SelectTrigger className='w-32'>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value='day'>Today</SelectItem>
									<SelectItem value='week'>This Week</SelectItem>
									<SelectItem value='month'>This Month</SelectItem>
									<SelectItem value='quarter'>This Quarter</SelectItem>
								</SelectContent>
							</Select>
							<Button onClick={fetchDashboardData} variant='outline' size='sm'>
								<RefreshCw className='h-4 w-4 mr-2' />
								Refresh
							</Button>
						</div>
					</div>

					{/* Quick Stats */}
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
						<Card>
							<CardContent className='p-6'>
								<div className='flex items-center justify-between'>
									<div>
										<p className='text-sm font-medium text-gray-600'>
											Today&apos;s Orders
										</p>
										<p className='text-2xl font-bold'>
											{stats?.todayOrders || 0}
										</p>
									</div>
									<Calendar className='h-8 w-8 text-blue-600' />
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardContent className='p-6'>
								<div className='flex items-center justify-between'>
									<div>
										<p className='text-sm font-medium text-gray-600'>
											Pending Orders
										</p>
										<p className='text-2xl font-bold text-orange-600'>
											{stats?.pendingOrders || 0}
										</p>
									</div>
									<Clock className='h-8 w-8 text-orange-600' />
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
											{stats?.totalOrders || 0}
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
											Daily Spending
										</p>
										<p className='text-2xl font-bold text-purple-600'>
											{financialMetrics
												? formatKRW(financialMetrics.dailySpending)
												: formatKRW(0)}
										</p>
									</div>
									<DollarSign className='h-8 w-8 text-purple-600' />
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Financial Overview */}
					<div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
						<Card className='lg:col-span-2'>
							<CardHeader>
								<CardTitle className='flex items-center gap-2'>
									<BarChart3 className='h-5 w-5' />
									Financial Overview
								</CardTitle>
								<CardDescription>
									Spending analysis across different timeframes
								</CardDescription>
							</CardHeader>
							<CardContent>
								{financialMetrics && (
									<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
										<div className='text-center p-4 bg-blue-50 rounded-lg'>
											<p className='text-sm text-gray-600'>Weekly Spending</p>
											<p className='text-xl font-bold text-blue-600'>
												{formatKRW(financialMetrics.weeklySpending)}
											</p>
										</div>
										<div className='text-center p-4 bg-green-50 rounded-lg'>
											<p className='text-sm text-gray-600'>Monthly Spending</p>
											<p className='text-xl font-bold text-green-600'>
												{formatKRW(financialMetrics.monthlySpending)}
											</p>
										</div>
										<div className='text-center p-4 bg-purple-50 rounded-lg'>
											<p className='text-sm text-gray-600'>Avg Order Value</p>
											<p className='text-xl font-bold text-purple-600'>
												{formatKRW(financialMetrics.avgOrderValue)}
											</p>
										</div>
									</div>
								)}
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle className='flex items-center gap-2'>
									<AlertTriangle className='h-5 w-5 text-orange-500' />
									Quick Alerts
								</CardTitle>
							</CardHeader>
							<CardContent className='space-y-3'>
								<div className='flex items-center gap-2 p-2 bg-orange-50 rounded'>
									<AlertTriangle className='h-4 w-4 text-orange-500' />
									<span className='text-sm'>
										{stats?.pendingOrders || 0} pending orders need review
									</span>
								</div>
								<div className='flex items-center gap-2 p-2 bg-red-50 rounded'>
									<Package className='h-4 w-4 text-red-500' />
									<span className='text-sm'>Low stock alerts available</span>
								</div>
								<div className='flex items-center gap-2 p-2 bg-blue-50 rounded'>
									<TrendingUp className='h-4 w-4 text-blue-500' />
									<span className='text-sm'>
										{branchAnalytics.find(b => b.weeklyTrend > 0)?.branch ||
											'No branch'}
										{branchAnalytics.find(b => b.weeklyTrend > 0)
											? ` +${
													branchAnalytics.find(b => b.weeklyTrend > 0)
														?.weeklyTrend
											  }% this ${selectedTimeframe}`
											: ' showing growth'}
									</span>
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Branch Performance */}
					<Card>
						<CardHeader>
							<CardTitle className='flex items-center gap-2'>
								<MapPin className='h-5 w-5' />
								Branch Performance Analysis
							</CardTitle>
							<CardDescription>
								Detailed analytics for each branch location
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
								{branchAnalytics.map(branch => (
									<div key={branch.branch} className='border rounded-lg p-4'>
										<div className='flex items-center justify-between mb-4'>
											<h3 className='font-semibold text-lg'>{branch.branch}</h3>
											<div className='flex items-center gap-1'>
												{getTrendIcon(branch.weeklyTrend)}
												<span
													className={`text-sm ${
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

										<div className='grid grid-cols-2 gap-4 mb-4'>
											<div>
												<p className='text-sm text-gray-600'>Total Orders</p>
												<p className='text-xl font-bold'>
													{branch.totalOrders}
												</p>
											</div>
											<div>
												<p className='text-sm text-gray-600'>Total Value</p>
												<p className='text-xl font-bold'>
													{formatKRW(branch.totalValue)}
												</p>
											</div>
											<div>
												<p className='text-sm text-gray-600'>Avg Order Value</p>
												<p className='text-lg font-semibold'>
													{formatKRW(branch.avgOrderValue)}
												</p>
											</div>
											<div>
												<p className='text-sm text-gray-600'>Pending</p>
												<p className='text-lg font-semibold text-orange-600'>
													{branch.pendingOrders}
												</p>
											</div>
										</div>

										<div>
											<p className='text-sm font-medium text-gray-700 mb-2'>
												Top Products
											</p>
											<div className='space-y-1'>
												{branch.mostOrderedProducts.map((product, idx) => (
													<div
														key={idx}
														className='flex justify-between text-sm'
													>
														<span>{product.name}</span>
														<span className='text-gray-600'>
															{product.quantity} units
														</span>
													</div>
												))}
											</div>
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>

					{/* Product Insights */}
					<Card>
						<CardHeader>
							<CardTitle className='flex items-center gap-2'>
								<Package className='h-5 w-5' />
								Product Performance Insights
							</CardTitle>
							<CardDescription>
								Most popular products and ordering trends
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className='overflow-x-auto'>
								<table className='w-full'>
									<thead>
										<tr className='border-b'>
											<th className='text-left p-2'>Product</th>
											<th className='text-left p-2'>Total Ordered</th>
											<th className='text-left p-2'>Total Value</th>
											<th className='text-left p-2'>Frequency</th>
											<th className='text-left p-2'>Avg Price</th>
											<th className='text-left p-2'>Trend</th>
										</tr>
									</thead>
									<tbody>
										{productInsights.map((product, idx) => (
											<tr key={idx} className='border-b hover:bg-gray-50'>
												<td className='p-2 font-medium'>{product.name}</td>
												<td className='p-2'>{product.totalOrdered}</td>
												<td className='p-2'>{formatKRW(product.totalValue)}</td>
												<td className='p-2'>
													<Badge variant='secondary'>
														{product.frequency}%
													</Badge>
												</td>
												<td className='p-2'>{formatKRW(product.avgPrice)}</td>
												<td className='p-2'>{getTrendIcon(product.trend)}</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</CardContent>
					</Card>

					{/* Action Items */}
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
						<Card>
							<CardHeader>
								<CardTitle className='text-lg'>Quick Actions</CardTitle>
							</CardHeader>
							<CardContent className='space-y-3'>
								<Button className='w-full justify-start' variant='outline'>
									<FileText className='h-4 w-4 mr-2' />
									Generate Weekly Report
								</Button>
								<Button className='w-full justify-start' variant='outline'>
									<Download className='h-4 w-4 mr-2' />
									Export Order Data
								</Button>
								<Button className='w-full justify-start' variant='outline'>
									<Users className='h-4 w-4 mr-2' />
									Manage User Permissions
								</Button>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle className='text-lg'>System Health</CardTitle>
							</CardHeader>
							<CardContent className='space-y-3'>
								<div className='flex justify-between'>
									<span className='text-sm'>Database Status</span>
									<Badge className='bg-green-100 text-green-800'>Healthy</Badge>
								</div>
								<div className='flex justify-between'>
									<span className='text-sm'>API Response</span>
									<Badge className='bg-green-100 text-green-800'>Fast</Badge>
								</div>
								<div className='flex justify-between'>
									<span className='text-sm'>Active Users</span>
									<span className='text-sm font-medium'>12</span>
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle className='text-lg'>Recent Activity</CardTitle>
							</CardHeader>
							<CardContent className='space-y-2'>
								<div className='text-sm'>
									<p className='font-medium'>New order from Gangnam</p>
									<p className='text-gray-600'>2 minutes ago</p>
								</div>
								<div className='text-sm'>
									<p className='font-medium'>Order approved</p>
									<p className='text-gray-600'>5 minutes ago</p>
								</div>
								<div className='text-sm'>
									<p className='font-medium'>User registered</p>
									<p className='text-gray-600'>10 minutes ago</p>
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Stock Alerts */}
					<Card>
						<CardHeader>
							<CardTitle className='flex items-center gap-2'>
								<Package className='h-5 w-5' />
								Product Alerts & Trends
							</CardTitle>
							<CardDescription>
								Products requiring attention based on ordering patterns
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className='space-y-3'>
								{productInsights.slice(0, 3).map(product => (
									<div
										key={product.name}
										className='flex items-center justify-between p-2 border rounded'
									>
										<div>
											<p className='font-medium'>{product.name}</p>
											<p className='text-sm text-gray-500'>
												{product.totalOrdered} units ordered •{' '}
												{formatKRW(product.totalValue)} total value
											</p>
										</div>
										<Badge
											variant={
												product.trend === 'up'
													? 'default'
													: product.trend === 'down'
													? 'destructive'
													: 'secondary'
											}
										>
											{product.trend === 'up'
												? 'Trending Up'
												: product.trend === 'down'
												? 'Declining'
												: 'Stable'}
										</Badge>
									</div>
								))}
								{productInsights.length === 0 && (
									<div className='text-center text-gray-500 py-4'>
										No product data available for the selected timeframe
									</div>
								)}
							</div>
						</CardContent>
					</Card>
				</div>
			</AdminLayout>
		</ProtectedRoute>
	)
}

export default AdminDashboard
