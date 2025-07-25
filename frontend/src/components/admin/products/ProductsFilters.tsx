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
import { ProductCategory } from '@/types'
import { Search } from 'lucide-react'

const CATEGORIES = [
	{ value: 'food' as ProductCategory, label: 'Food' },
	{ value: 'beverages' as ProductCategory, label: 'Beverages' },
	{ value: 'cleaning' as ProductCategory, label: 'Cleaning' },
	{ value: 'equipment' as ProductCategory, label: 'Equipment' },
	{ value: 'packaging' as ProductCategory, label: 'Packaging' },
	{ value: 'other' as ProductCategory, label: 'Other' },
]

interface ProductsFiltersProps {
	searchTerm: string
	categoryFilter: ProductCategory | 'all'
	statusFilter: 'true' | 'false' | 'all'
	onSearchChange: (search: string) => void
	onCategoryChange: (category: ProductCategory | 'all') => void
	onStatusChange: (status: 'true' | 'false' | 'all') => void
}

const ProductsFilters: React.FC<ProductsFiltersProps> = ({
	searchTerm,
	categoryFilter,
	statusFilter,
	onSearchChange,
	onCategoryChange,
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
							Search Products
						</Label>
						<div className='relative'>
							<Search className='absolute left-2 top-2 h-4 w-4 text-muted-foreground' />
							<Input
								id='search'
								placeholder='Search by name, description, or supplier'
								value={searchTerm}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
									onSearchChange(e.target.value)
								}
								className='pl-8 h-8 text-sm'
							/>
						</div>
					</div>
					<div className='space-y-1'>
						<Label htmlFor='category-filter' className='text-xs font-medium'>
							Category
						</Label>
						<Select
							value={categoryFilter}
							onValueChange={(value: ProductCategory | 'all') =>
								onCategoryChange(value)
							}
						>
							<SelectTrigger className='h-8 text-sm'>
								<SelectValue placeholder='All categories' />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='all'>All Categories</SelectItem>
								{CATEGORIES.map(category => (
									<SelectItem key={category.value} value={category.value}>
										{category.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<div className='space-y-1'>
						<Label htmlFor='status-filter' className='text-xs font-medium'>
							Status
						</Label>
						<Select
							value={statusFilter}
							onValueChange={(value: 'true' | 'false' | 'all') =>
								onStatusChange(value)
							}
						>
							<SelectTrigger className='h-8 text-sm'>
								<SelectValue placeholder='All statuses' />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='all'>All Products</SelectItem>
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

export default ProductsFilters
