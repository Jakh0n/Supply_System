import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { OrderStatus } from '@/types'

interface OrdersFiltersProps {
	selectedDate: string
	branchFilter: string
	statusFilter: OrderStatus | 'all'
	branches: string[]
	onDateChange: (date: string) => void
	onBranchChange: (branch: string) => void
	onStatusChange: (status: OrderStatus | 'all') => void
	onClearFilters: () => void
}

const OrdersFilters: React.FC<OrdersFiltersProps> = ({
	selectedDate,
	branchFilter,
	statusFilter,
	branches,
	onDateChange,
	onBranchChange,
	onStatusChange,
	onClearFilters,
}) => {
	return (
		<Card>
			<CardHeader className='pb-3'>
				<CardTitle className='text-base sm:text-lg'>Filters</CardTitle>
			</CardHeader>
			<CardContent>
				<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
					<div className='space-y-2'>
						<Label htmlFor='date-filter' className='text-sm font-medium'>
							Date
						</Label>
						<Input
							id='date-filter'
							type='date'
							value={selectedDate}
							onChange={e => onDateChange(e.target.value)}
							className='w-full'
						/>
					</div>

					<div className='space-y-2'>
						<Label htmlFor='branch-filter' className='text-sm font-medium'>
							Branch
						</Label>
						<Select value={branchFilter} onValueChange={onBranchChange}>
							<SelectTrigger className='w-full'>
								<SelectValue placeholder='All branches' />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='all'>All Branches</SelectItem>
								{branches.map(branch => (
									<SelectItem key={branch} value={branch}>
										{branch}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className='space-y-2'>
						<Label htmlFor='status-filter' className='text-sm font-medium'>
							Status
						</Label>
						<Select value={statusFilter} onValueChange={onStatusChange}>
							<SelectTrigger className='w-full'>
								<SelectValue placeholder='All statuses' />
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

					<div className='flex items-end'>
						<Button
							variant='outline'
							onClick={onClearFilters}
							className='w-full'
							size='sm'
						>
							Clear Filters
						</Button>
					</div>
				</div>
			</CardContent>
		</Card>
	)
}

export default OrdersFilters
