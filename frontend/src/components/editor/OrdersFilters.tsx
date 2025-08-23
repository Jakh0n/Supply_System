import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { branchesApi } from '@/lib/api'
import { OrderFilters, OrderStatus } from '@/types'
import {
	Calendar,
	Download,
	FileText,
	Filter,
	RotateCcw,
	X,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

interface OrdersFiltersProps {
	filters: OrderFilters
	loading: boolean
	onFiltersChange: (filters: OrderFilters) => void
	onDownloadCSV: () => void
	onDownloadPDF: () => void
}

const OrdersFilters: React.FC<OrdersFiltersProps> = ({
	filters,
	loading,
	onFiltersChange,
	onDownloadCSV,
	onDownloadPDF,
}) => {
	const [branches, setBranches] = useState<Array<{ name: string }>>([])
	const [branchesLoading, setBranchesLoading] = useState(false)
	const [showFilters, setShowFilters] = useState(false)

	// Fetch branches on mount
	const fetchBranches = useCallback(async () => {
		try {
			setBranchesLoading(true)
			const response = await branchesApi.getBranchNames()
			setBranches(response.branches || [])
		} catch (error) {
			console.error('Failed to fetch branches:', error)
			setBranches([])
		} finally {
			setBranchesLoading(false)
		}
	}, [])

	useEffect(() => {
		fetchBranches()
	}, [fetchBranches])

	// Helper functions
	const getTodayDate = () => {
		return new Date().toISOString().split('T')[0]
	}

	const getYesterdayDate = () => {
		const yesterday = new Date()
		yesterday.setDate(yesterday.getDate() - 1)
		return yesterday.toISOString().split('T')[0]
	}

	const getThisWeekStart = () => {
		const today = new Date()
		const firstDayOfWeek = new Date(
			today.setDate(today.getDate() - today.getDay())
		)
		return firstDayOfWeek.toISOString().split('T')[0]
	}

	// Quick filter presets
	const quickFilters = [
		{ label: 'Today', date: getTodayDate() },
		{ label: 'Yesterday', date: getYesterdayDate() },
		{ label: 'This Week', date: getThisWeekStart() },
	]

	// Count active filters
	const activeFiltersCount = [
		filters.date,
		filters.branch,
		filters.status !== 'all' ? filters.status : null,
	].filter(Boolean).length

	// Clear all filters
	const clearAllFilters = () => {
		onFiltersChange({
			date: '',
			branch: '',
			status: 'all' as OrderStatus | 'all',
			page: 1,
			limit: filters.limit || 10,
		})
	}

	// Apply quick filter
	const applyQuickFilter = (date: string) => {
		onFiltersChange({ ...filters, date, page: 1 })
	}

	return (
		<div className='space-y-4'>
			{/* Quick Actions & Toggle */}
			<div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3'>
				{/* Quick Filter Presets - Mobile: Horizontal scroll, Desktop: Regular */}
				<div className='flex items-center gap-2 overflow-x-auto sm:overflow-visible w-full sm:w-auto'>
					<div className='flex items-center gap-2 flex-shrink-0'>
						{quickFilters.map(preset => (
							<Button
								key={preset.label}
								variant={filters.date === preset.date ? 'default' : 'outline'}
								size='sm'
								onClick={() => applyQuickFilter(preset.date)}
								className='text-xs whitespace-nowrap'
								disabled={loading}
							>
								{preset.label}
							</Button>
						))}
					</div>
				</div>

				{/* Filter Toggle & Clear */}
				<div className='flex items-center gap-2 flex-shrink-0'>
					<Button
						variant='outline'
						size='sm'
						onClick={() => setShowFilters(!showFilters)}
						className='flex items-center gap-2'
					>
						<Filter className='h-4 w-4' />
						<span className='hidden sm:inline'>Advanced Filters</span>
						<span className='sm:hidden'>Filters</span>
						{activeFiltersCount > 0 && (
							<Badge variant='secondary' className='ml-1 text-xs'>
								{activeFiltersCount}
							</Badge>
						)}
					</Button>

					{activeFiltersCount > 0 && (
						<Button
							variant='ghost'
							size='sm'
							onClick={clearAllFilters}
							className='flex items-center gap-1 text-muted-foreground'
							disabled={loading}
						>
							<RotateCcw className='h-3 w-3' />
							<span className='hidden sm:inline text-xs'>Clear</span>
						</Button>
					)}
				</div>
			</div>

			{/* Advanced Filters - Collapsible */}
			{showFilters && (
				<Card className='p-4'>
					<div className='space-y-4'>
						{/* Active Filters Display */}
						{activeFiltersCount > 0 && (
							<div className='flex flex-wrap items-center gap-2'>
								<span className='text-sm text-muted-foreground'>
									Active filters:
								</span>
								{filters.date && (
									<Badge
										variant='secondary'
										className='flex items-center gap-1'
									>
										<Calendar className='h-3 w-3' />
										{filters.date}
										<button
											onClick={() => onFiltersChange({ ...filters, date: '' })}
											className='ml-1 hover:bg-gray-300 rounded-full'
											disabled={loading}
										>
											<X className='h-3 w-3' />
										</button>
									</Badge>
								)}
								{filters.branch && (
									<Badge
										variant='secondary'
										className='flex items-center gap-1'
									>
										{filters.branch}
										<button
											onClick={() =>
												onFiltersChange({ ...filters, branch: '' })
											}
											className='ml-1 hover:bg-gray-300 rounded-full'
											disabled={loading}
										>
											<X className='h-3 w-3' />
										</button>
									</Badge>
								)}
								{filters.status && filters.status !== 'all' && (
									<Badge
										variant='secondary'
										className='flex items-center gap-1'
									>
										{filters.status}
										<button
											onClick={() =>
												onFiltersChange({
													...filters,
													status: 'all' as OrderStatus | 'all',
												})
											}
											className='ml-1 hover:bg-gray-300 rounded-full'
											disabled={loading}
										>
											<X className='h-3 w-3' />
										</button>
									</Badge>
								)}
							</div>
						)}

						{/* Filter Controls */}
						<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
							{/* Date Filter with proper date input */}
							<div className='space-y-2'>
								<label className='text-sm font-medium text-gray-700'>
									Date
								</label>
								<div className='relative'>
									<Input
										type='date'
										value={filters.date || ''}
										onChange={e =>
											onFiltersChange({
												...filters,
												date: e.target.value,
												page: 1,
											})
										}
										className='text-sm'
										disabled={loading}
									/>
									<Calendar className='absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none' />
								</div>
							</div>

							{/* Branch Filter with dropdown */}
							<div className='space-y-2'>
								<label className='text-sm font-medium text-gray-700'>
									Branch
								</label>
								<Select
									value={filters.branch || 'all'}
									onValueChange={value =>
										onFiltersChange({
											...filters,
											branch: value === 'all' ? '' : value,
											page: 1,
										})
									}
									disabled={loading || branchesLoading}
								>
									<SelectTrigger className='text-sm'>
										<SelectValue placeholder='Select branch' />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value='all'>All Branches</SelectItem>
										{branches.map(branch => (
											<SelectItem key={branch.name} value={branch.name}>
												{branch.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							{/* Status Filter */}
							<div className='space-y-2'>
								<label className='text-sm font-medium text-gray-700'>
									Status
								</label>
								<Select
									value={filters.status || 'all'}
									onValueChange={value =>
										onFiltersChange({
											...filters,
											status: value as OrderStatus | 'all',
											page: 1,
										})
									}
									disabled={loading}
								>
									<SelectTrigger className='text-sm'>
										<SelectValue placeholder='Select status' />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value='all'>All Status</SelectItem>
										<SelectItem value='pending'>Pending</SelectItem>
										<SelectItem value='approved'>Approved</SelectItem>
										<SelectItem value='rejected'>Rejected</SelectItem>
										<SelectItem value='completed'>Completed</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>
					</div>
				</Card>
			)}

			{/* Download Buttons */}
			<div className='flex flex-col sm:flex-row gap-2 sm:gap-3'>
				<Button
					onClick={onDownloadCSV}
					disabled={loading}
					className='flex items-center justify-center gap-2 text-sm'
					size='sm'
				>
					<Download className='h-4 w-4' />
					<span className='hidden sm:inline'>Download CSV</span>
					<span className='sm:hidden'>CSV</span>
				</Button>
				<Button
					onClick={onDownloadPDF}
					disabled={loading || !filters.date || filters.date.trim() === ''}
					className='flex items-center justify-center gap-2 text-sm'
					variant='outline'
					size='sm'
					title={
						!filters.date || filters.date.trim() === ''
							? 'Please select a date to download PDF'
							: 'Download PDF for selected date'
					}
				>
					<FileText className='h-4 w-4' />
					<span className='hidden sm:inline'>Download PDF</span>
					<span className='sm:hidden'>PDF</span>
				</Button>
			</div>
		</div>
	)
}

export default OrdersFilters
