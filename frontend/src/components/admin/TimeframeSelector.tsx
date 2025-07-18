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
		<div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between p-4 sm:p-6 bg-white rounded-lg border'>
			<div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center'>
				<h2 className='text-xl sm:text-2xl font-bold text-gray-900'>
					Admin Dashboard
				</h2>
				<div className='flex gap-2 items-center'>
					<Select
						value={selectedMonth.toString()}
						onValueChange={value => onMonthChange(parseInt(value))}
					>
						<SelectTrigger className='w-32'>
							<SelectValue placeholder='Month' />
						</SelectTrigger>
						<SelectContent>
							{monthOptions.map(month => (
								<SelectItem key={month.value} value={month.value.toString()}>
									{month.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<Select
						value={selectedYear.toString()}
						onValueChange={value => onYearChange(parseInt(value))}
					>
						<SelectTrigger className='w-24'>
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
				className='flex items-center gap-2'
			>
				<RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
				Refresh
			</Button>
		</div>
	)
}

export default TimeframeSelector
