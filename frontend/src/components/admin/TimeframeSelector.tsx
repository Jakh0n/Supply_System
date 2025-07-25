'use client'

import { Button } from '@/components/ui/button'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { RefreshCw } from 'lucide-react'

interface TimeframeSelectorProps {
	selectedMonth: number
	selectedYear: number
	onMonthChange: (month: number) => void
	onYearChange: (year: number) => void
	onRefresh: () => void
	loading: boolean
}

const TimeframeSelector: React.FC<TimeframeSelectorProps> = ({
	selectedMonth,
	selectedYear,
	onMonthChange,
	onYearChange,
	onRefresh,
	loading,
}) => {
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

	return (
		<div className='flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center justify-between p-3 sm:p-4 bg-white rounded-lg border shadow-sm'>
			<div className='flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center w-full sm:w-auto'>
				<h2 className='text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 truncate'>
					Admin Dashboard
				</h2>
				<div className='flex gap-2 items-center w-full sm:w-auto'>
					<Select
						value={selectedMonth.toString()}
						onValueChange={value => onMonthChange(parseInt(value))}
					>
						<SelectTrigger className='w-full sm:w-32 h-9'>
							<SelectValue placeholder='Month' />
						</SelectTrigger>
						<SelectContent>
							{monthOptions.map(month => (
								<SelectItem key={month.value} value={month.value.toString()}>
									<span className='block sm:hidden'>
										{month.label.slice(0, 3)}
									</span>
									<span className='hidden sm:block'>{month.label}</span>
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<Select
						value={selectedYear.toString()}
						onValueChange={value => onYearChange(parseInt(value))}
					>
						<SelectTrigger className='w-20 sm:w-24 h-9'>
							<SelectValue placeholder='Year' />
						</SelectTrigger>
						<SelectContent>
							{yearOptions.map(year => (
								<SelectItem key={year.value} value={year.value.toString()}>
									{year.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</div>
			<Button
				onClick={onRefresh}
				disabled={loading}
				variant='outline'
				size='sm'
				className='flex items-center gap-2 w-full sm:w-auto flex-shrink-0'
			>
				<RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
				<span className='sm:inline'>Refresh</span>
			</Button>
		</div>
	)
}

export default TimeframeSelector
