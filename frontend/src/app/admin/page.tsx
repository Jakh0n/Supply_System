'use client'

import {
	BranchAnalytics,
	DashboardStats,
	FinancialMetrics,
	ProductInsights,
	QuickActions,
	TimeframeSelector,
} from '@/components/admin'
import AdminLayout from '@/components/shared/AdminLayout'
import ProtectedRoute from '@/components/shared/ProtectedRoute'
import { ordersApi } from '@/lib/api'
import { BranchReportData, PDFGenerator } from '@/lib/pdfGenerator'
import {
	AnalyticsTimeframe,
	BranchAnalytics as BranchAnalyticsType,
	DashboardStats as DashboardStatsType,
	FinancialMetrics as FinancialMetricsType,
	Order,
	ProductInsights as ProductInsightsType,
} from '@/types'
import React, { useCallback, useEffect, useState } from 'react'

const AdminDashboard: React.FC = () => {
	const [stats, setStats] = useState<DashboardStatsType | null>(null)
	const [branchAnalytics, setBranchAnalytics] = useState<BranchAnalyticsType[]>(
		[]
	)
	const [productInsights, setProductInsights] = useState<ProductInsightsType[]>(
		[]
	)
	const [financialMetrics, setFinancialMetrics] =
		useState<FinancialMetricsType | null>(null)
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

	const handleQuickAction = async (
		action: string,
		format?: string,
		timeframe?: string
	) => {
		setActionLoading(action)
		try {
			switch (action) {
				case 'download-statistics':
					await handleDownloadStatistics(format || 'pdf', timeframe || 'daily')
					break

				case 'generate-report':
					await handleGenerateReport(format || 'pdf', timeframe || 'daily')
					break

				case 'weekly-statistics':
					await handleWeeklyStatistics(format || 'pdf')
					break

				case 'monthly-statistics':
					await handleMonthlyStatistics(format || 'pdf')
					break

				default:
					console.log('Unknown action:', action)
			}
		} catch (error) {
			console.error('Action error:', error)
		} finally {
			setActionLoading(null)
		}
	}

	const handleDownloadStatistics = async (
		format: string,
		timeframe: string
	) => {
		try {
			let ordersResponse
			let dateRange = { start: '', end: '' }
			let title = ''

			// Calculate date range based on timeframe
			const now = new Date()

			switch (timeframe) {
				case 'daily':
					const today = now.toISOString().split('T')[0]
					ordersResponse = await ordersApi.getOrders({
						date: today,
						limit: 1000,
					})
					dateRange = { start: today, end: today }
					title = `Daily Statistics - ${today}`
					break

				case 'weekly':
					const startOfWeek = new Date(
						now.setDate(now.getDate() - now.getDay())
					)
					const endOfWeek = new Date(now.setDate(startOfWeek.getDate() + 6))
					const startDate = startOfWeek.toISOString().split('T')[0]
					const endDate = endOfWeek.toISOString().split('T')[0]

					ordersResponse = await ordersApi.getOrders({
						date: startDate,
						limit: 1000,
					})
					dateRange = { start: startDate, end: endDate }
					title = `Weekly Statistics - ${startDate} to ${endDate}`
					break

				case 'monthly':
					ordersResponse = await ordersApi.getOrders({
						month: selectedMonth,
						year: selectedYear,
						limit: 1000,
					})
					const monthNames = [
						'January',
						'February',
						'March',
						'April',
						'May',
						'June',
						'July',
						'August',
						'September',
						'October',
						'November',
						'December',
					]
					title = `Monthly Statistics - ${
						monthNames[selectedMonth - 1]
					} ${selectedYear}`
					break

				case '6months':
					// Get last 6 months data
					ordersResponse = await ordersApi.getOrders({
						limit: 1000,
					})
					title = `6 Months Statistics`
					break

				case 'yearly':
					ordersResponse = await ordersApi.getOrders({
						year: selectedYear,
						limit: 1000,
					})
					title = `Yearly Statistics - ${selectedYear}`
					break

				default:
					ordersResponse = await ordersApi.getOrders({ limit: 1000 })
					title = 'Statistics Report'
			}

			if (format === 'pdf') {
				if (timeframe === 'weekly') {
					await PDFGenerator.generateWeeklyStatisticsPDF({
						orders: ordersResponse.orders,
						branchStats: branchAnalytics.map(b => ({
							branch: b.branch,
							totalOrders: b.totalOrders,
							totalValue: b.totalValue,
							avgOrderValue: b.avgOrderValue,
							pendingOrders: b.pendingOrders,
							weeklyTrend: b.weeklyTrend,
						})),
						dateRange,
					})
				} else if (timeframe === 'monthly') {
					const monthNames = [
						'January',
						'February',
						'March',
						'April',
						'May',
						'June',
						'July',
						'August',
						'September',
						'October',
						'November',
						'December',
					]

					await PDFGenerator.generateMonthlyStatisticsPDF({
						orders: ordersResponse.orders,
						branchStats: branchAnalytics.map(b => ({
							branch: b.branch,
							totalOrders: b.totalOrders,
							totalValue: b.totalValue,
							avgOrderValue: b.avgOrderValue,
							pendingOrders: b.pendingOrders,
							weeklyTrend: b.weeklyTrend,
						})),
						productInsights: productInsights.map(p => ({
							name: p.name,
							totalOrdered: p.totalOrdered,
							totalValue: p.totalValue,
							frequency: p.frequency,
							trend: p.trend,
						})),
						month: monthNames[selectedMonth - 1],
						year: selectedYear.toString(),
					})
				} else {
					// Generate a general statistics PDF
					await PDFGenerator.generateOrdersPDF(ordersResponse.orders, {
						title,
						orientation: 'portrait',
						format: 'a4',
					})
				}
				console.log(`${timeframe} statistics PDF generated successfully`)
			} else {
				// Generate CSV
				const csvContent = [
					title,
					`Generated: ${new Date().toLocaleString()}`,
					`Timeframe: ${timeframe}`,
					`Total Orders: ${ordersResponse.orders.length}`,
					'',
					'Summary:',
					`Total Orders: ${ordersResponse.orders.length}`,
					`Total Branches: ${branchAnalytics.length}`,
					'',
					'Orders by Status:',
					'Status,Count',
					...Object.entries(
						ordersResponse.orders.reduce(
							(acc: Record<string, number>, order) => {
								acc[order.status] = (acc[order.status] || 0) + 1
								return acc
							},
							{}
						)
					).map(([status, count]) => `${status},${count}`),
				].join('\n')

				const blob = new Blob([csvContent], { type: 'text/csv' })
				const fileName = `${timeframe}-statistics-${new Date().getTime()}.csv`
				const url = URL.createObjectURL(blob)
				const a = document.createElement('a')
				a.href = url
				a.download = fileName
				document.body.appendChild(a)
				a.click()
				document.body.removeChild(a)
				URL.revokeObjectURL(url)
				console.log(`${timeframe} statistics CSV generated successfully`)
			}
		} catch (error) {
			console.error(`${timeframe} statistics generation error:`, error)
		}
	}

	const handleGenerateReport = async (format: string, timeframe: string) => {
		try {
			// First, get orders for the selected timeframe to check if there's data
			let ordersResponse
			let dateInfo = ''

			// Calculate date range and fetch orders based on timeframe
			const now = new Date()

			switch (timeframe) {
				case 'daily':
					const today = now.toISOString().split('T')[0]
					ordersResponse = await ordersApi.getOrders({
						date: today,
						limit: 1000,
					})
					dateInfo = today
					break

				case 'weekly':
					const startOfWeek = new Date(
						now.setDate(now.getDate() - now.getDay())
					)
					const endOfWeek = new Date(now.setDate(startOfWeek.getDate() + 6))
					const startDate = startOfWeek.toISOString().split('T')[0]
					const endDate = endOfWeek.toISOString().split('T')[0]

					ordersResponse = await ordersApi.getOrders({
						date: startDate,
						limit: 1000,
					})
					dateInfo = `${startDate} to ${endDate}`
					break

				case 'monthly':
					ordersResponse = await ordersApi.getOrders({
						month: selectedMonth,
						year: selectedYear,
						limit: 1000,
					})
					const monthNames = [
						'January',
						'February',
						'March',
						'April',
						'May',
						'June',
						'July',
						'August',
						'September',
						'October',
						'November',
						'December',
					]
					dateInfo = `${monthNames[selectedMonth - 1]} ${selectedYear}`
					break

				case '6months':
					ordersResponse = await ordersApi.getOrders({
						limit: 1000,
					})
					dateInfo = 'Last 6 months'
					break

				case 'yearly':
					ordersResponse = await ordersApi.getOrders({
						year: selectedYear,
						limit: 1000,
					})
					dateInfo = selectedYear.toString()
					break

				default:
					ordersResponse = await ordersApi.getOrders({ limit: 1000 })
					dateInfo = 'All time'
			}

			// Check if there are orders for the selected period
			const hasOrders =
				ordersResponse.orders && ordersResponse.orders.length > 0

			// Filter branch data to only include branches that have orders in the selected timeframe
			let filteredBranchData: BranchReportData[] = []

			if (hasOrders) {
				// Calculate statistics for branches that have orders in this timeframe
				const branchOrderStats = ordersResponse.orders.reduce((acc, order) => {
					const branch = order.branch
					if (!acc[branch]) {
						acc[branch] = {
							orders: [],
							totalValue: 0,
							pendingCount: 0,
						}
					}
					acc[branch].orders.push(order)

					// Calculate order value
					const orderValue = order.items.reduce(
						(sum, item) => sum + item.quantity * item.product.price,
						0
					)
					acc[branch].totalValue += orderValue

					// Count pending orders
					if (order.status === 'pending') {
						acc[branch].pendingCount++
					}

					return acc
				}, {} as Record<string, { orders: Order[]; totalValue: number; pendingCount: number }>)

				// Create filtered branch data with actual timeframe statistics
				filteredBranchData = Object.entries(branchOrderStats).map(
					([branch, stats]) => {
						const totalOrders = stats.orders.length
						const avgOrderValue =
							totalOrders > 0 ? stats.totalValue / totalOrders : 0

						// Find the branch in original analytics for trend data (fallback)
						const originalBranch = branchAnalytics.find(
							b => b.branch === branch
						)

						return {
							branch,
							totalOrders,
							totalValue: stats.totalValue,
							avgOrderValue,
							pendingOrders: stats.pendingCount,
							weeklyTrend: originalBranch?.weeklyTrend || 0, // Use original trend or 0
						}
					}
				)

				// Sort by total value descending
				filteredBranchData.sort((a, b) => b.totalValue - a.totalValue)
			}

			if (format === 'pdf') {
				await PDFGenerator.generateBranchReportPDF(filteredBranchData, {
					title: `Branch Performance Report - ${
						timeframe.charAt(0).toUpperCase() + timeframe.slice(1)
					} (${dateInfo})`,
					orientation: 'landscape',
					format: 'a4',
					hasOrders,
					orderCount: hasOrders ? ordersResponse.orders.length : 0,
				})

				if (hasOrders) {
					console.log(
						`Branch report PDF generated successfully for ${timeframe} with ${ordersResponse.orders.length} orders from ${filteredBranchData.length} branches`
					)
				} else {
					console.log(
						`Branch report PDF generated for ${timeframe} - No orders found for ${dateInfo}`
					)
				}
			} else {
				// Generate CSV with appropriate messaging for empty data
				const csvContent = [
					'Branch Performance Report',
					`Generated: ${new Date().toLocaleString()}`,
					`Timeframe: ${timeframe} (${dateInfo})`,
					`Total Orders: ${hasOrders ? ordersResponse.orders.length : 0}`,
					`Active Branches: ${filteredBranchData.length}`,
					'',
					...(hasOrders && filteredBranchData.length > 0
						? [
								'Branch Summary (Branches with orders in this period):',
								'Branch Name,Total Orders,Total Value,Avg Order Value,Pending Orders,Weekly Trend',
								...filteredBranchData.map(
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
						  ]
						: [
								'No orders found for this period.',
								'',
								'Note: No branches had orders during the selected timeframe.',
								'Please select a different time period or check if orders exist.',
						  ]),
				].join('\n')

				const blob = new Blob([csvContent], { type: 'text/csv' })
				const fileName = `branch-report-${timeframe}-${dateInfo.replace(
					/[^a-zA-Z0-9]/g,
					'-'
				)}-${new Date().getTime()}.csv`
				const url = URL.createObjectURL(blob)
				const a = document.createElement('a')
				a.href = url
				a.download = fileName
				document.body.appendChild(a)
				a.click()
				document.body.removeChild(a)
				URL.revokeObjectURL(url)

				if (hasOrders) {
					console.log(
						`Branch report CSV generated successfully for ${timeframe} with ${ordersResponse.orders.length} orders from ${filteredBranchData.length} branches`
					)
				} else {
					console.log(
						`Branch report CSV generated for ${timeframe} - No orders found for ${dateInfo}`
					)
				}
			}
		} catch (error) {
			console.error('Branch report generation error:', error)
		}
	}

	const handleWeeklyStatistics = async (format: string) => {
		await handleDownloadStatistics(format, 'weekly')
	}

	const handleMonthlyStatistics = async (format: string) => {
		await handleDownloadStatistics(format, 'monthly')
	}

	return (
		<ProtectedRoute requiredRole='admin'>
			<AdminLayout>
				<div className='space-y-6'>
					{/* Header with timeframe selector */}
					<TimeframeSelector
						selectedMonth={selectedMonth}
						selectedYear={selectedYear}
						onMonthChange={setSelectedMonth}
						onYearChange={setSelectedYear}
						onRefresh={fetchDashboardData}
						loading={loading}
					/>

					{/* Dashboard Stats */}
					<DashboardStats
						stats={stats}
						formatKRW={formatKRW}
						loading={loading}
					/>

					{/* Financial Metrics */}
					<FinancialMetrics
						financialMetrics={financialMetrics}
						loading={loading}
						formatKRW={formatKRW}
					/>

					{/* Branch Analytics */}
					<BranchAnalytics
						loading={loading}
						branchAnalytics={branchAnalytics}
						showAllBranches={showAllBranches}
						onToggleShowAll={() => setShowAllBranches(!showAllBranches)}
						formatKRW={formatKRW}
					/>

					{/* Product Insights */}
					<ProductInsights
						productInsights={productInsights}
						loading={loading}
						formatKRW={formatKRW}
					/>

					{/* Quick Actions */}
					<QuickActions
						actionLoading={actionLoading}
						stats={stats}
						onQuickAction={handleQuickAction}
					/>
				</div>
			</AdminLayout>
		</ProtectedRoute>
	)
}

export default AdminDashboard
