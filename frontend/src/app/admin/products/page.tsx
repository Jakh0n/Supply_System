'use client'

import ProductsFilters from '@/components/admin/products/ProductsFilters'
import ProductsHeader from '@/components/admin/products/ProductsHeader'
import ProductsTable from '@/components/admin/products/ProductsTable'
import AdminLayout from '@/components/shared/AdminLayout'
import ImageUpload from '@/components/shared/ImageUpload'
import ProtectedRoute from '@/components/shared/ProtectedRoute'
import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
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
import { AlertCircle } from 'lucide-react'
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
		category: 'main-products',
		unit: 'pieces',
		description: '',
		supplier: '',
		price: 0,
		images: [],
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
			resetForm()
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
			images: product.images || [],
		})
		setIsEditDialogOpen(true)
	}

	const resetForm = () => {
		setFormData({
			name: '',
			category: 'main-products',
			unit: 'pieces',
			description: '',
			supplier: '',
			price: 0,
			images: [],
		})
	}

	if (loading && products.length === 0) {
		return (
			<ProtectedRoute requiredRole='admin'>
				<AdminLayout>
					<div className='flex items-center justify-center h-64'>
						<div className='text-center'>
							<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto'></div>
							<p className='mt-4 text-gray-600'>Loading products...</p>
						</div>
					</div>
				</AdminLayout>
			</ProtectedRoute>
		)
	}

	return (
		<ProtectedRoute requiredRole='admin'>
			<AdminLayout>
				<div className='space-y-4 sm:space-y-6 p-4 sm:p-6'>
					{/* Header */}
					<ProductsHeader
						isCreateDialogOpen={isCreateDialogOpen}
						setIsCreateDialogOpen={setIsCreateDialogOpen}
						formData={formData}
						setFormData={setFormData}
						onCreateProduct={handleCreateProduct}
						formLoading={formLoading}
						resetForm={resetForm}
					/>

					{/* Error message */}
					{error && (
						<div className='bg-red-50 border border-red-200 rounded-md p-4'>
							<div className='flex'>
								<AlertCircle className='h-5 w-5 text-red-400 flex-shrink-0' />
								<div className='ml-3'>
									<p className='text-sm text-red-800'>{error}</p>
								</div>
							</div>
						</div>
					)}

					{/* Filters */}
					<ProductsFilters
						searchTerm={searchTerm}
						categoryFilter={categoryFilter}
						statusFilter={statusFilter}
						onSearchChange={setSearchTerm}
						onCategoryChange={setCategoryFilter}
						onStatusChange={setStatusFilter}
					/>

					{/* Products Table */}
					<ProductsTable
						products={products}
						searchTerm={searchTerm}
						categoryFilter={categoryFilter}
						statusFilter={statusFilter}
						onEditProduct={openEditDialog}
						onToggleStatus={handleToggleStatus}
						onDeleteProduct={handleDeleteProduct}
					/>

					{/* Edit Dialog */}
					<Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
						<DialogContent className='sm:max-w-[425px] mx-4 max-h-[90vh] overflow-y-auto'>
							<DialogHeader>
								<DialogTitle className='text-lg sm:text-xl'>
									Edit Product
								</DialogTitle>
								<DialogDescription>
									Update the product information.
								</DialogDescription>
							</DialogHeader>
							<form onSubmit={handleEditProduct} className='space-y-4'>
								<div>
									<Label htmlFor='edit-name' className='text-sm font-medium'>
										Product Name *
									</Label>
									<Input
										id='edit-name'
										value={formData.name}
										onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
											setFormData(prev => ({ ...prev, name: e.target.value }))
										}
										placeholder='Enter product name'
										required
										className='mt-1'
									/>
								</div>
								<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
									<div>
										<Label
											htmlFor='edit-category'
											className='text-sm font-medium'
										>
											Category *
										</Label>
										<Select
											value={formData.category}
											onValueChange={(value: ProductCategory) =>
												setFormData(prev => ({ ...prev, category: value }))
											}
										>
											<SelectTrigger className='mt-1'>
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
										<Label htmlFor='edit-unit' className='text-sm font-medium'>
											Unit *
										</Label>
										<Select
											value={formData.unit}
											onValueChange={(value: ProductUnit) =>
												setFormData(prev => ({ ...prev, unit: value }))
											}
										>
											<SelectTrigger className='mt-1'>
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
									<Label
										htmlFor='edit-supplier'
										className='text-sm font-medium'
									>
										Supplier
									</Label>
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
										className='mt-1'
									/>
								</div>
								<div>
									<Label htmlFor='edit-price' className='text-sm font-medium'>
										Price (KRW) *
									</Label>
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
										className='mt-1'
									/>
								</div>
								<div>
									<Label
										htmlFor='edit-description'
										className='text-sm font-medium'
									>
										Description
									</Label>
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
										className='flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1'
									/>
								</div>

								{/* Image Upload */}
								<ImageUpload
									images={formData.images || []}
									onImagesChange={images =>
										setFormData(prev => ({
											...prev,
											images,
										}))
									}
									maxImages={5}
									disabled={formLoading}
								/>
								<div className='flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2'>
									<Button
										type='button'
										variant='outline'
										onClick={() => setIsEditDialogOpen(false)}
										className='w-full sm:w-auto'
									>
										Cancel
									</Button>
									<Button
										type='submit'
										disabled={formLoading}
										className='w-full sm:w-auto'
									>
										{formLoading ? 'Updating...' : 'Update Product'}
									</Button>
								</div>
							</form>
						</DialogContent>
					</Dialog>
				</div>
			</AdminLayout>
		</ProtectedRoute>
	)
}

export default ProductsManagement
