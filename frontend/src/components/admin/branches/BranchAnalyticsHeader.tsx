import { Button } from '@/components/ui/button'
import { Download, RefreshCw } from 'lucide-react'

interface BranchAnalyticsHeaderProps {
	selectedMonth: number
	selectedYear: number
	monthOptions: { value: number; label: string }[]
	onRefresh: () => void
	onExportReport: () => void
}

const BranchAnalyticsHeader: React.FC<BranchAnalyticsHeaderProps> = ({
	selectedMonth,
	selectedYear,
	monthOptions,
	onRefresh,
	onExportReport,
}) => {
	return (
		<div className='flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4'>
			<div className='flex-1'>
				<h1 className='text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900'>
					Branch Performance Analysis
				</h1>
				<p className='text-sm sm:text-base text-gray-600 mt-1'>
					Analytics for{' '}
					{monthOptions.find(m => m.value === selectedMonth)?.label}{' '}
					{selectedYear} - Detailed consumption tracking and performance metrics
				</p>
			</div>
			<div className='flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto'>
				<Button
					onClick={onRefresh}
					variant='outline'
					size='sm'
					className='w-full sm:w-auto'
				>
					<RefreshCw className='h-4 w-4 mr-2' />
					Refresh
				</Button>
				<Button
					variant='outline'
					size='sm'
					onClick={onExportReport}
					className='w-full sm:w-auto'
				>
					<Download className='h-4 w-4 mr-2' />
					Export Report
				</Button>
			</div>
		</div>
	)
}

export default BranchAnalyticsHeader
