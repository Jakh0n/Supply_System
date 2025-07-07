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
import {
	AnalyticsTimeframe,
	BranchAnalytics as BranchAnalyticsType,
	DashboardStats as DashboardStatsType,
	FinancialMetrics as FinancialMetricsType,
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

					// Create and download the file based on format
					let blob: Blob
					let fileExtension: string

					switch (format) {
						case 'excel':
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

						default:
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
					console.log('Export orders completed')
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
