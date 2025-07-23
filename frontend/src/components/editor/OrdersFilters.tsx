import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { OrderFilters, OrderStatus } from '@/types'
import { Download, FileText } from 'lucide-react'

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
	return (
		<div className='space-y-4'>
			{/* Filters Row */}
			<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3'>
				<Input
					placeholder='Filter by date (YYYY-MM-DD)'
					value={filters.date || ''}
					onChange={e => onFiltersChange({ ...filters, date: e.target.value })}
					className='text-sm'
				/>
				<Input
					placeholder='Filter by branch'
					value={filters.branch || ''}
					onChange={e =>
						onFiltersChange({ ...filters, branch: e.target.value })
					}
					className='text-sm'
				/>
				<Select
					value={filters.status || 'all'}
					onValueChange={value =>
						onFiltersChange({
							...filters,
							status: value as OrderStatus | 'all',
						})
					}
				>
					<SelectTrigger className='text-sm'>
						<SelectValue placeholder='Filter by status' />
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
					disabled={loading}
					className='flex items-center justify-center gap-2 text-sm'
					variant='outline'
					size='sm'
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
