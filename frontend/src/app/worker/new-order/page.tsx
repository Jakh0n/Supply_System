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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { useAuth } from '@/contexts/AuthContext'
import { ordersApi, productsApi } from '@/lib/api'
import { Product, ProductCategory } from '@/types'
import {
	AlertCircle,
	Calendar,
	Check,
	Minus,
	Package,
	Plus,
	Search,
	ShoppingCart,
	Trash2,
	X,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

// Helper function to format currency
const formatKRW = (amount: number): string => {
	return new Intl.NumberFormat('ko-KR', {
		style: 'currency',
		currency: 'KRW',
	}).format(amount)
}

// Helper function to get tomorrow's date
const getTomorrowDate = (): string => {
	const tomorrow = new Date()
	tomorrow.setDate(tomorrow.getDate() + 1)
	return tomorrow.toISOString().split('T')[0]
}

// Order item interface
interface OrderItem {
	product: Product
	quantity: number
	notes?: string
}

const NewOrder: React.FC = () => {
	const { user } = useAuth()
	const router = useRouter()
	const [products, setProducts] = useState<Product[]>([])
	const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')
	const [searchTerm, setSearchTerm] = useState('')
	const [categoryFilter, setCategoryFilter] = useState<ProductCategory | 'all'>(
		'all'
	)
	const [orderItems, setOrderItems] = useState<OrderItem[]>([])
	const [requestedDate, setRequestedDate] = useState(getTomorrowDate())
	const [orderNotes, setOrderNotes] = useState('')
	const [submitting, setSubmitting] = useState(false)

	// Fetch products
	const fetchProducts = useCallback(async () => {
		try {
			setLoading(true)
			const response = await productsApi.getProducts({ active: 'true' })
			setProducts(response.products)
			setFilteredProducts(response.products)
		} catch (err) {
			setError('Failed to load products')
			console.error('Products fetch error:', err)
		} finally {
			setLoading(false)
		}
	}, [])

	useEffect(() => {
		fetchProducts()
	}, [fetchProducts])

	// Filter products based on search and category
	useEffect(() => {
		let filtered = products

		// Filter by search term
		if (searchTerm) {
			filtered = filtered.filter(
				product =>
					product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
					product.description
						?.toLowerCase()
						.includes(searchTerm.toLowerCase()) ||
					product.supplier?.toLowerCase().includes(searchTerm.toLowerCase())
			)
		}

		// Filter by category
		if (categoryFilter !== 'all') {
			filtered = filtered.filter(product => product.category === categoryFilter)
		}

		setFilteredProducts(filtered)
	}, [products, searchTerm, categoryFilter])

	// Add product to order
	const addProductToOrder = (product: Product) => {
		const existingItem = orderItems.find(
			item => item.product._id === product._id
		)

		if (existingItem) {
			setOrderItems(prev =>
				prev.map(item =>
					item.product._id === product._id
						? { ...item, quantity: item.quantity + 1 }
						: item
				)
			)
		} else {
			setOrderItems(prev => [...prev, { product, quantity: 1 }])
		}

		toast.success(`${product.name} added to order`)
	}

	// Update item quantity
	const updateItemQuantity = (productId: string, quantity: number) => {
		if (quantity <= 0) {
			removeItemFromOrder(productId)
			return
		}

		setOrderItems(prev =>
			prev.map(item =>
				item.product._id === productId ? { ...item, quantity } : item
			)
		)
	}

	// Update item notes
	const updateItemNotes = (productId: string, notes: string) => {
		setOrderItems(prev =>
			prev.map(item =>
				item.product._id === productId ? { ...item, notes } : item
			)
		)
	}

	// Remove item from order
	const removeItemFromOrder = (productId: string) => {
		setOrderItems(prev => prev.filter(item => item.product._id !== productId))
	}

	// Clear entire order
	const clearOrder = () => {
		setOrderItems([])
		setRequestedDate(getTomorrowDate())
		setOrderNotes('')
		toast.success('Order cleared')
	}

	// Calculate total items and value
	const getTotalItems = () => {
		return orderItems.reduce((total, item) => total + item.quantity, 0)
	}

	const getTotalValue = () => {
		return orderItems.reduce(
			(total, item) => total + item.quantity * item.product.price,
			0
		)
	}

	// Submit order
	const handleSubmitOrder = async () => {
		if (orderItems.length === 0) {
			toast.error('Please add at least one item to your order')
			return
		}

		if (!requestedDate) {
			toast.error('Please select a requested date')
			return
		}

		try {
			setSubmitting(true)

			const orderData = {
				requestedDate,
				items: orderItems.map(item => ({
					product: item.product._id,
					quantity: item.quantity,
					notes: item.notes || undefined,
				})),
				notes: orderNotes || undefined,
			}

			console.log('=== FRONTEND ORDER SUBMISSION DEBUG ===')
			console.log('Order data being sent:', JSON.stringify(orderData, null, 2))
			console.log('Order items:', orderItems)
			console.log('Requested date:', requestedDate)
			console.log('Order notes:', orderNotes)
			console.log('User:', user)
			console.log('==========================================')

			await ordersApi.createOrder(orderData)

			toast.success('Order created successfully!')
			router.push('/worker/orders')
		} catch (err: unknown) {
			console.error('=== FRONTEND ORDER SUBMISSION ERROR ===')
			console.error('Full error object:', err)

			const errorWithResponse = err as {
				response?: {
					data?: {
						message?: string
						details?: Array<{ field: string; message: string }>
					}
				}
			}
			console.error('Error response:', errorWithResponse?.response)
			console.error('Error data:', errorWithResponse?.response?.data)
			console.error('=======================================')

			const error = err as {
				response?: {
					data?: {
						message?: string
						details?: Array<{ field: string; message: string }>
					}
				}
			}

			// Show detailed validation errors if available
			if (
				error.response?.data?.details &&
				Array.isArray(error.response.data.details)
			) {
				const validationErrors = error.response.data.details
					.map(detail => `${detail.field}: ${detail.message}`)
					.join(', ')
				toast.error(`Validation failed: ${validationErrors}`)
				console.error('Validation errors:', error.response.data.details)
			} else {
				toast.error(error.response?.data?.message || 'Failed to create order')
			}
		} finally {
			setSubmitting(false)
		}
	}

	// Get category label
	const getCategoryLabel = (category: string) => {
		const categories = {
			food: 'Food',
			beverages: 'Beverages',
			cleaning: 'Cleaning',
			equipment: 'Equipment',
			packaging: 'Packaging',
			other: 'Other',
		}
		return categories[category as keyof typeof categories] || category
	}

	if (loading) {
		return (
			<ProtectedRoute requiredRole='worker'>
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
		<ProtectedRoute requiredRole='worker'>
			<DashboardLayout>
				<div className='space-y-6'>
					{/* Header */}
					<div className='flex justify-between items-center'>
						<div>
							<h1 className='text-2xl font-bold text-gray-900'>
								Create New Order
							</h1>
							<p className='mt-2 text-gray-600'>
								Submit a new supply request for {user?.branch}
							</p>
						</div>
						<div className='flex gap-2'>
							{orderItems.length > 0 && (
								<Button
									variant='outline'
									onClick={clearOrder}
									className='text-red-600 hover:text-red-700'
								>
									<Trash2 className='h-4 w-4 mr-2' />
									Clear Order
								</Button>
							)}
							<Button
								variant='outline'
								onClick={() => router.push('/worker/orders')}
							>
								<X className='h-4 w-4 mr-2' />
								Cancel
							</Button>
						</div>
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

					<div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
						{/* Product Selection */}
						<div className='lg:col-span-2'>
							<Card>
								<CardHeader>
									<CardTitle>Select Products</CardTitle>
									<CardDescription>
										Choose items for your supply request
									</CardDescription>
								</CardHeader>
								<CardContent>
									{/* Search and Filter */}
									<div className='flex flex-col sm:flex-row gap-4 mb-6'>
										<div className='flex-1'>
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
										<Select
											value={categoryFilter}
											onValueChange={(value: ProductCategory | 'all') =>
												setCategoryFilter(value)
											}
										>
											<SelectTrigger className='w-full sm:w-48'>
												<SelectValue placeholder='All categories' />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value='all'>All Categories</SelectItem>
												<SelectItem value='food'>Food</SelectItem>
												<SelectItem value='beverages'>Beverages</SelectItem>
												<SelectItem value='cleaning'>Cleaning</SelectItem>
												<SelectItem value='equipment'>Equipment</SelectItem>
												<SelectItem value='packaging'>Packaging</SelectItem>
												<SelectItem value='other'>Other</SelectItem>
											</SelectContent>
										</Select>
									</div>

									{/* Products Grid */}
									{filteredProducts.length === 0 ? (
										<div className='text-center py-12'>
											<Package className='h-16 w-16 text-gray-400 mx-auto mb-4' />
											<h3 className='text-lg font-medium text-gray-900 mb-2'>
												No products found
											</h3>
											<p className='text-gray-500'>
												{searchTerm || categoryFilter !== 'all'
													? 'Try adjusting your search or filter'
													: 'No products available'}
											</p>
										</div>
									) : (
										<div className='grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-96 overflow-y-auto'>
											{filteredProducts.map(product => (
												<div
													key={product._id}
													className='border rounded-lg p-4 hover:shadow-md transition-shadow'
												>
													<div className='flex items-start justify-between'>
														<div className='flex-1'>
															<h3 className='font-medium text-gray-900 mb-1'>
																{product.name}
															</h3>
															<p className='text-sm text-gray-500 mb-2'>
																{getCategoryLabel(product.category)} •{' '}
																{product.unit}
															</p>
															{product.description && (
																<p className='text-sm text-gray-600 mb-2'>
																	{product.description}
																</p>
															)}
															{product.supplier && (
																<p className='text-xs text-gray-500 mb-2'>
																	Supplier: {product.supplier}
																</p>
															)}
															<p className='text-sm font-medium text-gray-900'>
																{formatKRW(product.price)} per {product.unit}
															</p>
														</div>
														<Button
															size='sm'
															onClick={() => addProductToOrder(product)}
															className='ml-2'
														>
															<Plus className='h-4 w-4' />
														</Button>
													</div>
												</div>
											))}
										</div>
									)}
								</CardContent>
							</Card>
						</div>

						{/* Order Summary */}
						<div>
							<Card className='sticky top-6'>
								<CardHeader>
									<CardTitle>Order Summary</CardTitle>
									<CardDescription>Review your order details</CardDescription>
								</CardHeader>
								<CardContent className='space-y-4'>
									{/* Order Date */}
									<div>
										<Label htmlFor='requested-date'>Requested Date</Label>
										<div className='relative'>
											<Calendar className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
											<Input
												id='requested-date'
												type='date'
												value={requestedDate}
												onChange={e => setRequestedDate(e.target.value)}
												min={getTomorrowDate()}
												className='pl-10'
											/>
										</div>
									</div>

									{/* Order Items */}
									<div>
										<Label className='text-sm font-medium'>
											Items ({orderItems.length})
										</Label>
										{orderItems.length === 0 ? (
											<div className='text-center py-8 text-gray-500'>
												<ShoppingCart className='h-12 w-12 mx-auto mb-2 text-gray-400' />
												<p className='text-sm'>No items added yet</p>
											</div>
										) : (
											<div className='space-y-3 max-h-64 overflow-y-auto'>
												{orderItems.map(item => (
													<div
														key={item.product._id}
														className='border rounded-lg p-3 space-y-2'
													>
														<div className='flex items-start justify-between'>
															<div className='flex-1'>
																<p className='font-medium text-sm'>
																	{item.product.name}
																</p>
																<p className='text-xs text-gray-500'>
																	{formatKRW(item.product.price)} per{' '}
																	{item.product.unit}
																</p>
															</div>
															<Button
																variant='ghost'
																size='sm'
																onClick={() =>
																	removeItemFromOrder(item.product._id)
																}
																className='text-red-600 hover:text-red-700 p-1'
															>
																<Trash2 className='h-4 w-4' />
															</Button>
														</div>

														{/* Quantity controls */}
														<div className='flex items-center space-x-2'>
															<Button
																variant='outline'
																size='sm'
																onClick={() =>
																	updateItemQuantity(
																		item.product._id,
																		item.quantity - 1
																	)
																}
																disabled={item.quantity <= 1}
															>
																<Minus className='h-3 w-3' />
															</Button>
															<span className='text-sm font-medium w-8 text-center'>
																{item.quantity}
															</span>
															<Button
																variant='outline'
																size='sm'
																onClick={() =>
																	updateItemQuantity(
																		item.product._id,
																		item.quantity + 1
																	)
																}
															>
																<Plus className='h-3 w-3' />
															</Button>
														</div>

														{/* Item notes */}
														<div>
															<Input
																placeholder='Item notes (optional)'
																value={item.notes || ''}
																onChange={e =>
																	updateItemNotes(
																		item.product._id,
																		e.target.value
																	)
																}
																className='text-sm'
															/>
														</div>

														{/* Item total */}
														<div className='text-right'>
															<p className='text-sm font-medium'>
																{formatKRW(item.quantity * item.product.price)}
															</p>
														</div>
													</div>
												))}
											</div>
										)}
									</div>

									{/* Order Notes */}
									<div>
										<Label htmlFor='order-notes'>Order Notes (Optional)</Label>
										<textarea
											id='order-notes'
											placeholder='Add any special instructions or notes...'
											value={orderNotes}
											onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
												setOrderNotes(e.target.value)
											}
											rows={3}
											className='flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
										/>
									</div>

									{/* Order Totals */}
									{orderItems.length > 0 && (
										<div className='border-t pt-4 space-y-2'>
											<div className='flex justify-between text-sm'>
												<span>Total Items:</span>
												<span className='font-medium'>{getTotalItems()}</span>
											</div>
											<div className='flex justify-between text-base font-medium'>
												<span>Total Value:</span>
												<span className='text-lg'>
													{formatKRW(getTotalValue())}
												</span>
											</div>
										</div>
									)}

									{/* Submit Button */}
									<Button
										onClick={handleSubmitOrder}
										disabled={orderItems.length === 0 || submitting}
										className='w-full'
									>
										{submitting ? (
											<>
												<div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
												Creating Order...
											</>
										) : (
											<>
												<Check className='h-4 w-4 mr-2' />
												Create Order
											</>
										)}
									</Button>
								</CardContent>
							</Card>
						</div>
					</div>
				</div>
			</DashboardLayout>
		</ProtectedRoute>
	)
}

export default NewOrder
