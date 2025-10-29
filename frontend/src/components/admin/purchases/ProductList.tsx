'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { productsApi } from '@/lib/api'
import { Product, ProductFilters } from '@/types'
import { Package, ShoppingCart } from 'lucide-react'
import Image from 'next/image'
import React, { useCallback, useEffect, useState } from 'react'

interface ProductListProps {
	onProductSelect: (product: Product) => void
	loading?: boolean
}

const ProductList: React.FC<ProductListProps> = ({
	onProductSelect,
	loading,
}) => {
	const [products, setProducts] = useState<Product[]>([])
	const [loadingProducts, setLoadingProducts] = useState(false)
	const [filters] = useState<ProductFilters>({
		search: '',
		category: 'all',
		active: 'true',
	})

	const fetchProducts = useCallback(async () => {
		setLoadingProducts(true)
		try {
			const response = await productsApi.getProducts(filters)
			setProducts(response.products || [])
		} catch (error) {
			console.error('Error fetching products:', error)
		} finally {
			setLoadingProducts(false)
		}
	}, [filters])

	useEffect(() => {
		fetchProducts()
	}, [fetchProducts])

	const ProductTableRow: React.FC<{
		product: Product
		onClick: () => void
	}> = ({ product, onClick }) => {
		const primaryImage =
			product.images?.find(img => img.isPrimary) || product.images?.[0]

		const additionalData = {
			numberOfBoxes: 1,
			count: Math.floor(Math.random() * 1000) + 100,
			kgLtBox: 1,
			totalPrice: product.price * (Math.floor(Math.random() * 1000) + 100),
			manager: 'Buy Online',
			contact: 'Online Consultation',
			monthlyUsage: Math.floor(Math.random() * 20) + 1,
		}

		return (
			<tr className='hover:bg-gray-50'>
				<td className='px-4 py-3'>
					<div className='flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg overflow-hidden'>
						{primaryImage ? (
							<Image
								src={primaryImage.url}
								alt={product.name}
								width={48}
								height={48}
								className='w-full h-full object-cover'
							/>
						) : (
							<Package className='h-6 w-6 text-gray-400' />
						)}
					</div>
				</td>
				<td className='px-4 py-3'>
					<div className='flex flex-col'>
						<span className='text-sm font-medium text-gray-900'>
							{product.name}
						</span>
						<span className='text-xs text-gray-500'>{product.description}</span>
					</div>
				</td>
				<td className='px-4 py-3'>
					<span className='text-sm text-gray-900'>
						{additionalData.numberOfBoxes}
					</span>
				</td>
				<td className='px-4 py-3'>
					<span className='text-sm text-gray-900'>
						{additionalData.count.toLocaleString()}
					</span>
				</td>
				<td className='px-4 py-3'>
					<span className='text-sm text-gray-900'>
						{additionalData.kgLtBox}
					</span>
				</td>
				<td className='px-4 py-3'>
					<span className='font-semibold text-blue-600'>
						₩{additionalData.totalPrice.toLocaleString()}
					</span>
				</td>
				<td className='px-4 py-3'>
					<span className='font-semibold text-green-600'>
						₩{product.price.toLocaleString()}
					</span>
				</td>
				<td className='px-4 py-3'>
					<Badge variant='secondary' className='text-xs'>
						{product.category
							.replace('-', ' ')
							.replace(/\b\w/g, l => l.toUpperCase())}
					</Badge>
				</td>
				<td className='px-4 py-3'>
					<span className='text-sm text-gray-600'>{product.supplier}</span>
				</td>
				<td className='px-4 py-3'>
					<span className='text-sm text-gray-600'>
						{additionalData.manager}
					</span>
				</td>
				<td className='px-4 py-3'>
					<span className='text-sm text-gray-600'>
						{additionalData.contact}
					</span>
				</td>
				<td className='px-4 py-3'>
					<span className='text-sm text-gray-900'>
						{additionalData.monthlyUsage}
					</span>
				</td>
				<td className='px-4 py-3'>
					<Button
						size='sm'
						className='w-full'
						onClick={e => {
							e.stopPropagation()
							onClick()
						}}
					>
						<ShoppingCart className='h-4 w-4 mr-2' />
						BUY
					</Button>
				</td>
			</tr>
		)
	}

	if (loading || loadingProducts) {
		return (
			<Card>
				<CardContent className='p-8 text-center'>
					<Skeleton className='h-8 w-32 mx-auto mb-4' />
					<Skeleton className='h-4 w-48 mx-auto' />
				</CardContent>
			</Card>
		)
	}

	if (products.length === 0) {
		return (
			<Card>
				<CardContent className='p-8 text-center'>
					<Package className='h-12 w-12 mx-auto text-gray-400 mb-4' />
					<h3 className='text-lg font-medium text-gray-900 mb-2'>
						No products found
					</h3>
					<p className='text-gray-600'>Add some products to get started</p>
				</CardContent>
			</Card>
		)
	}

	return (
		<Card>
			<CardContent className='p-0'>
				<div className='overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 relative z-0'>
					<table className='w-full min-w-[1200px]'>
						<thead className='bg-gray-50 border-b sticky top-0 z-10'>
							<tr>
								<th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16'>
									Image
								</th>
								<th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-64'>
									Product Name
								</th>
								<th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24'>
									Number of Boxes
								</th>
								<th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20'>
									Count
								</th>
								<th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20'>
									KG/LT/BOX
								</th>
								<th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24'>
									Price
								</th>
								<th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24'>
									Unit Price
								</th>
								<th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32'>
									Category
								</th>
								<th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32'>
									Supplier
								</th>
								<th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24'>
									Manager
								</th>
								<th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32'>
									Contact
								</th>
								<th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24'>
									Monthly Usage
								</th>
								<th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24'>
									Purchase Site
								</th>
							</tr>
						</thead>
						<tbody className='bg-white divide-y divide-gray-200'>
							{products.map(product => (
								<ProductTableRow
									key={product._id}
									product={product}
									onClick={() => onProductSelect(product)}
								/>
							))}
						</tbody>
					</table>
				</div>
			</CardContent>
		</Card>
	)
}

export default ProductList
