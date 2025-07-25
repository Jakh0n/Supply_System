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
import { Search } from 'lucide-react'

interface UsersFiltersProps {
	searchTerm: string
	positionFilter: 'admin' | 'worker' | 'all'
	statusFilter: 'true' | 'false' | 'all'
	onSearchChange: (value: string) => void
	onPositionChange: (value: 'admin' | 'worker' | 'all') => void
	onStatusChange: (value: 'true' | 'false' | 'all') => void
}

const UsersFilters: React.FC<UsersFiltersProps> = ({
	searchTerm,
	positionFilter,
	statusFilter,
	onSearchChange,
	onPositionChange,
	onStatusChange,
}) => {
	return (
		<Card>
			<CardHeader className='pb-2 pt-3'>
				<CardTitle className='text-sm font-medium'>Filters</CardTitle>
			</CardHeader>
			<CardContent className='pt-0 pb-3'>
				<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3'>
					<div className='space-y-1'>
						<Label htmlFor='search' className='text-xs font-medium'>
							Search Users
						</Label>
						<div className='relative'>
							<Search className='absolute left-2 top-2 h-4 w-4 text-muted-foreground' />
							<Input
								id='search'
								placeholder='Search by username or branch'
								value={searchTerm}
								onChange={e => onSearchChange(e.target.value)}
								className='pl-8 h-8 text-sm'
							/>
						</div>
					</div>
					<div className='space-y-1'>
						<Label htmlFor='position-filter' className='text-xs font-medium'>
							Position
						</Label>
						<Select value={positionFilter} onValueChange={onPositionChange}>
							<SelectTrigger className='h-8 text-sm'>
								<SelectValue placeholder='All positions' />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='all'>All Positions</SelectItem>
								<SelectItem value='admin'>Admin</SelectItem>
								<SelectItem value='editor'>Editor</SelectItem>
								<SelectItem value='worker'>Worker</SelectItem>
							</SelectContent>
						</Select>
					</div>
					<div className='space-y-1'>
						<Label htmlFor='status-filter' className='text-xs font-medium'>
							Status
						</Label>
						<Select value={statusFilter} onValueChange={onStatusChange}>
							<SelectTrigger className='h-8 text-sm'>
								<SelectValue placeholder='All statuses' />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='all'>All Status</SelectItem>
								<SelectItem value='true'>Active Only</SelectItem>
								<SelectItem value='false'>Inactive Only</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>
			</CardContent>
		</Card>
	)
}

export default UsersFilters
