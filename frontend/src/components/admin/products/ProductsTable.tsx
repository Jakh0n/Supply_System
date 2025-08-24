import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ProductThumbnail } from '@/components/ui/ProductImage'
import { getPrimaryImage } from '@/lib/imageUtils'
import { Product, ProductCategory, ProductUnit } from '@/types'
import {
	Edit,
	Eye,
	EyeOff,
	MoreHorizontal,
	Package,
	Trash2,
} from 'lucide-react'

const CATEGORIES = [
	{ value: 'frozen-products' as ProductCategory, label: 'Frozen Products' },
	{ value: 'main-products' as ProductCategory, label: 'Main Products' },
	{ value: 'desserts-drinks' as ProductCategory, label: 'Desserts and Drinks' },
	{
		value: 'packaging-materials' as ProductCategory,
		label: 'Packaging Materials',
	},
	{
		value: 'cleaning-materials' as ProductCategory,
		label: 'Cleaning Materials',
	},
]

const UNITS = [
	{ value: 'kg' as ProductUnit, label: 'Kilogram (kg)' },
	{ value: 'g' as ProductUnit, label: 'Gram (g)' },
	{ value: 'l' as ProductUnit, label: 'Liter (l)' },
	{ value: 'ml' as ProductUnit, label: 'Milliliter (ml)' },
	{ value: 'pieces' as ProductUnit, label: 'Pieces' },
	{ value: 'boxes' as ProductUnit, label: 'Boxes' },
	{ value: 'bottles' as ProductUnit, label: 'Bottles' },
	{ value: 'cans' as ProductUnit, label: 'Cans' },
	{ value: 'packets' as ProductUnit, label: 'Packets' },
]

