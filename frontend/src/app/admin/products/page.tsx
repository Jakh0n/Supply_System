'use client'

import DashboardLayout from '@/components/shared/DashboardLayout'
import ProtectedRoute from '@/components/shared/ProtectedRoute'
import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { productsApi } from '@/lib/api'
import { Product, ProductCategory, ProductFormData, ProductUnit } from '@/types'
import {
	AlertCircle,
	Edit,
	Eye,
	EyeOff,
	MoreHorizontal,
	Package,
	Plus,
	Search,
	Trash2,
} from 'lucide-react'
import React, { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

// Helper function to format price in Korean Won
const formatKRW = (price: number): string => {
	return new Intl.NumberFormat('ko-KR', {
		style: 'currency',
		currency: 'KRW',
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(price)
}

// Helper function to parse KRW input (remove formatting)
const parseKRWInput = (value: string): number => {
	const numericValue = value.replace(/[^\d]/g, '')
	return parseInt(numericValue) || 0
}

const CATEGORIES = [
	{ value: 'food' as ProductCategory, label: 'Food' },
	{ value: 'beverages' as ProductCategory, label: 'Beverages' },
	{ value: 'cleaning' as ProductCategory, label: 'Cleaning' },
	{ value: 'equipment' as ProductCategory, label: 'Equipment' },
	{ value: 'packaging' as ProductCategory, label: 'Packaging' },
	{ value: 'other' as ProductCategory, label: 'Other' },
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

const ProductsManagement: React.FC = () => {
	const [products, setProducts] = useState<Product[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')
	const [searchTerm, setSearchTerm] = useState('')
	const [categoryFilter, setCategoryFilter] = useState<ProductCategory | 'all'>(
		'all'
	)
	const [statusFilter, setStatusFilter] = useState<'true' | 'false' | 'all'>(
		'all'
	)
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
	const [editingProduct, setEditingProduct] = useState<Product | null>(null)
	const [formData, setFormData] = useState<ProductFormData>({
		name: '',
		category: 'other',
		unit: 'pieces',
		description: '',
		supplier: '',
		price: 0,
	})
	const [formLoading, setFormLoading] = useState(false)

	const fetchProducts = useCallback(async () => {
		try {
			setLoading(true)
			const response = await productsApi.getProducts({
				search: searchTerm || undefined,
				category: categoryFilter !== 'all' ? categoryFilter : undefined,
				active: statusFilter !== 'all' ? statusFilter : undefined,
			})
			setProducts(response.products)
		} catch (err) {
			setError('Failed to load products')
			console.error('Products fetch error:', err)
		} finally {
			setLoading(false)
		}
	}, [searchTerm, categoryFilter, statusFilter])

	useEffect(() => {
		fetchProducts()
	}, [fetchProducts])

	const handleCreateProduct = async (e: React.FormEvent) => {
		e.preventDefault()
		try {
			setFormLoading(true)
			const response = await productsApi.createProduct(formData)
			setProducts(prev => [response.product, ...prev])
			setIsCreateDialogOpen(false)
			setFormData({
				name: '',
				category: 'other',
				unit: 'pieces',
				description: '',
				supplier: '',
				price: 0,
			})
			toast.success('Product created successfully')
		} catch (err: unknown) {
			const error = err as { response?: { data?: { message?: string } } }
			toast.error(error.response?.data?.message || 'Failed to create product')
		} finally {
			setFormLoading(false)
		}
	}

	const handleEditProduct = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!editingProduct) return

		try {
			setFormLoading(true)
			const response = await productsApi.updateProduct(
				editingProduct._id,
				formData
			)
			setProducts(prev =>
				prev.map(p => (p._id === editingProduct._id ? response.product : p))
			)
			setIsEditDialogOpen(false)
			setEditingProduct(null)
			toast.success('Product updated successfully')
		} catch (err: unknown) {
			const error = err as { response?: { data?: { message?: string } } }
			toast.error(error.response?.data?.message || 'Failed to update product')
		} finally {
			setFormLoading(false)
		}
	}

	const handleToggleStatus = async (product: Product) => {
		try {
			const response = await productsApi.toggleProductStatus(product._id)
			setProducts(prev =>
				prev.map(p => (p._id === product._id ? response.product : p))
			)
			toast.success(
				`Product ${response.product.isActive ? 'activated' : 'deactivated'}`
			)
		} catch (err: unknown) {
			const error = err as { response?: { data?: { message?: string } } }
			toast.error(
				error.response?.data?.message || 'Failed to update product status'
			)
		}
	}

	const handleDeleteProduct = async (product: Product) => {
		if (!confirm('Are you sure you want to delete this product?')) return

		try {
			await productsApi.deleteProduct(product._id)
			setProducts(prev => prev.filter(p => p._id !== product._id))
			toast.success('Product deleted successfully')
		} catch (err: unknown) {
			const error = err as { response?: { data?: { message?: string } } }
			toast.error(error.response?.data?.message || 'Failed to delete product')
		}
	}

	const openEditDialog = (product: Product) => {
		setEditingProduct(product)
		setFormData({
			name: product.name,
			category: product.category,
			unit: product.unit,
			description: product.description || '',
			supplier: product.supplier || '',
			price: product.price,
		})
		setIsEditDialogOpen(true)
	}

	const resetForm = () => {
		setFormData({
			name: '',
			category: 'other',
			unit: 'pieces',
			description: '',
			supplier: '',
			price: 0,
		})
	}

	const getCategoryLabel = (category: string) => {
		return CATEGORIES.find(c => c.value === category)?.label || category
	}

	const getUnitLabel = (unit: string) => {
		return UNITS.find(u => u.value === unit)?.label || unit
	}

	if (loading && products.length === 0) {
		return (
			<ProtectedRoute requiredRole='admin'>
				<DashboardLayout>
					<div className='flex items-center justify-center h-64'>
						<div className='text-center'>
							<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto'></div>
							<p className='mt-4 text-gray-600'>Loading products...</p>
						</div>
					</div>
				</DashboardLayout>
			</ProtectedRoute>
		)
	}

	return (
		<ProtectedRoute requiredRole='admin'>
			<DashboardLayout>
				<div className='space-y-6'>
					{/* Header */}
					<div className='flex justify-between items-center'>
						<div>
							<h1 className='text-2xl font-bold text-gray-900'>
								Product Management
							</h1>
							<p className='mt-2 text-gray-600'>
								Manage your restaurant supply products
							</p>
						</div>
						<Dialog
							open={isCreateDialogOpen}
							onOpenChange={setIsCreateDialogOpen}
						>
							<DialogTrigger asChild>
								<Button onClick={resetForm}>
									<Plus className='h-4 w-4 mr-2' />
									Add Product
								</Button>
							</DialogTrigger>
							<DialogContent className='sm:max-w-[425px]'>
								<DialogHeader>
									<DialogTitle>Create New Product</DialogTitle>
									<DialogDescription>
										Add a new product to your inventory catalog.
									</DialogDescription>
								</DialogHeader>
								<form onSubmit={handleCreateProduct} className='space-y-4'>
									<div>
										<Label htmlFor='name' className='pb-2'>
											Product Name *
										</Label>
										<Input
											id='name'
											value={formData.name}
											onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
												setFormData(prev => ({ ...prev, name: e.target.value }))
											}
											placeholder='Enter product name'
											required
										/>
									</div>
									<div className='grid grid-cols-2 gap-4'>
										<div>
											<Label htmlFor='category' className='pb-2'>
												Category *
											</Label>
											<Select
												value={formData.category}
												onValueChange={(value: ProductCategory) =>
													setFormData(prev => ({ ...prev, category: value }))
												}
											>
												<SelectTrigger>
													<SelectValue placeholder='Select category' />
												</SelectTrigger>
												<SelectContent>
													{CATEGORIES.map(category => (
														<SelectItem
															key={category.value}
															value={category.value}
														>
															{category.label}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</div>
										<div>
											<Label htmlFor='unit' className='pb-2'>
												Unit *
											</Label>
											<Select
												value={formData.unit}
												onValueChange={(value: ProductUnit) =>
													setFormData(prev => ({ ...prev, unit: value }))
												}
											>
												<SelectTrigger>
													<SelectValue placeholder='Select unit' />
												</SelectTrigger>
												<SelectContent>
													{UNITS.map(unit => (
														<SelectItem key={unit.value} value={unit.value}>
															{unit.label}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</div>
									</div>
									<div>
										<Label htmlFor='supplier' className='pb-2'>
											Supplier
										</Label>
										<Input
											id='supplier'
											value={formData.supplier}
											onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
												setFormData(prev => ({
													...prev,
													supplier: e.target.value,
												}))
											}
											placeholder='Enter supplier name'
										/>
									</div>
									<div>
										<Label htmlFor='price' className='pb-2'>
											Price (KRW) *
										</Label>
										<Input
											id='price'
											type='text'
											value={formData.price ? formatKRW(formData.price) : ''}
											onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
												setFormData(prev => ({
													...prev,
													price: parseKRWInput(e.target.value),
												}))
											}
											placeholder='₩0 (Korean Won)'
											required
										/>
									</div>
									<div>
										<Label htmlFor='description' className='pb-2'>
											Description
										</Label>
										<textarea
											id='description'
											value={formData.description}
											onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
												setFormData(prev => ({
													...prev,
													description: e.target.value,
												}))
											}
											placeholder='Enter product description'
											rows={3}
											className='flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
										/>
									</div>
									<div className='flex justify-end space-x-2'>
										<Button
											type='button'
											variant='outline'
											onClick={() => setIsCreateDialogOpen(false)}
										>
											Cancel
										</Button>
										<Button type='submit' disabled={formLoading}>
											{formLoading ? 'Creating...' : 'Create Product'}
										</Button>
									</div>
								</form>
							</DialogContent>
						</Dialog>
					</div>

					{/* Error message */}
					{error && (
						<div className='bg-red-50 border border-red-200 rounded-md p-4'>
							<div className='flex'>
								<AlertCircle className='h-5 w-5 text-red-400' />
								<div className='ml-3'>
									<p className='text-sm text-red-800'>{error}</p>
								</div>
							</div>
						</div>
					)}

					{/* Filters */}
					<Card>
						<CardHeader>
							<CardTitle>Filters</CardTitle>
						</CardHeader>
						<CardContent>
							<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
								<div>
									<Label htmlFor='search' className='pb-2'>
										Search Products
									</Label>
									<div className='relative '>
										<Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
										<Input
											id='search'
											placeholder='Search by name, description, or supplier'
											value={searchTerm}
											onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
												setSearchTerm(e.target.value)
											}
											className='pl-8'
										/>
									</div>
								</div>
								<div>
									<Label htmlFor='category-filter' className='pb-2'>
										Category
									</Label>
									<Select
										value={categoryFilter}
										onValueChange={(value: ProductCategory | 'all') =>
											setCategoryFilter(value)
										}
									>
										<SelectTrigger>
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
								<div>
									<Label htmlFor='status-filter' className='pb-2'>
										Status
									</Label>
									<Select
										value={statusFilter}
										onValueChange={(value: 'true' | 'false' | 'all') =>
											setStatusFilter(value)
										}
									>
										<SelectTrigger>
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

					{/* Products Table */}
					<Card>
						<CardHeader>
							<CardTitle>Products ({products.length})</CardTitle>
							<CardDescription>
								Manage your product catalog and inventory
							</CardDescription>
						</CardHeader>
						<CardContent>
							{products.length === 0 ? (
								<div className='text-center py-8'>
									<Package className='h-12 w-12 text-gray-400 mx-auto mb-4' />
									<p className='text-gray-500'>No products found</p>
									<p className='text-sm text-gray-400 mt-1'>
										{searchTerm ||
										categoryFilter !== 'all' ||
										statusFilter !== 'all'
											? 'Try adjusting your filters'
											: 'Add your first product to get started'}
									</p>
								</div>
							) : (
								<div className='overflow-x-auto'>
									<div className='max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100'>
										<table className='w-full'>
											<thead className='bg-gray-50 sticky top-0 z-10'>
												<tr className='border-b'>
													<th className='text-left py-3 px-4 font-medium bg-gray-50'>
														Name
													</th>
													<th className='text-left py-3 px-4 font-medium bg-gray-50'>
														Category
													</th>
													<th className='text-left py-3 px-4 font-medium bg-gray-50'>
														Unit
													</th>
													<th className='text-left py-3 px-4 font-medium bg-gray-50'>
														Supplier
													</th>
													<th className='text-left py-3 px-4 font-medium bg-gray-50'>
														Price
													</th>
													<th className='text-left py-3 px-4 font-medium bg-gray-50'>
														Status
													</th>
													<th className='text-left py-3 px-4 font-medium bg-gray-50'>
														Created
													</th>
													<th className='text-right py-3 px-4 font-medium bg-gray-50'>
														Actions
													</th>
												</tr>
											</thead>
											<tbody>
												{products.map(product => (
													<tr
														key={product._id}
														className='border-b hover:bg-gray-50 transition-colors'
													>
														<td className='py-3 px-4'>
															<div>
																<p className='font-medium'>{product.name}</p>
																{product.description && (
																	<p className='text-sm text-gray-500 truncate max-w-xs'>
																		{product.description}
																	</p>
																)}
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
																		onClick={() => openEditDialog(product)}
																	>
																		<Edit className='h-4 w-4 mr-2' />
																		Edit
																	</DropdownMenuItem>
																	<DropdownMenuItem
																		onClick={() => handleToggleStatus(product)}
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
																		onClick={() => handleDeleteProduct(product)}
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
									{products.length > 10 && (
										<div className='text-center py-2 text-sm text-gray-500 bg-gray-50 border-t'>
											Showing {products.length} products - Scroll to see more
										</div>
									)}
								</div>
							)}
						</CardContent>
					</Card>

					{/* Edit Dialog */}
					<Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
						<DialogContent className='sm:max-w-[425px]'>
							<DialogHeader>
								<DialogTitle>Edit Product</DialogTitle>
								<DialogDescription>
									Update the product information.
								</DialogDescription>
							</DialogHeader>
							<form onSubmit={handleEditProduct} className='space-y-4'>
								<div>
									<Label htmlFor='edit-name'>Product Name *</Label>
									<Input
										id='edit-name'
										value={formData.name}
										onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
											setFormData(prev => ({ ...prev, name: e.target.value }))
										}
										placeholder='Enter product name'
										required
									/>
								</div>
								<div className='grid grid-cols-2 gap-4'>
									<div>
										<Label htmlFor='edit-category'>Category *</Label>
										<Select
											value={formData.category}
											onValueChange={(value: ProductCategory) =>
												setFormData(prev => ({ ...prev, category: value }))
											}
										>
											<SelectTrigger>
												<SelectValue placeholder='Select category' />
											</SelectTrigger>
											<SelectContent>
												{CATEGORIES.map(category => (
													<SelectItem
														key={category.value}
														value={category.value}
													>
														{category.label}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>
									<div>
										<Label htmlFor='edit-unit'>Unit *</Label>
										<Select
											value={formData.unit}
											onValueChange={(value: ProductUnit) =>
												setFormData(prev => ({ ...prev, unit: value }))
											}
										>
											<SelectTrigger>
												<SelectValue placeholder='Select unit' />
											</SelectTrigger>
											<SelectContent>
												{UNITS.map(unit => (
													<SelectItem key={unit.value} value={unit.value}>
														{unit.label}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>
								</div>
								<div>
									<Label htmlFor='edit-supplier'>Supplier</Label>
									<Input
										id='edit-supplier'
										value={formData.supplier}
										onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
											setFormData(prev => ({
												...prev,
												supplier: e.target.value,
											}))
										}
										placeholder='Enter supplier name'
									/>
								</div>
								<div>
									<Label htmlFor='edit-price'>Price (KRW) *</Label>
									<Input
										id='edit-price'
										type='text'
										value={formData.price ? formatKRW(formData.price) : ''}
										onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
											setFormData(prev => ({
												...prev,
												price: parseKRWInput(e.target.value),
											}))
										}
										placeholder='₩0 (Korean Won)'
										required
									/>
								</div>
								<div>
									<Label htmlFor='edit-description'>Description</Label>
									<textarea
										id='edit-description'
										value={formData.description}
										onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
											setFormData(prev => ({
												...prev,
												description: e.target.value,
											}))
										}
										placeholder='Enter product description'
										rows={3}
										className='flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
									/>
								</div>
								<div className='flex justify-end space-x-2'>
									<Button
										type='button'
										variant='outline'
										onClick={() => setIsEditDialogOpen(false)}
									>
										Cancel
									</Button>
									<Button type='submit' disabled={formLoading}>
										{formLoading ? 'Updating...' : 'Update Product'}
									</Button>
								</div>
							</form>
						</DialogContent>
					</Dialog>
				</div>
			</DashboardLayout>
		</ProtectedRoute>
	)
}

export default ProductsManagement
