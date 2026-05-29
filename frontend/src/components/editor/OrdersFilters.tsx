'use client'

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
import { useTranslations } from 'next-intl'
import {
	editorHorizontalScroll,
	editorSnapItem,
	editorTouchCompact,
} from './editorUi'

interface OrdersFiltersProps {
	filters: OrderFilters
	loading: boolean
	onFiltersChange: (filters: OrderFilters) => void
	onDownloadCSV: () => void
	onDownloadPDF: () => void
	hideStatusFilter?: boolean
}

const OrdersFilters: React.FC<OrdersFiltersProps> = ({
	filters,
	loading,
	onFiltersChange,
	onDownloadCSV,
	onDownloadPDF,
	hideStatusFilter = false,
}) => {
	const t = useTranslations('editor.filters')
	const ts = useTranslations('editor.status')
	const to = useTranslations('editor.orders')
	const tc = useTranslations('common')
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
		{ labelKey: 'today' as const, date: getTodayDate() },
		{ labelKey: 'yesterday' as const, date: getYesterdayDate() },
		{ labelKey: 'thisWeek' as const, date: getThisWeekStart() },
	]

	// Count active filters
	const activeFiltersCount = [
		filters.date,
		filters.branch,
		!hideStatusFilter && filters.status !== 'all' ? filters.status : null,
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
		<div className='space-y-2 sm:space-y-4'>
			{/* Quick date presets */}
			<div className={editorHorizontalScroll}>
				{quickFilters.map(preset => (
					<Button
						key={preset.labelKey}
						variant={filters.date === preset.date ? 'default' : 'outline'}
						onClick={() => applyQuickFilter(preset.date)}
						className={`${editorSnapItem} ${editorTouchCompact} px-3 whitespace-nowrap`}
						disabled={loading}
					>
						{t(preset.labelKey)}
					</Button>
				))}
			</div>

			{/* Filters + exports — one compact row on mobile */}
			<div className='grid grid-cols-3 sm:flex sm:flex-wrap sm:items-center gap-1.5 sm:gap-2'>
				<Button
					variant='outline'
					onClick={() => setShowFilters(!showFilters)}
					className={`${editorTouchCompact} flex items-center justify-center gap-1`}
				>
					<Filter className='h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0' />
					<span className='hidden sm:inline'>{t('advancedFilters')}</span>
					<span className='sm:hidden'>{tc('filter')}</span>
					{activeFiltersCount > 0 && (
						<Badge variant='secondary' className='ml-0.5 h-4 min-w-4 px-1 text-[10px]'>
							{activeFiltersCount}
						</Badge>
					)}
				</Button>

				<Button
					onClick={onDownloadCSV}
					disabled={loading}
					variant='outline'
					className={`${editorTouchCompact} flex items-center justify-center gap-1`}
				>
					<Download className='h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0' />
					<span className='hidden sm:inline'>{t('downloadCsv')}</span>
					<span className='sm:hidden'>{t('csv')}</span>
				</Button>

				<Button
					onClick={onDownloadPDF}
					disabled={loading || !filters.date || filters.date.trim() === ''}
					className={`${editorTouchCompact} flex items-center justify-center gap-1 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50`}
					title={
						!filters.date || filters.date.trim() === ''
							? t('pdfNeedsDate')
							: t('pdfForDate')
					}
				>
					<FileText className='h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0' />
					<span className='hidden sm:inline'>{t('downloadPdf')}</span>
					<span className='sm:hidden'>{t('pdf')}</span>
				</Button>

				{activeFiltersCount > 0 && (
					<Button
						variant='ghost'
						onClick={clearAllFilters}
						className={`${editorTouchCompact} hidden sm:flex px-3 text-muted-foreground`}
						disabled={loading}
					>
						<RotateCcw className='h-4 w-4 mr-1' />
						{tc('clear')}
					</Button>
				)}
			</div>

			{/* Advanced Filters - Collapsible */}
			{showFilters && (
				<Card className='p-4'>
					<div className='space-y-4'>
						{/* Active Filters Display */}
						{activeFiltersCount > 0 && (
							<div className='flex flex-wrap items-center gap-2'>
								<span className='text-sm text-muted-foreground'>
									{t('activeFilters')}
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
								{!hideStatusFilter &&
									filters.status &&
									filters.status !== 'all' && (
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
						<div
							className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${
								hideStatusFilter ? 'lg:grid-cols-2' : 'lg:grid-cols-3'
							}`}
						>
							{/* Date Filter with proper date input */}
							<div className='space-y-2'>
								<label className='text-sm font-medium text-gray-700'>
									{t('date')}
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
										className='h-12 sm:h-10 text-base'
										disabled={loading}
									/>
									<Calendar className='absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none' />
								</div>
							</div>

							{/* Branch Filter with dropdown */}
							<div className='space-y-2'>
								<label className='text-sm font-medium text-gray-700'>
									{t('branch')}
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
									<SelectTrigger className='h-12 sm:h-10 text-base'>
										<SelectValue placeholder={t('selectBranch')} />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value='all'>{t('allBranches')}</SelectItem>
										{branches.map(branch => (
											<SelectItem key={branch.name} value={branch.name}>
												{branch.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							{!hideStatusFilter && (
								<div className='space-y-2'>
									<label className='text-sm font-medium text-gray-700'>
										{to('status')}
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
											<SelectValue placeholder={to('selectStatus')} />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value='all'>{t('allStatus')}</SelectItem>
											<SelectItem value='pending'>{ts('pending')}</SelectItem>
											<SelectItem value='approved'>{ts('approved')}</SelectItem>
											<SelectItem value='rejected'>{ts('rejected')}</SelectItem>
											<SelectItem value='completed'>{ts('completed')}</SelectItem>
										</SelectContent>
									</Select>
								</div>
							)}
						</div>
					</div>
				</Card>
			)}

		</div>
	)
}

export default OrdersFilters
