'use client'

import BranchAnalyticsFilters from '@/components/admin/branches/BranchAnalyticsFilters'
import BranchAnalyticsHeader from '@/components/admin/branches/BranchAnalyticsHeader'
import BranchAnalyticsStats from '@/components/admin/branches/BranchAnalyticsStats'
import BranchPerformanceCards from '@/components/admin/branches/BranchPerformanceCards'
import AdminLayout from '@/components/shared/AdminLayout'
import ProtectedRoute from '@/components/shared/ProtectedRoute'
import { ordersApi } from '@/lib/api'
import { BranchReportData, PDFGenerator } from '@/lib/pdfGenerator'
import { BranchAnalytics, BranchFilter } from '@/types'
import { Activity, TrendingDown, TrendingUp } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

const BranchPerformancePage: React.FC = () => {
	const [branchAnalytics, setBranchAnalytics] = useState<BranchAnalytics[]>([])
	const [loading, setLoading] = useState(true)
	const [searchTerm, setSearchTerm] = useState('')
	const [showAllBranches, setShowAllBranches] = useState(false)
	const [selectedMonth, setSelectedMonth] = useState<number>(
		new Date().getMonth() + 1
	)
	const [selectedYear, setSelectedYear] = useState<number>(
		new Date().getFullYear()
	)
	const [filters, setFilters] = useState<BranchFilter>({
		branch: 'all',
		timeframe: 'month',
		category: 'all',
		dateRange: {
			start: '',
			end: '',
		},
	})

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

	const yearOptions = Array.from({ length: 6 }, (_, i) => {
		const year = new Date().getFullYear() - i
		return { value: year, label: year.toString() }
	})

	const fetchBranchData = useCallback(async () => {
		try {
			setLoading(true)

			const analyticsResponse = await ordersApi.getBranchAnalytics(
				'month',
				selectedMonth,
				selectedYear
			)
			setBranchAnalytics(analyticsResponse.branches)
		} catch (error) {
			console.error('Branch data fetch error:', error)
		} finally {
			setLoading(false)
		}
	}, [selectedMonth, selectedYear])

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

	const handleExportReport = async () => {
		try {
			if (branchAnalytics.length === 0) {
				return
			}

			const branchReportData: BranchReportData[] = branchAnalytics.map(
				branch => ({
					branch: branch.branch,
					totalOrders: branch.totalOrders,
					totalValue: branch.totalValue,
					avgOrderValue: branch.avgOrderValue,
					pendingOrders: branch.pendingOrders,
					weeklyTrend: branch.weeklyTrend,
				})
			)

			await PDFGenerator.generateBranchReportPDF(branchReportData, {
				title: `Branch Performance Report - ${
					monthOptions.find(m => m.value === selectedMonth)?.label
				} ${selectedYear}`,
				orientation: 'landscape',
				format: 'a4',
			})

			console.log('Branch report exported successfully')
		} catch (error) {
			console.error('Error exporting branch report:', error)
		}
	}

	const handleResetToCurrentMonth = () => {
		setSelectedMonth(new Date().getMonth() + 1)
		setSelectedYear(new Date().getFullYear())
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
				<div className='space-y-4 sm:space-y-6 p-4 sm:p-6'>
					{/* Header */}
					<BranchAnalyticsHeader
						selectedMonth={selectedMonth}
						selectedYear={selectedYear}
						monthOptions={monthOptions}
						onRefresh={fetchBranchData}
						onExportReport={handleExportReport}
					/>

					{/* Filters */}
					<BranchAnalyticsFilters
						searchTerm={searchTerm}
						selectedMonth={selectedMonth}
						selectedYear={selectedYear}
						filters={filters}
						branchAnalytics={branchAnalytics}
						monthOptions={monthOptions}
						yearOptions={yearOptions}
						onSearchChange={setSearchTerm}
						onMonthChange={setSelectedMonth}
						onYearChange={setSelectedYear}
						onFiltersChange={setFilters}
						onResetToCurrentMonth={handleResetToCurrentMonth}
					/>

					{/* Overview Stats */}
					<BranchAnalyticsStats
						filteredBranches={filteredBranches}
						formatKRW={formatKRW}
						getEfficiencyScore={getEfficiencyScore}
					/>

					{/* Branch Performance Cards */}
					<BranchPerformanceCards
						filteredBranches={filteredBranches}
						branchesToDisplay={branchesToDisplay}
						showAllBranches={showAllBranches}
						selectedMonth={selectedMonth}
						selectedYear={selectedYear}
						formatKRW={formatKRW}
						getEfficiencyScore={getEfficiencyScore}
						getPerformanceLevel={getPerformanceLevel}
						getTrendIcon={getTrendIcon}
						onToggleShowAll={() => setShowAllBranches(!showAllBranches)}
					/>
				</div>
			</AdminLayout>
		</ProtectedRoute>
	)
}

export default BranchPerformancePage
