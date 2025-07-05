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
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
	ChevronDown,
	ChevronUp,
	Clock,
	DollarSign,
	Download,
	FileSpreadsheet,
	FileText,
	FileType,
	MapPin,
	Package,
	RefreshCw,
	Settings,
	ShoppingCart,
	TrendingDown,
	TrendingUp,
	Users,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useCallback, useEffect, useState } from 'react'

const AdminDashboard: React.FC = () => {
	const router = useRouter()
	const [stats, setStats] = useState<DashboardStats | null>(null)
	const [branchAnalytics, setBranchAnalytics] = useState<BranchAnalytics[]>([])
	const [productInsights, setProductInsights] = useState<ProductInsights[]>([])
	const [financialMetrics, setFinancialMetrics] =
		useState<FinancialMetrics | null>(null)
	const [loading, setLoading] = useState(true)
	const [selectedTimeframe] = useState<AnalyticsTimeframe>('week')
	const [selectedMonth, setSelectedMonth] = useState<number>(
		new Date().getMonth() + 1
	)
	const [selectedYear, setSelectedYear] = useState<number>(
		new Date().getFullYear()
	)
	const [showAllBranches, setShowAllBranches] = useState(false)
	const [actionLoading, setActionLoading] = useState<string | null>(null)

	// Month and year options
	const monthOptions = [
		{ value: 1, label: 'January' },
		{ value: 2, label: 'February' },
		{ value: 3, label: 'March' },
		{ value: 4, label: 'April' },
		{ value: 5, label: 'May' },
		{ value: 6, label: 'June' },
		{ value: 7, label: 'July' },
		{ value: 8, label: 'August' },
		{ value: 9, label: 'September' },
		{ value: 10, label: 'October' },
		{ value: 11, label: 'November' },
		{ value: 12, label: 'December' },
	]

	const yearOptions = [
		{
			value: new Date().getFullYear(),
			label: new Date().getFullYear().toString(),
		},
		{
			value: new Date().getFullYear() - 1,
			label: (new Date().getFullYear() - 1).toString(),
		},
		{
			value: new Date().getFullYear() - 2,
			label: (new Date().getFullYear() - 2).toString(),
		},
	]

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
				ordersApi.getBranchAnalytics(
					selectedTimeframe,
					selectedMonth,
					selectedYear
				),
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
	}, [selectedTimeframe, selectedMonth, selectedYear])

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

	// Determine which branches to display based on showAllBranches state
	const branchesToDisplay = showAllBranches
		? branchAnalytics
		: branchAnalytics.slice(0, 2)

	const handleQuickAction = async (action: string, format?: string) => {
		setActionLoading(action)
		try {
			switch (action) {
				case 'generate-report':
					// Simulate report generation
					await new Promise(resolve => setTimeout(resolve, 2000))
					// In real implementation, this would call an API to generate and download report
					const reportData = {
						timeframe: selectedTimeframe,
						branches: branchAnalytics.length,
						totalOrders: stats?.totalOrders || 0,
						totalSpending: financialMetrics?.monthlySpending || 0,
						generatedAt: new Date().toISOString(),
						branchDetails: branchAnalytics.map(b => ({
							branch: b.branch,
							orders: b.totalOrders,
							value: b.totalValue,
							avgOrderValue: b.avgOrderValue,
							pendingOrders: b.pendingOrders,
							weeklyTrend: b.weeklyTrend,
						})),
						productInsights: productInsights.slice(0, 10).map(p => ({
							name: p.name,
							totalOrdered: p.totalOrdered,
							totalValue: p.totalValue,
							frequency: p.frequency,
							trend: p.trend,
						})),
					}

					let blob: Blob
					let fileExtension: string

					switch (format) {
						case 'excel':
							// For Excel format, create CSV-like content
							const csvContent = [
								'Branch Performance Report',
								`Generated: ${new Date().toLocaleString()}`,
								`Timeframe: ${selectedTimeframe}`,
								'',
								'Branch Summary:',
								'Branch Name,Total Orders,Total Value,Avg Order Value,Pending Orders,Weekly Trend',
								...branchAnalytics.map(
									b =>
										`${b.branch},${b.totalOrders},${b.totalValue},${b.avgOrderValue},${b.pendingOrders},${b.weeklyTrend}%`
								),
								'',
								'Product Insights:',
								'Product Name,Total Ordered,Total Value,Frequency,Trend',
								...productInsights
									.slice(0, 10)
									.map(
										p =>
											`${p.name},${p.totalOrdered},${p.totalValue},${p.frequency}%,${p.trend}`
									),
							].join('\n')
							blob = new Blob([csvContent], { type: 'text/csv' })
							fileExtension = 'csv'
							break

						case 'pdf':
							// For PDF format, create HTML content (in real app, use PDF library)
							const htmlContent = `
								<html>
									<head><title>Branch Performance Report</title></head>
									<body>
										<h1>Branch Performance Report</h1>
										<p>Generated: ${new Date().toLocaleString()}</p>
										<p>Timeframe: ${selectedTimeframe}</p>
										<h2>Branch Summary</h2>
										<table border="1">
											<tr><th>Branch</th><th>Orders</th><th>Value</th><th>Avg Order</th><th>Pending</th><th>Trend</th></tr>
											${branchAnalytics
												.map(
													b =>
														`<tr><td>${b.branch}</td><td>${b.totalOrders}</td><td>${b.totalValue}</td><td>${b.avgOrderValue}</td><td>${b.pendingOrders}</td><td>${b.weeklyTrend}%</td></tr>`
												)
												.join('')}
										</table>
										<h2>Product Insights</h2>
										<table border="1">
											<tr><th>Product</th><th>Total Ordered</th><th>Total Value</th><th>Frequency</th><th>Trend</th></tr>
											${productInsights
												.slice(0, 10)
												.map(
													p =>
														`<tr><td>${p.name}</td><td>${p.totalOrdered}</td><td>${p.totalValue}</td><td>${p.frequency}%</td><td>${p.trend}</td></tr>`
												)
												.join('')}
										</table>
									</body>
								</html>
							`
							blob = new Blob([htmlContent], { type: 'text/html' })
							fileExtension = 'html'
							break

						case 'doc':
							// For DOC format, create RTF content
							const rtfContent = `{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0 Times New Roman;}}
								\\f0\\fs24 Branch Performance Report\\par
								Generated: ${new Date().toLocaleString()}\\par
								Timeframe: ${selectedTimeframe}\\par\\par
								Branch Summary:\\par
								${branchAnalytics
									.map(
										b =>
											`${b.branch}: ${b.totalOrders} orders, ${b.totalValue} value, ${b.weeklyTrend}% trend\\par`
									)
									.join('')}
								\\par
								Product Insights:\\par
								${productInsights
									.slice(0, 10)
									.map(
										p =>
											`${p.name}: ${p.totalOrdered} ordered, ${p.totalValue} value, ${p.trend} trend\\par`
									)
									.join('')}
							}`
							blob = new Blob([rtfContent], { type: 'application/rtf' })
							fileExtension = 'rtf'
							break

						default:
							// Default JSON format
							blob = new Blob([JSON.stringify(reportData, null, 2)], {
								type: 'application/json',
							})
							fileExtension = 'json'
					}

					const fileName = `report-${selectedTimeframe}-${new Date().getTime()}.${fileExtension}`
					const url = URL.createObjectURL(blob)
					const a = document.createElement('a')
					a.href = url
					a.download = fileName
					document.body.appendChild(a)
					a.click()
					document.body.removeChild(a)
					URL.revokeObjectURL(url)
					break

				case 'export-orders':
					// Simulate order export
					await new Promise(resolve => setTimeout(resolve, 1500))
					// In real implementation, this would call ordersApi.exportOrders()
					const orderData = {
						timeframe: selectedTimeframe,
						totalOrders: stats?.totalOrders || 0,
						pendingOrders: stats?.pendingOrders || 0,
						branches: branchAnalytics.map(b => ({
							branch: b.branch,
							orders: b.totalOrders,
							value: b.totalValue,
							avgOrderValue: b.avgOrderValue,
							pendingOrders: b.pendingOrders,
							weeklyTrend: b.weeklyTrend,
							mostOrderedProducts: b.mostOrderedProducts,
						})),
						exportedAt: new Date().toISOString(),
					}

					let orderBlob: Blob
					let orderFileExtension: string

					switch (format) {
						case 'excel':
							// For Excel format, create CSV content
							const orderCsvContent = [
								'Order Export Report',
								`Generated: ${new Date().toLocaleString()}`,
								`Timeframe: ${selectedTimeframe}`,
								`Total Orders: ${stats?.totalOrders || 0}`,
								`Pending Orders: ${stats?.pendingOrders || 0}`,
								'',
								'Branch Order Summary:',
								'Branch Name,Total Orders,Total Value,Avg Order Value,Pending Orders,Weekly Trend',
								...branchAnalytics.map(
									b =>
										`${b.branch},${b.totalOrders},${b.totalValue},${b.avgOrderValue},${b.pendingOrders},${b.weeklyTrend}%`
								),
								'',
								'Branch Top Products:',
								'Branch,Product Name,Quantity Ordered',
								...branchAnalytics.flatMap(b =>
									b.mostOrderedProducts.map(
										p => `${b.branch},${p.name},${p.quantity}`
									)
								),
							].join('\n')
							orderBlob = new Blob([orderCsvContent], { type: 'text/csv' })
							orderFileExtension = 'csv'
							break

						case 'pdf':
							// For PDF format, create HTML content
							const orderHtmlContent = `
								<html>
									<head><title>Order Export Report</title></head>
									<body>
										<h1>Order Export Report</h1>
										<p>Generated: ${new Date().toLocaleString()}</p>
										<p>Timeframe: ${selectedTimeframe}</p>
										<p>Total Orders: ${stats?.totalOrders || 0}</p>
										<p>Pending Orders: ${stats?.pendingOrders || 0}</p>
										<h2>Branch Order Summary</h2>
										<table border="1">
											<tr><th>Branch</th><th>Total Orders</th><th>Total Value</th><th>Avg Order Value</th><th>Pending</th><th>Weekly Trend</th></tr>
											${branchAnalytics
												.map(
													b =>
														`<tr><td>${b.branch}</td><td>${b.totalOrders}</td><td>${b.totalValue}</td><td>${b.avgOrderValue}</td><td>${b.pendingOrders}</td><td>${b.weeklyTrend}%</td></tr>`
												)
												.join('')}
										</table>
										<h2>Top Products by Branch</h2>
										${branchAnalytics
											.map(
												b => `
											<h3>${b.branch}</h3>
											<table border="1">
												<tr><th>Product</th><th>Quantity</th></tr>
												${b.mostOrderedProducts
													.map(
														p =>
															`<tr><td>${p.name}</td><td>${p.quantity}</td></tr>`
													)
													.join('')}
											</table>
										`
											)
											.join('')}
									</body>
								</html>
							`
							orderBlob = new Blob([orderHtmlContent], { type: 'text/html' })
							orderFileExtension = 'html'
							break

						case 'doc':
							// For DOC format, create RTF content
							const orderRtfContent = `{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0 Times New Roman;}}
								\\f0\\fs24 Order Export Report\\par
								Generated: ${new Date().toLocaleString()}\\par
								Timeframe: ${selectedTimeframe}\\par
								Total Orders: ${stats?.totalOrders || 0}\\par
								Pending Orders: ${stats?.pendingOrders || 0}\\par\\par
								Branch Order Summary:\\par
								${branchAnalytics
									.map(
										b =>
											`${b.branch}: ${b.totalOrders} orders, ${b.totalValue} value, ${b.pendingOrders} pending, ${b.weeklyTrend}% trend\\par`
									)
									.join('')}
								\\par
								Top Products by Branch:\\par
								${branchAnalytics
									.map(
										b =>
											`${b.branch}: ${b.mostOrderedProducts
												.map(p => `${p.name} (${p.quantity})`)
												.join(', ')}\\par`
									)
									.join('')}
							}`
							orderBlob = new Blob([orderRtfContent], {
								type: 'application/rtf',
							})
							orderFileExtension = 'rtf'
							break

						default:
							// Default JSON format
							orderBlob = new Blob([JSON.stringify(orderData, null, 2)], {
								type: 'application/json',
							})
							orderFileExtension = 'json'
					}

					const orderFileName = `orders-export-${selectedTimeframe}-${new Date().getTime()}.${orderFileExtension}`
					const orderUrl = URL.createObjectURL(orderBlob)
					const orderLink = document.createElement('a')
					orderLink.href = orderUrl
					orderLink.download = orderFileName
					document.body.appendChild(orderLink)
					orderLink.click()
					document.body.removeChild(orderLink)
					URL.revokeObjectURL(orderUrl)
					break

				case 'manage-users':
					// Navigate to user management using Next.js router
					router.push('/admin/users')
					break

				case 'system-settings':
					// Navigate to system settings using Next.js router
					router.push('/admin/settings')
					break

				case 'refresh-data':
					// Refresh all dashboard data
					await fetchDashboardData()
					break

				default:
					console.log(`Action ${action} not implemented`)
			}
		} catch (error) {
			console.error(`Error performing action ${action}:`, error)
		} finally {
			setActionLoading(null)
		}
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
							<div className='flex items-center justify-between'>
								<div>
									<CardTitle className='flex items-center gap-2'>
										<MapPin className='h-5 w-5' />
										Branch Performance Analysis
									</CardTitle>
									<CardDescription>
										Analytics for{' '}
										{monthOptions.find(m => m.value === selectedMonth)?.label}{' '}
										{selectedYear}
									</CardDescription>
								</div>
								<div className='flex items-center gap-3'>
									{/* Month Selector */}
									<div className='flex items-center gap-2'>
										<label className='text-sm font-medium'>Month:</label>
										<Select
											value={selectedMonth.toString()}
											onValueChange={(value: string) =>
												setSelectedMonth(parseInt(value))
											}
										>
											<SelectTrigger className='w-32'>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												{monthOptions.map(month => (
													<SelectItem
														key={month.value}
														value={month.value.toString()}
													>
														{month.label}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>

									{/* Year Selector */}
									<div className='flex items-center gap-2'>
										<label className='text-sm font-medium'>Year:</label>
										<Select
											value={selectedYear.toString()}
											onValueChange={(value: string) =>
												setSelectedYear(parseInt(value))
											}
										>
											<SelectTrigger className='w-24'>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												{yearOptions.map(year => (
													<SelectItem
														key={year.value}
														value={year.value.toString()}
													>
														{year.label}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>

									{/* Toggle Button */}
									{branchAnalytics.length > 2 && (
										<Button
											variant='outline'
											size='sm'
											onClick={() => setShowAllBranches(!showAllBranches)}
											className='flex items-center gap-2'
										>
											{showAllBranches ? (
												<>
													<ChevronUp className='h-4 w-4' />
													Hide Branches ({branchAnalytics.length - 2} hidden)
												</>
											) : (
												<>
													<ChevronDown className='h-4 w-4' />
													Show All Branches ({branchAnalytics.length} total)
												</>
											)}
										</Button>
									)}
								</div>
							</div>
						</CardHeader>
						<CardContent>
							{branchAnalytics.length === 0 ? (
								<div className='text-center py-12'>
									<MapPin className='h-16 w-16 text-gray-300 mx-auto mb-4' />
									<h3 className='text-lg font-semibold text-gray-900 mb-2'>
										No Data Available
									</h3>
									<p className='text-gray-600 mb-4'>
										There is no branch data available for{' '}
										{monthOptions.find(m => m.value === selectedMonth)?.label}{' '}
										{selectedYear}.
									</p>
									<p className='text-sm text-gray-500'>
										Try selecting a different month or year to view analytics
										data.
									</p>
								</div>
							) : (
								<div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
									{branchesToDisplay.map(branch => (
										<div key={branch.branch} className='border rounded-lg p-4'>
											<div className='flex items-center justify-between mb-4'>
												<h3 className='font-semibold text-lg'>
													{branch.branch}
												</h3>
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
													<p className='text-sm text-gray-600'>
														Avg Order Value
													</p>
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
							)}
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
								<CardDescription>Common administrative tasks</CardDescription>
							</CardHeader>
							<CardContent className='space-y-3'>
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button
											className='w-full justify-start'
											variant='outline'
											disabled={actionLoading === 'generate-report'}
										>
											{actionLoading === 'generate-report' ? (
												<div className='animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2' />
											) : (
												<FileText className='h-4 w-4 mr-2' />
											)}
											Generate Report
											<ChevronDown className='h-4 w-4 ml-auto' />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align='start' className='w-48'>
										<DropdownMenuItem
											onClick={() =>
												handleQuickAction('generate-report', 'excel')
											}
											disabled={actionLoading === 'generate-report'}
										>
											<FileSpreadsheet className='h-4 w-4 mr-2 text-green-600' />
											Download as Excel
										</DropdownMenuItem>
										<DropdownMenuItem
											onClick={() =>
												handleQuickAction('generate-report', 'pdf')
											}
											disabled={actionLoading === 'generate-report'}
										>
											<FileType className='h-4 w-4 mr-2 text-red-600' />
											Download as PDF
										</DropdownMenuItem>
										<DropdownMenuItem
											onClick={() =>
												handleQuickAction('generate-report', 'doc')
											}
											disabled={actionLoading === 'generate-report'}
										>
											<FileText className='h-4 w-4 mr-2 text-blue-600' />
											Download as DOC
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button
											className='w-full justify-start'
											variant='outline'
											disabled={actionLoading === 'export-orders'}
										>
											{actionLoading === 'export-orders' ? (
												<div className='animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2' />
											) : (
												<Download className='h-4 w-4 mr-2' />
											)}
											Export Order Data
											<ChevronDown className='h-4 w-4 ml-auto' />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align='start' className='w-48'>
										<DropdownMenuItem
											onClick={() =>
												handleQuickAction('export-orders', 'excel')
											}
											disabled={actionLoading === 'export-orders'}
										>
											<FileSpreadsheet className='h-4 w-4 mr-2 text-green-600' />
											Export as Excel
										</DropdownMenuItem>
										<DropdownMenuItem
											onClick={() => handleQuickAction('export-orders', 'pdf')}
											disabled={actionLoading === 'export-orders'}
										>
											<FileType className='h-4 w-4 mr-2 text-red-600' />
											Export as PDF
										</DropdownMenuItem>
										<DropdownMenuItem
											onClick={() => handleQuickAction('export-orders', 'doc')}
											disabled={actionLoading === 'export-orders'}
										>
											<FileText className='h-4 w-4 mr-2 text-blue-600' />
											Export as DOC
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
								<Button
									className='w-full justify-start'
									variant='outline'
									onClick={() => handleQuickAction('manage-users')}
									disabled={actionLoading === 'manage-users'}
								>
									{actionLoading === 'manage-users' ? (
										<div className='animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2' />
									) : (
										<Users className='h-4 w-4 mr-2' />
									)}
									Manage User Permissions
								</Button>
								<Button
									className='w-full justify-start'
									variant='outline'
									onClick={() => handleQuickAction('system-settings')}
									disabled={actionLoading === 'system-settings'}
								>
									{actionLoading === 'system-settings' ? (
										<div className='animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2' />
									) : (
										<Settings className='h-4 w-4 mr-2' />
									)}
									System Settings
								</Button>
								<Button
									className='w-full justify-start'
									variant='outline'
									onClick={() => handleQuickAction('refresh-data')}
									disabled={actionLoading === 'refresh-data'}
								>
									{actionLoading === 'refresh-data' ? (
										<div className='animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2' />
									) : (
										<RefreshCw className='h-4 w-4 mr-2' />
									)}
									Refresh All Data
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
