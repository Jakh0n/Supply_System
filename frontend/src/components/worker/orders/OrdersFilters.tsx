import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
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
import { Plus } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

interface OrdersFiltersProps {
	selectedDate: string
	statusFilter: OrderStatus | 'all'
	hasActiveFilters: boolean
	onDateChange: (date: string) => void
	onStatusChange: (status: OrderStatus | 'all') => void
	onClearFilters: () => void
}

// Helper function to format date
const formatDate = (dateString: string): string => {
	return new Date(dateString).toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
	})
}

const OrdersFilters: React.FC<OrdersFiltersProps> = ({
	selectedDate,
	statusFilter,
	hasActiveFilters,
	onDateChange,
	onStatusChange,
	onClearFilters,
}) => {
	return (
		<>
			{/* Desktop Filters */}
			<Card className='hidden sm:block'>
				<CardHeader className='p-4 sm:p-6'>
					<CardTitle className='text-base sm:text-lg'>Filter Orders</CardTitle>
					<CardDescription className='text-sm'>
						Filter your orders by date and status
					</CardDescription>
				</CardHeader>
				<CardContent className='p-4 sm:p-6 pt-0 space-y-4'>
					<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
						<div className='space-y-2'>
							<Label htmlFor='date-filter' className='text-sm font-medium'>
								Filter by Date
							</Label>
							<Input
								id='date-filter'
								type='date'
								value={selectedDate}
								onChange={e => onDateChange(e.target.value)}
								className='h-10'
							/>
						</div>
						<div className='space-y-2'>
							<Label htmlFor='status-filter' className='text-sm font-medium'>
								Filter by Status
							</Label>
							<Select value={statusFilter} onValueChange={onStatusChange}>
								<SelectTrigger className='h-10'>
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
						<div className='flex flex-col justify-end'>
							<Button
								variant='outline'
								onClick={onClearFilters}
								disabled={!hasActiveFilters}
								className='h-10 w-full sm:w-auto'
							>
								Clear Filters
							</Button>
						</div>
					</div>

					{/* Active Filters Display */}
					{hasActiveFilters && (
						<div className='flex flex-wrap gap-2 pt-2 border-t border-gray-200'>
							<p className='text-xs text-gray-500 w-full sm:w-auto'>
								Active filters:
							</p>
							{selectedDate && (
								<span className='inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800'>
									Date: {formatDate(selectedDate)}
								</span>
							)}
							{statusFilter !== 'all' && (
								<span className='inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800'>
									Status:{' '}
									{statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
								</span>
							)}
						</div>
					)}
				</CardContent>
			</Card>

			{/* Mobile Compact Filters */}
			<div className='sm:hidden'>
				<div className='flex gap-2'>
					<div className='flex-1'>
						<Select value={statusFilter} onValueChange={onStatusChange}>
							<SelectTrigger className='h-9 text-xs'>
								<SelectValue placeholder='All Status' />
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
					<div className='flex-1'>
						<Input
							type='date'
							value={selectedDate}
							onChange={e => onDateChange(e.target.value)}
							className='h-9 text-xs'
							placeholder='Filter by date'
						/>
					</div>
					{hasActiveFilters && (
						<Button
							variant='outline'
							size='sm'
							onClick={onClearFilters}
							className='h-9 px-2 text-xs'
						>
							Clear
						</Button>
					)}
				</div>

				{/* Mobile Create Order Button */}
				<div className='mt-3'>
					<Link href='/worker/new-order' className='block'>
						<Button className='w-full h-10 bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm hover:shadow-md transition-all duration-200'>
							<Plus className='h-4 w-4 mr-2' />
							Create New Order
						</Button>
					</Link>
				</div>

				{/* Mobile Active Filters Display */}
				{hasActiveFilters && (
					<div className='flex flex-wrap gap-1 mt-2'>
						{selectedDate && (
							<span className='inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-blue-100 text-blue-800'>
								{formatDate(selectedDate)}
							</span>
						)}
						{statusFilter !== 'all' && (
							<span className='inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-green-100 text-green-800'>
								{statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
							</span>
						)}
					</div>
				)}
			</div>
		</>
	)
}

export default OrdersFilters