// Helper function to format price in Korean Won
const formatKRW = (price: number): string => {
	return new Intl.NumberFormat('ko-KR', {
		style: 'currency',
		currency: 'KRW',
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(price)
}

interface ProductsTableProps {
	products: Product[]
	searchTerm: string
	categoryFilter: ProductCategory | 'all'
	statusFilter: 'true' | 'false' | 'all'
	onEditProduct: (product: Product) => void
	onToggleStatus: (product: Product) => void
	onDeleteProduct: (product: Product) => void
}

const ProductsTable: React.FC<ProductsTableProps> = ({
	products,
	searchTerm,
	categoryFilter,
	statusFilter,
	onEditProduct,
	onToggleStatus,
	onDeleteProduct,
}) => {
	const getCategoryLabel = (category: string) => {
		return CATEGORIES.find(c => c.value === category)?.label || category
	}

	const getUnitLabel = (unit: string) => {
		return UNITS.find(u => u.value === unit)?.label || unit
	}

	// getPrimaryImage function is now imported from imageUtils

	if (products.length === 0) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className='text-base sm:text-lg'>
						Products ({products.length})
					</CardTitle>
					<CardDescription>
						Manage your product catalog and inventory
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className='text-center py-8'>
						<Package className='h-12 w-12 text-gray-400 mx-auto mb-4' />
						<p className='text-gray-500'>No products found</p>
						<p className='text-sm text-gray-400 mt-1'>
							{searchTerm || categoryFilter !== 'all' || statusFilter !== 'all'
								? 'Try adjusting your filters'
								: 'Add your first product to get started'}
						</p>
					</div>
				</CardContent>
			</Card>
		)
	}

	return (
		<>
			{/* Desktop Table View */}
			<Card className='hidden lg:block'>
				<CardHeader>
					<CardTitle className='text-base sm:text-lg'>
						Products ({products.length})
					</CardTitle>
					<CardDescription>
						Manage your product catalog and inventory
					</CardDescription>
				</CardHeader>
				<CardContent className='p-0'>
					<div className='overflow-x-auto'>
						<div className='max-h-[70vh] overflow-y-auto scroll-smooth border-t'>
							<table className='w-full'>
								<thead className='bg-gray-50 sticky top-0 z-10 shadow-sm'>
									<tr className='border-b border-gray-200'>
										<th className='text-left py-3 px-4 font-medium bg-gray-50 text-sm whitespace-nowrap'>
											Product
										</th>
										<th className='text-left py-3 px-4 font-medium bg-gray-50 text-sm whitespace-nowrap'>
											Category
										</th>
										<th className='text-left py-3 px-4 font-medium bg-gray-50 text-sm whitespace-nowrap'>
											Unit
										</th>
										<th className='text-left py-3 px-4 font-medium bg-gray-50 text-sm whitespace-nowrap'>
											Supplier
										</th>
										<th className='text-left py-3 px-4 font-medium bg-gray-50 text-sm whitespace-nowrap'>
											Price
										</th>
										<th className='text-left py-3 px-4 font-medium bg-gray-50 text-sm whitespace-nowrap'>
											Status
										</th>
										<th className='text-left py-3 px-4 font-medium bg-gray-50 text-sm whitespace-nowrap'>
											Created
										</th>
										<th className='text-right py-3 px-4 font-medium bg-gray-50 text-sm whitespace-nowrap'>
											Actions
										</th>
									</tr>
								</thead>
								<tbody className='bg-white'>
									{products.map(product => (
										<tr
											key={product._id}
											className='border-b border-gray-100 hover:bg-gray-50 transition-colors'
										>
											<td className='py-3 px-4'>
												<div className='flex items-center gap-3'>
													<div className='w-10 h-10 flex-shrink-0'>
														<ProductThumbnail
															src={getPrimaryImage(product)}
															alt={product.name}
															category={product.category}
															size='sm'
															priority={false}
														/>
													</div>
													<div>
														<p className='font-medium text-sm'>
															{product.name}
														</p>
														{product.description && (
															<p className='text-xs text-gray-500 truncate max-w-xs'>
																{product.description}
															</p>
														)}
														{product.images && product.images.length > 0 && (
															<p className='text-xs text-blue-600'>
																{product.images.length} image
																{product.images.length > 1 ? 's' : ''}
															</p>
														)}
													</div>
												</div>
											</td>
											<td className='py-3 px-4'>
												<span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800'>
													{getCategoryLabel(product.category)}
												</span>
											</td>
											<td className='py-3 px-4 text-sm text-gray-600'>
												{getUnitLabel(product.unit)}
											</td>
											<td className='py-3 px-4 text-sm text-gray-600'>
												{product.supplier || '-'}
											</td>
											<td className='py-3 px-4 text-sm text-gray-600'>
												{product.price
													? formatKRW(product.price)
													: formatKRW(0)}
											</td>
											<td className='py-3 px-4'>
												<span
													className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
														product.isActive
															? 'bg-green-100 text-green-800'
															: 'bg-red-100 text-red-800'
													}`}
												>
													{product.isActive ? 'Active' : 'Inactive'}
												</span>
											</td>
											<td className='py-3 px-4 text-sm text-gray-600'>
												{new Date(product.createdAt).toLocaleDateString()}
											</td>
											<td className='py-3 px-4 text-right'>
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<Button variant='ghost' size='sm'>
															<MoreHorizontal className='h-4 w-4' />
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent align='end'>
														<DropdownMenuLabel>Actions</DropdownMenuLabel>
														<DropdownMenuItem
															onClick={() => onEditProduct(product)}
														>
															<Edit className='h-4 w-4 mr-2' />
															Edit
														</DropdownMenuItem>
														<DropdownMenuItem
															onClick={() => onToggleStatus(product)}
														>
															{product.isActive ? (
																<>
																	<EyeOff className='h-4 w-4 mr-2' />
																	Deactivate
																</>
															) : (
																<>
																	<Eye className='h-4 w-4 mr-2' />
																	Activate
																</>
															)}
														</DropdownMenuItem>
														<DropdownMenuSeparator />
														<DropdownMenuItem
															onClick={() => onDeleteProduct(product)}
															className='text-red-600'
														>
															<Trash2 className='h-4 w-4 mr-2' />
															Delete
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Mobile Card View */}
			<div className='lg:hidden'>
				<div className='flex items-center justify-between mb-3'>
					<h2 className='text-lg font-semibold text-gray-900'>
						Products ({products.length})
					</h2>
				</div>

				<div className='max-h-[70vh] overflow-y-auto scroll-smooth space-y-2 pr-1'>
					{products.map(product => (
						<Card
							key={product._id}
							className='hover:shadow-md transition-shadow border border-gray-200'
						>
							<CardContent className='p-3'>
								<div className='flex items-start gap-3 mb-3'>
									<div className='w-10 h-10 flex-shrink-0'>
										<ProductThumbnail
											src={getPrimaryImage(product)}
											alt={product.name}
											size='sm'
											priority={false}
										/>
									</div>
									<div className='flex-1 min-w-0'>
										<div className='font-medium text-sm text-gray-900 mb-1'>
											{product.name}
										</div>
										{product.description && (
											<div className='text-xs text-gray-500 line-clamp-1 mb-1'>
												{product.description}
											</div>
										)}
										{product.images && product.images.length > 0 && (
											<div className='text-xs text-blue-600'>
												{product.images.length} image
												{product.images.length > 1 ? 's' : ''}
											</div>
										)}
									</div>
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button variant='ghost' size='sm' className='h-7 w-7 p-0'>
												<MoreHorizontal className='h-3 w-3' />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align='end'>
											<DropdownMenuLabel>Actions</DropdownMenuLabel>
											<DropdownMenuItem onClick={() => onEditProduct(product)}>
												<Edit className='h-4 w-4 mr-2' />
												Edit
											</DropdownMenuItem>
											<DropdownMenuItem onClick={() => onToggleStatus(product)}>
												{product.isActive ? (
													<>
														<EyeOff className='h-4 w-4 mr-2' />
														Deactivate
													</>
												) : (
													<>
														<Eye className='h-4 w-4 mr-2' />
														Activate
													</>
												)}
											</DropdownMenuItem>
											<DropdownMenuSeparator />
											<DropdownMenuItem
												onClick={() => onDeleteProduct(product)}
												className='text-red-600'
											>
												<Trash2 className='h-4 w-4 mr-2' />
												Delete
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</div>

								<div className='grid grid-cols-3 gap-2 mb-2'>
									<div>
										<div className='text-xs text-gray-500 mb-1 font-medium'>
											Category
										</div>
										<span className='inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800'>
											{getCategoryLabel(product.category)}
										</span>
									</div>
									<div>
										<div className='text-xs text-gray-500 mb-1 font-medium'>
											Status
										</div>
										<span
											className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
												product.isActive
													? 'bg-green-100 text-green-800'
													: 'bg-red-100 text-red-800'
											}`}
										>
											{product.isActive ? 'Active' : 'Inactive'}
										</span>
									</div>
									<div>
										<div className='text-xs text-gray-500 mb-1 font-medium'>
											Price
										</div>
										<div className='text-xs font-medium text-gray-900'>
											{product.price ? formatKRW(product.price) : formatKRW(0)}
										</div>
									</div>
								</div>

								<div className='grid grid-cols-2 gap-2 text-xs text-gray-500 border-t pt-2'>
									<div className='flex justify-between'>
										<span className='font-medium'>Unit:</span>
										<span className='text-gray-700'>
											{getUnitLabel(product.unit)}
										</span>
									</div>
									<div className='flex justify-between'>
										<span className='font-medium'>Supplier:</span>
										<span className='text-gray-700'>
											{product.supplier || '-'}
										</span>
									</div>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			</div>

			{/* Scroll Indicator */}
			{products.length > 10 && (
				<div className='text-center py-2 text-sm text-gray-500 bg-gray-50 border-t rounded-lg mt-3'>
					Showing {products.length} products - Scroll to see more
				</div>
			)}
		</>
	)
}

export default ProductsTable
