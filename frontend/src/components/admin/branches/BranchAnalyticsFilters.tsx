import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { BranchAnalytics, BranchFilter } from '@/types'
import { Filter, RefreshCw, Search } from 'lucide-react'

interface BranchAnalyticsFiltersProps {
	searchTerm: string
	selectedMonth: number
	selectedYear: number
	filters: BranchFilter
	branchAnalytics: BranchAnalytics[]
	monthOptions: { value: number; label: string }[]
	yearOptions: { value: number; label: string }[]
	onSearchChange: (value: string) => void
	onMonthChange: (value: number) => void
	onYearChange: (value: number) => void
	onFiltersChange: (filters: BranchFilter) => void
	onResetToCurrentMonth: () => void
}

const BranchAnalyticsFilters: React.FC<BranchAnalyticsFiltersProps> = ({
	searchTerm,
	selectedMonth,
	selectedYear,
	filters,
	branchAnalytics,
	monthOptions,
	yearOptions,
	onSearchChange,
	onMonthChange,
	onYearChange,
	onFiltersChange,
	onResetToCurrentMonth,
}) => {
	return (
		<Card>
			<CardHeader className='pb-3'>
				<div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
					<CardTitle className='flex items-center gap-2 text-base sm:text-lg'>
						<Filter className='h-4 w-4 sm:h-5 sm:w-5' />
						Filters & Search
					</CardTitle>
					<Button
						variant='outline'
						size='sm'
						onClick={onResetToCurrentMonth}
						className='flex items-center gap-2 w-full sm:w-auto'
					>
						<RefreshCw className='h-4 w-4' />
						Reset to Current Month
					</Button>
				</div>
			</CardHeader>
			<CardContent className='pt-0'>
				<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4'>
					<div className='space-y-1'>
						<label className='text-xs sm:text-sm font-medium'>
							Search Branch
						</label>
						<div className='relative'>
							<Search className='absolute left-3 top-2.5 h-4 w-4 text-gray-400' />
							<Input
								placeholder='Search branches...'
								value={searchTerm}
								onChange={e => onSearchChange(e.target.value)}
								className='pl-10 h-8 sm:h-9 text-sm'
							/>
						</div>
					</div>

					<div className='space-y-1'>
						<label className='text-xs sm:text-sm font-medium'>Branch</label>
						<Select
							value={filters.branch}
							onValueChange={(value: string) =>
								onFiltersChange({ ...filters, branch: value })
							}
						>
							<SelectTrigger className='h-8 sm:h-9 text-sm'>
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

					<div className='space-y-1'>
						<label className='text-xs sm:text-sm font-medium'>Month</label>
						<Select
							value={selectedMonth.toString()}
							onValueChange={(value: string) => onMonthChange(Number(value))}
						>
							<SelectTrigger className='h-8 sm:h-9 text-sm'>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{monthOptions.map(option => (
									<SelectItem
										key={option.value}
										value={option.value.toString()}
									>
										{option.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className='space-y-1'>
						<label className='text-xs sm:text-sm font-medium'>Year</label>
						<Select
							value={selectedYear.toString()}
							onValueChange={(value: string) => onYearChange(Number(value))}
						>
							<SelectTrigger className='h-8 sm:h-9 text-sm'>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{yearOptions.map(option => (
									<SelectItem
										key={option.value}
										value={option.value.toString()}
									>
										{option.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className='space-y-1'>
						<label className='text-xs sm:text-sm font-medium'>Category</label>
						<Select
							value={filters.category}
							onValueChange={(value: string) =>
								onFiltersChange({ ...filters, category: value })
							}
						>
							<SelectTrigger className='h-8 sm:h-9 text-sm'>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='all'>All Categories</SelectItem>
								<SelectItem value='frozen-products'>Frozen Products</SelectItem>
								<SelectItem value='main-products'>Main Products</SelectItem>
								<SelectItem value='desserts'>Desserts</SelectItem>
								<SelectItem value='drinks'>Drinks</SelectItem>
								<SelectItem value='packaging-materials'>
									Packaging Materials
								</SelectItem>
								<SelectItem value='cleaning-materials'>
									Cleaning Materials
								</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>
			</CardContent>
		</Card>
	)
}

export default BranchAnalyticsFilters
