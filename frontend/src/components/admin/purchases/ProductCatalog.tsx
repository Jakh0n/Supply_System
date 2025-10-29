'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { productsApi } from '@/lib/api'
import { Product } from '@/types'
import { Package, Plus, Search, ShoppingCart, Trash2 } from 'lucide-react'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'

interface ProductCatalogProps {
	refreshTrigger?: number
	onProductBuy: (product: Product) => void
	onProductDelete: (product: Product) => void
	onAddProduct: () => void
}

const ProductCatalog: React.FC<ProductCatalogProps> = ({
	refreshTrigger,
	onProductBuy,
	onProductDelete,
	onAddProduct,
}) => {
	const [products, setProducts] = useState<Product[]>([])
	const [loading, setLoading] = useState(true)
	const [searchTerm, setSearchTerm] = useState('')
	const [categoryFilter, setCategoryFilter] = useState('all')
	const [supplierFilter, setSupplierFilter] = useState('all')

	const fetchProducts = async () => {
		try {
			const response = await productsApi.getProducts()
			const manualProducts = (response.products || []).filter(
				product => product.supplier && product.supplier.trim() !== ''
			)
			setProducts(manualProducts)
		} catch (error) {
			console.error('Error fetching products:', error)
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		fetchProducts()
	}, [refreshTrigger])

	// Filter products based on search and filters
	const filteredProducts = products.filter(product => {
		const matchesSearch =
			product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			product.supplier?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			product.description?.toLowerCase().includes(searchTerm.toLowerCase())
		const matchesCategory =
			categoryFilter === 'all' || product.category === categoryFilter
		const matchesSupplier =
			supplierFilter === 'all' || product.supplier === supplierFilter

		return matchesSearch && matchesCategory && matchesSupplier
	})

	// Get unique suppliers for filter
	const uniqueSuppliers = Array.from(
		new Set(products.map(product => product.supplier).filter(Boolean))
	).filter((supplier): supplier is string => supplier !== undefined)

	const getCategoryColor = (category: string) => {
		const colors: { [key: string]: string } = {
			'main-products': 'bg-blue-100 text-blue-800',
			'side-products': 'bg-green-100 text-green-800',
			beverages: 'bg-purple-100 text-purple-800',
			snacks: 'bg-yellow-100 text-yellow-800',
			supplies: 'bg-gray-100 text-gray-800',
			'packaging-materials': 'bg-indigo-100 text-indigo-800',
			'cleaning-materials': 'bg-pink-100 text-pink-800',
			'frozen-products': 'bg-cyan-100 text-cyan-800',
			desserts: 'bg-orange-100 text-orange-800',
			drinks: 'bg-teal-100 text-teal-800',
		}
		return colors[category] || 'bg-gray-100 text-gray-800'
	}

	if (loading) {
		return (
			<div className='space-y-4'>
				{[1, 2, 3].map(i => (
					<div key={i} className='flex items-center space-x-4'>
						<Skeleton className='h-12 w-12 rounded' />
						<div className='space-y-2'>
							<Skeleton className='h-4 w-[200px]' />
							<Skeleton className='h-4 w-[100px]' />
						</div>
					</div>
				))}
			</div>
		)
	}

	return (
		<div className='space-y-6'>
			{/* Add New Product Card */}
			<div className='mb-4'>
				<Card className='hover:shadow-md transition-shadow duration-200'>
					<CardContent className='p-4 text-center'>
						<Package className='h-8 w-8 mx-auto text-gray-500 mb-2' />
						<h3 className='text-sm font-medium text-gray-800 mb-1'>
							Add New Product
						</h3>
						<p className='text-xs text-gray-500 mb-3'>Create a new product</p>
						<Button
							onClick={onAddProduct}
							size='sm'
							className='text-xs px-3 py-1.5'
						>
							<Plus className='h-3 w-3 mr-1' />
							Add Product
						</Button>
					</CardContent>
				</Card>
			</div>

			{/* Product Catalog List */}
			<Card>
				<CardHeader>
					<CardTitle className='flex items-center gap-2'>
						<Package className='h-5 w-5' />
						Product Catalog
					</CardTitle>
				</CardHeader>
				<CardContent>
					{/* Filters */}
					<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6'>
						<div>
							<div className='relative'>
								<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
								<Input
									placeholder='Search products...'
									value={searchTerm}
									onChange={e => setSearchTerm(e.target.value)}
									className='pl-10'
								/>
							</div>
						</div>

						<Select value={categoryFilter} onValueChange={setCategoryFilter}>
							<SelectTrigger>
								<SelectValue placeholder='Category' />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='all'>All Categories</SelectItem>
								<SelectItem value='main-products'>Main Products</SelectItem>
								<SelectItem value='side-products'>Side Products</SelectItem>
								<SelectItem value='beverages'>Beverages</SelectItem>
								<SelectItem value='snacks'>Snacks</SelectItem>
								<SelectItem value='supplies'>Supplies</SelectItem>
								<SelectItem value='packaging-materials'>
									Packaging Materials
								</SelectItem>
								<SelectItem value='cleaning-materials'>
									Cleaning Materials
								</SelectItem>
								<SelectItem value='frozen-products'>Frozen Products</SelectItem>
								<SelectItem value='desserts'>Desserts</SelectItem>
								<SelectItem value='drinks'>Drinks</SelectItem>
							</SelectContent>
						</Select>

						<Select value={supplierFilter} onValueChange={setSupplierFilter}>
							<SelectTrigger>
								<SelectValue placeholder='Supplier' />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='all'>All Suppliers</SelectItem>
								{uniqueSuppliers.map(supplier => (
									<SelectItem key={supplier} value={supplier}>
										{supplier}
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						<Button
							variant='outline'
							onClick={() => {
								setSearchTerm('')
								setCategoryFilter('all')
								setSupplierFilter('all')
							}}
							className='flex items-center gap-2'
						>
							Clear Filters
						</Button>
					</div>
					{filteredProducts.length === 0 ? (
						<div className='text-center py-8'>
							<Package className='h-12 w-12 mx-auto text-gray-400 mb-4' />
							<h3 className='text-lg font-medium text-gray-900 mb-2'>
								No products found
							</h3>
							<p className='text-gray-600'>
								Add your first product to get started
							</p>
						</div>
					) : (
						<div className='bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden'>
							<table className='w-full'>
								<thead className='bg-gradient-to-r from-blue-50 to-indigo-50'>
									<tr>
										<th className='text-left p-1 sm:p-2 font-medium text-gray-800 text-xs uppercase tracking-wider w-16'>
											Image
										</th>
										<th className='text-left p-1 sm:p-2 font-medium text-gray-800 text-xs uppercase tracking-wider'>
											Product Name
										</th>
										<th className='text-left p-1 sm:p-2 font-medium text-gray-800 text-xs uppercase tracking-wider w-16'>
											Qty
										</th>
										<th className='text-left p-1 sm:p-2 font-medium text-gray-800 text-xs uppercase tracking-wider w-16 hidden sm:table-cell'>
											Unit
										</th>
										<th className='text-left p-1 sm:p-2 font-medium text-gray-800 text-xs uppercase tracking-wider w-20'>
											Total
										</th>
										<th className='text-left p-1 sm:p-2 font-medium text-gray-800 text-xs uppercase tracking-wider w-20 hidden md:table-cell'>
											Unit Price
										</th>
										<th className='text-left p-1 sm:p-2 font-medium text-gray-800 text-xs uppercase tracking-wider w-20 hidden lg:table-cell'>
											Category
										</th>
										<th className='text-left p-1 sm:p-2 font-medium text-gray-800 text-xs uppercase tracking-wider w-20 hidden lg:table-cell'>
											Supplier
										</th>
										<th className='text-left p-1 sm:p-2 font-medium text-gray-800 text-xs uppercase tracking-wider w-20 hidden xl:table-cell'>
											Site
										</th>
										<th className='text-left p-1 sm:p-2 font-medium text-gray-800 text-xs uppercase tracking-wider w-20 hidden xl:table-cell'>
											Contact
										</th>
										<th className='text-left p-1 sm:p-2 font-medium text-gray-800 text-xs uppercase tracking-wider w-20 hidden xl:table-cell'>
											Usage
										</th>
										<th className='text-left p-1 sm:p-2 font-medium text-gray-800 text-xs uppercase tracking-wider w-24'>
											Actions
										</th>
									</tr>
								</thead>
								<tbody className='divide-y divide-gray-100'>
									{filteredProducts.map((product, index) => (
										<tr
											key={product._id}
											className={`hover:bg-gray-50 transition-colors duration-150 ${
												index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
											}`}
										>
											<td className='p-1 sm:p-2'>
												{product.images && product.images.length > 0 ? (
													<div className='w-10 h-10 rounded-lg overflow-hidden shadow-sm border border-gray-200'>
														<Image
															src={product.images[0].url}
															alt={product.name}
															width={40}
															height={40}
															className='w-full h-full object-cover'
														/>
													</div>
												) : (
													<div className='w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center shadow-sm border border-gray-200'>
														<Package className='h-4 w-4 text-gray-400' />
													</div>
												)}
											</td>
											<td className='p-1 sm:p-2'>
												<div className='font-medium text-gray-900 text-xs leading-tight'>
													<div className='line-clamp-2'>{product.name}</div>
												</div>
											</td>
											<td className='p-1 sm:p-2'>
												<span className='inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800'>
													{product.count || 0}
												</span>
											</td>
											<td className='p-1 sm:p-2 text-gray-700 font-medium text-xs hidden sm:table-cell'>
												{product.unit}
											</td>
											<td className='p-1 sm:p-2'>
												<span className='font-bold text-xs sm:text-sm text-green-600'>
													₩
													{(
														(product.count || 0) * product.price
													).toLocaleString()}
												</span>
											</td>
											<td className='p-1 sm:p-2 font-medium text-gray-800 text-xs hidden md:table-cell'>
												₩{product.price.toLocaleString()}
											</td>
											<td className='p-1 sm:p-2 hidden lg:table-cell'>
												<span
													className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(
														product.category
													)}`}
												>
													{product.category
														.replace(/-/g, ' ')
														.replace(/\b\w/g, l => l.toUpperCase())}
												</span>
											</td>
											<td className='p-1 sm:p-2 font-medium text-gray-800 text-xs hidden lg:table-cell'>
												{product.supplier || '-'}
											</td>
											<td className='p-1 sm:p-2 hidden xl:table-cell'>
												{product.purchaseSite ? (
													<a
														href={product.purchaseSite}
														target='_blank'
														rel='noopener noreferrer'
														className='text-blue-600 hover:text-blue-800 hover:underline font-medium transition-colors duration-150 text-xs'
													>
														Visit
													</a>
												) : (
													<span className='text-gray-400 text-xs'>-</span>
												)}
											</td>
											<td className='p-1 sm:p-2 text-gray-700 text-xs hidden xl:table-cell'>
												{product.contact || '-'}
											</td>
											<td className='p-1 sm:p-2 hidden xl:table-cell'>
												<span className='inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800'>
													{product.monthlyUsage || 0}
												</span>
											</td>
											<td className='p-1 sm:p-2'>
												<div className='flex gap-1'>
													<Button
														size='sm'
														onClick={() => onProductBuy(product)}
														className='bg-blue-600 hover:bg-blue-700 text-white font-medium px-2 py-1 rounded-md transition-all duration-150 shadow-sm hover:shadow-md text-xs h-6'
													>
														<ShoppingCart className='h-3 w-3 mr-1' />
														BUY
													</Button>
													<Button
														size='sm'
														variant='outline'
														onClick={() => onProductDelete(product)}
														className='text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300 px-1.5 py-1 rounded-md transition-all duration-150 text-xs h-6'
													>
														<Trash2 className='h-3 w-3' />
													</Button>
												</div>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	)
}

export default ProductCatalog
