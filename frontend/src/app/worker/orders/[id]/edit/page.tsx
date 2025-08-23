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
import { ordersApi, productsApi, usersApi } from '@/lib/api'
import { Order, Product } from '@/types'
import {
	AlertCircle,
	ArrowLeft,
	Check,
	Minus,
	Package,
	Plus,
	Save,
	Search,
	Trash2,
	X,
} from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import React, { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

// Order item interface
interface OrderItem {
	product: Product
	quantity: number
}

const EditOrder: React.FC = () => {
	const { user } = useAuth()
	const params = useParams()
	const router = useRouter()

	// Original order data
	const [originalOrder, setOriginalOrder] = useState<Order | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')

	// Form state
	const [products, setProducts] = useState<Product[]>([])
	const [branches, setBranches] = useState<string[]>([])
	const [selectedBranch, setSelectedBranch] = useState('')
	const [requestedDate, setRequestedDate] = useState('')
	const [orderItems, setOrderItems] = useState<OrderItem[]>([])
	const [orderNotes, setOrderNotes] = useState('')
	const [searchTerm, setSearchTerm] = useState('')
	const [submitting, setSubmitting] = useState(false)
	const [showAllProducts, setShowAllProducts] = useState(false)

	// Fetch original order data
	useEffect(() => {
		const fetchOrder = async () => {
			try {
				setLoading(true)
				const orderId = params.id as string
				const response = await ordersApi.getOrder(orderId)
				const order = response.order

				// Check if order can be edited
				if (order.status !== 'pending') {
					setError('Only pending orders can be edited')
					return
				}

				// Check if user owns the order
				if (order.worker._id !== user?.id) {
					setError('You can only edit your own orders')
					return
				}

				setOriginalOrder(order)

				// Pre-fill form with order data
				setSelectedBranch(order.branch)
				setRequestedDate(order.requestedDate.split('T')[0])
				setOrderNotes(order.notes || '')

				// Convert order items to form format (skip items with deleted products)
				const formItems: OrderItem[] = order.items
					.filter(item => item.product !== null)
					.map(item => ({
						product: item.product!,
						quantity: item.quantity,
					}))
				setOrderItems(formItems)
			} catch (err) {
				setError('Failed to load order details')
				console.error('Order fetch error:', err)
			} finally {
				setLoading(false)
			}
		}

		if (params.id) {
			fetchOrder()
		}
	}, [params.id, user])

	// Fetch products and branches
	useEffect(() => {
		const fetchData = async () => {
			try {
				const [productsResponse, branchesResponse] = await Promise.all([
					productsApi.getProducts({ active: 'true' }),
					usersApi.getBranches(),
				])

				setProducts(productsResponse.products)
				setBranches(branchesResponse.branches)
			} catch (err) {
				console.error('Error fetching data:', err)
				setError('Failed to load products and branches')
			}
		}

		fetchData()
	}, [])

	// Filter products based on search
	const filteredProducts = products.filter(
		product =>
			product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			product.category.toLowerCase().includes(searchTerm.toLowerCase())
	)

	// Group products by category
	const productsByCategory = products.reduce((acc, product) => {
		if (!acc[product.category]) {
			acc[product.category] = []
		}
		acc[product.category].push(product)
		return acc
	}, {} as Record<string, Product[]>)

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
			toast.success(
				`Increased ${product.name} quantity to ${existingItem.quantity + 1}`
			)
		} else {
			setOrderItems(prev => [...prev, { product, quantity: 1, notes: '' }])
			toast.success(`Added ${product.name} to your order`)
		}
		setSearchTerm('')
	}

	// Update item quantity
	const updateItemQuantity = (productId: string, quantity: number) => {
		if (quantity <= 0) {
			removeItemFromOrder(productId)
		} else {
			setOrderItems(prev =>
				prev.map(item =>
					item.product._id === productId ? { ...item, quantity } : item
				)
			)
		}
	}

	// Update item notes

	// Remove item from order
	const removeItemFromOrder = (productId: string) => {
		setOrderItems(prev => prev.filter(item => item.product._id !== productId))
	}

	// Map legacy categories to display names
	const getCategoryDisplayName = (category: string): string => {
		const categoryMap: Record<string, string> = {
			// Legacy categories mapping
			food: 'Main Products',
			beverages: 'Desserts and Drinks',
			cleaning: 'Cleaning Materials',
			equipment: 'Packaging Materials',
			packaging: 'Packaging Materials',
			other: 'Main Products',
		}
		return categoryMap[category] || category
	}

	// Get current quantity for a product in the order
	const getProductQuantity = (productId: string): number => {
		const item = orderItems.find(item => item.product._id === productId)
		return item ? item.quantity : 0
	}

	// Clear all items
	const clearOrder = () => {
		if (confirm('Are you sure you want to clear all items from this order?')) {
			setOrderItems([])
		}
	}

	// Check if form has changes
	const hasChanges = useCallback(() => {
		if (!originalOrder) return false

		// Check basic fields
		if (selectedBranch !== originalOrder.branch) return true
		if (requestedDate !== originalOrder.requestedDate.split('T')[0]) return true
		if (orderNotes !== (originalOrder.notes || '')) return true

		// Check items
		if (orderItems.length !== originalOrder.items.length) return true

		for (let i = 0; i < orderItems.length; i++) {
			const formItem = orderItems[i]
			const originalItem = originalOrder.items.find(
				item => item.product?._id === formItem.product._id
			)

			if (!originalItem) return true
			if (formItem.quantity !== originalItem.quantity) return true
			if ((formItem.notes || '') !== (originalItem.notes || '')) return true
		}

		return false
	}, [originalOrder, selectedBranch, requestedDate, orderNotes, orderItems])

	// Submit updated order
	const submitOrder = async () => {
		if (!originalOrder) return

		// Validation
		if (!selectedBranch) {
			setError('Please select a branch')
			return
		}

		if (!requestedDate) {
			setError('Please select a requested date')
			return
		}

		if (orderItems.length === 0) {
			setError('Please add at least one item to your order')
			return
		}

		try {
			setSubmitting(true)
			setError('')

			const orderData = {
				requestedDate,
				branch: selectedBranch,
				items: orderItems.map(item => ({
					product: item.product._id,
					quantity: item.quantity,
				})),
				notes: orderNotes || undefined,
			}

			await ordersApi.updateOrder(originalOrder._id, orderData)

			toast.success('Order updated successfully!')
			router.push('/worker/orders')
		} catch (err: unknown) {
			const errorMessage =
				err instanceof Error &&
				'response' in err &&
				typeof err.response === 'object' &&
				err.response !== null &&
				'data' in err.response &&
				typeof err.response.data === 'object' &&
				err.response.data !== null &&
				'message' in err.response.data
					? String(err.response.data.message)
					: 'Failed to update order'
			setError(errorMessage)
			toast.error(errorMessage)
		} finally {
			setSubmitting(false)
		}
	}

	if (loading) {
		return (
			<ProtectedRoute requiredRole='worker'>
				<DashboardLayout>
					<div className='flex items-center justify-center h-64'>
						<div className='text-center'>
							<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto'></div>
							<p className='mt-4 text-gray-600'>Loading order details...</p>
						</div>
					</div>
				</DashboardLayout>
			</ProtectedRoute>
		)
	}

	if (error && !originalOrder) {
		return (
			<ProtectedRoute requiredRole='worker'>
				<DashboardLayout>
					<div className='flex items-center justify-center h-64'>
						<div className='text-center'>
							<AlertCircle className='h-12 w-12 text-red-400 mx-auto mb-4' />
							<p className='text-red-600 mb-4'>{error}</p>
							<Link href='/worker/orders'>
								<Button variant='outline'>
									<ArrowLeft className='h-4 w-4 mr-2' />
									Back to Orders
								</Button>
							</Link>
						</div>
					</div>
				</DashboardLayout>
			</ProtectedRoute>
		)
	}

	return (
		<ProtectedRoute requiredRole='worker'>
			<DashboardLayout>
				<div className='space-y-4 sm:space-y-6'>
					{/* Header */}
					<div className='flex flex-col gap-3 sm:gap-4'>
						<div className='flex items-center space-x-3'>
							<Link href='/worker/orders'>
								<Button variant='outline' size='sm' className='h-8 sm:h-9'>
									<ArrowLeft className='h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2' />
									<span className='text-xs sm:text-sm'>Back</span>
								</Button>
							</Link>
							<div className='min-w-0 flex-1'>
								<h1 className='text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900 truncate'>
									Edit Order {originalOrder?.orderNumber}
								</h1>
								<p className='text-xs sm:text-sm lg:text-base text-gray-600 mt-0.5 sm:mt-1'>
									Modify your supply request
								</p>
							</div>
						</div>
						{hasChanges() && (
							<div className='flex justify-end'>
								<Button
									variant='outline'
									onClick={() => router.push('/worker/orders')}
									className='text-gray-600 hover:text-gray-700 h-8 sm:h-9 text-xs sm:text-sm px-3 sm:px-4'
								>
									<X className='h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2' />
									Cancel Changes
								</Button>
							</div>
						)}
					</div>

					{/* Error message */}
					{error && (
						<div className='bg-red-50 border border-red-200 rounded-md p-3'>
							<div className='flex'>
								<AlertCircle className='h-4 w-4 text-red-400 flex-shrink-0 mt-0.5' />
								<div className='ml-2'>
									<p className='text-xs sm:text-sm text-red-800'>{error}</p>
								</div>
							</div>
						</div>
					)}

					{/* Order Form */}
					<div className='grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6'>
						{/* Left Column - Product Selection */}
						<div className='xl:col-span-2 space-y-4'>
							{/* Product Search */}
							<Card>
								<CardHeader className='p-3 sm:p-4 lg:p-6'>
									<CardTitle className='text-base sm:text-lg lg:text-xl'>
										Add Products
									</CardTitle>
									<CardDescription className='text-xs sm:text-sm lg:text-base'>
										Search and add products to your order
									</CardDescription>
								</CardHeader>
								<CardContent className='p-3 sm:p-4 lg:p-6 pt-0'>
									<div className='relative'>
										<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3 sm:h-4 sm:w-4' />
										<Input
											placeholder='Search products...'
											value={searchTerm}
											onChange={e => setSearchTerm(e.target.value)}
											className='pl-8 sm:pl-10 h-9 sm:h-10 lg:h-11 text-xs sm:text-sm lg:text-base'
										/>
									</div>

									{/* Product Results */}
									{searchTerm && (
										<div className='mt-3 sm:mt-4 max-h-48 sm:max-h-60 overflow-y-auto border rounded-lg bg-white'>
											{filteredProducts.length === 0 ? (
												<div className='p-3 sm:p-4 text-center text-gray-500 text-xs sm:text-sm'>
													No products found matching &ldquo;{searchTerm}&rdquo;
												</div>
											) : (
												<div className='divide-y divide-gray-100'>
													{filteredProducts.slice(0, 10).map(product => (
														<div
															key={product._id}
															className='p-2 sm:p-3 hover:bg-gray-50 transition-colors'
														>
															<div className='flex items-center justify-between'>
																<div className='flex-1 min-w-0 pr-2'>
																	<p className='font-medium text-xs sm:text-sm truncate'>
																		{product.name}
																	</p>
																	<p className='text-xs text-gray-500 truncate'>
																		{getCategoryDisplayName(product.category)}
																	</p>
																</div>

																{/* Inline quantity controls */}
																<div className='flex items-center gap-1 flex-shrink-0'>
																	{getProductQuantity(product._id) > 0 ? (
																		<>
																			<Button
																				variant='outline'
																				size='sm'
																				onClick={() =>
																					updateItemQuantity(
																						product._id,
																						getProductQuantity(product._id) - 1
																					)
																				}
																				className='h-6 w-6 p-0 rounded-full'
																			>
																				<Minus className='h-3 w-3' />
																			</Button>
																			<span className='text-sm font-bold text-center min-w-[1.5rem] px-1'>
																				{getProductQuantity(product._id)}
																			</span>
																			<Button
																				variant='outline'
																				size='sm'
																				onClick={() =>
																					updateItemQuantity(
																						product._id,
																						getProductQuantity(product._id) + 1
																					)
																				}
																				className='h-6 w-6 p-0 rounded-full'
																			>
																				<Plus className='h-3 w-3' />
																			</Button>
																		</>
																	) : (
																		<Button
																			size='sm'
																			onClick={() => addProductToOrder(product)}
																			className='bg-green-600 hover:bg-green-700 text-white text-xs h-6 px-2'
																		>
																			<Plus className='h-3 w-3 mr-1' />
																			Add
																		</Button>
																	)}
																</div>
															</div>
														</div>
													))}
												</div>
											)}
										</div>
									)}

									{/* Browse All Products */}
									{!searchTerm && (
										<div className='mt-3 sm:mt-4'>
											<div className='flex items-center justify-between mb-3'>
												<h3 className='text-sm font-medium text-gray-700'>
													Browse Products
												</h3>
												<Button
													variant='ghost'
													size='sm'
													onClick={() => setShowAllProducts(!showAllProducts)}
													className='text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-xs h-7 px-2'
												>
													{showAllProducts
														? 'Hide Products'
														: 'Show All Products'}
												</Button>
											</div>

											{showAllProducts && (
												<div className='max-h-80 overflow-y-auto border rounded-lg bg-white'>
													{Object.entries(productsByCategory).map(
														([category, categoryProducts]) => (
															<div
																key={category}
																className='border-b border-gray-100 last:border-b-0'
															>
																<div className='bg-gray-50 px-3 py-2 border-b border-gray-100'>
																	<h4 className='text-xs font-semibold text-gray-700 uppercase tracking-wide'>
																		{category} ({categoryProducts.length})
																	</h4>
																</div>
																<div className='divide-y divide-gray-50'>
																	{categoryProducts.map(product => (
																		<div
																			key={product._id}
																			className='p-2 sm:p-3 hover:bg-gray-50 cursor-pointer transition-colors active:bg-gray-100'
																			onClick={() => addProductToOrder(product)}
																		>
																			<div className='flex items-center justify-between'>
																				<div className='flex-1 min-w-0 pr-2'>
																					<p className='font-medium text-xs sm:text-sm truncate'>
																						{product.name}
																					</p>
																					<p className='text-xs text-gray-500 truncate'>
																						{product.unit}
																						{product.description &&
																							` • ${product.description}`}
																					</p>
																				</div>
																				<Plus className='h-3 w-3 sm:h-4 sm:w-4 text-blue-600 flex-shrink-0' />
																			</div>
																		</div>
																	))}
																</div>
															</div>
														)
													)}
												</div>
											)}

											{!showAllProducts && (
												<div className='text-center py-4 text-gray-500 text-xs sm:text-sm border-2 border-dashed border-gray-200 rounded-lg'>
													<Package className='h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 text-gray-400' />
													<p className='font-medium'>
														Browse all available products
													</p>
													<p className='text-xs mt-1 text-gray-400'>
														Click &ldquo;Show All Products&rdquo; to see the
														complete catalog
													</p>
												</div>
											)}
										</div>
									)}
								</CardContent>
							</Card>
						</div>

						{/* Right Column - Order Details */}
						<div className='space-y-4'>
							{/* Order Settings */}
							<Card>
								<CardHeader className='p-3 sm:p-4 lg:p-6'>
									<CardTitle className='text-base sm:text-lg lg:text-xl'>
										Order Details
									</CardTitle>
									<CardDescription className='text-xs sm:text-sm lg:text-base'>
										Configure your order settings
									</CardDescription>
								</CardHeader>
								<CardContent className='p-3 sm:p-4 lg:p-6 pt-0 space-y-3 sm:space-y-4'>
									{/* Branch Selection */}
									<div>
										<Label
											htmlFor='branch'
											className='text-xs sm:text-sm font-medium text-gray-700 block mb-1'
										>
											Branch *
										</Label>
										<Select
											value={selectedBranch}
											onValueChange={setSelectedBranch}
										>
											<SelectTrigger className='h-9 sm:h-10 lg:h-11'>
												<SelectValue placeholder='Select branch' />
											</SelectTrigger>
											<SelectContent>
												{branches.map(branch => (
													<SelectItem key={branch} value={branch}>
														{branch}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>

									{/* Requested Date */}
									<div>
										<Label
											htmlFor='requested-date'
											className='text-xs sm:text-sm font-medium text-gray-700 block mb-1'
										>
											Requested Date *
										</Label>
										<Input
											id='requested-date'
											type='date'
											value={requestedDate}
											onChange={e => setRequestedDate(e.target.value)}
											min={new Date().toISOString().split('T')[0]}
											className='h-9 sm:h-10 lg:h-11'
										/>
									</div>

									{/* Order Items Summary */}
									<div>
										<div className='flex items-center justify-between mb-2'>
											<Label className='text-xs sm:text-sm font-medium text-gray-700'>
												Order Items ({orderItems.length})
											</Label>
											{orderItems.length > 0 && (
												<Button
													variant='ghost'
													size='sm'
													onClick={clearOrder}
													className='text-red-600 hover:text-red-700 hover:bg-red-50 text-xs h-6 px-2'
												>
													<Trash2 className='h-3 w-3 mr-1' />
													Clear
												</Button>
											)}
										</div>

										{orderItems.length === 0 ? (
											<div className='text-center py-4 sm:py-6 text-gray-500 text-xs sm:text-sm border-2 border-dashed border-gray-200 rounded-lg'>
												<Package className='h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 text-gray-400' />
												<p className='font-medium'>No items added yet</p>
												<p className='text-xs mt-1 text-gray-400'>
													Search for products above
												</p>
											</div>
										) : (
											<div className='bg-gray-50 rounded-lg p-2 border'>
												<div className='space-y-2 max-h-[260px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100'>
													{orderItems.map(item => (
														<div
															key={item.product._id}
															className='p-2 bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow'
														>
															{/* Compact single-line layout */}
															<div className='flex items-center gap-2'>
																{/* Product info */}
																<div className='flex-1 min-w-0'>
																	<p className='font-semibold text-sm text-gray-900 truncate'>
																		{item.product.name}
																	</p>
																	<p className='text-xs text-gray-500 truncate'>
																		{getCategoryDisplayName(
																			item.product.category
																		)}
																	</p>
																</div>

																{/* Inline quantity controls */}
																<div className='flex items-center gap-1'>
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
																		className='h-6 w-6 p-0 rounded-full'
																	>
																		<Minus className='h-3 w-3' />
																	</Button>
																	<span className='text-sm font-bold text-center min-w-[2rem] px-1'>
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
																		className='h-6 w-6 p-0 rounded-full'
																	>
																		<Plus className='h-3 w-3' />
																	</Button>
																</div>

																{/* Unit display */}
																<span className='text-sm font-medium text-blue-600 min-w-[3rem] text-right'>
																	{item.product.unit}
																</span>

																{/* Remove button */}
																<Button
																	variant='ghost'
																	size='sm'
																	onClick={() =>
																		removeItemFromOrder(item.product._id)
																	}
																	className='text-red-500 hover:text-red-700 hover:bg-red-50 h-6 w-6 p-0'
																	title='Remove item'
																>
																	<X className='h-3 w-3' />
																</Button>
															</div>
														</div>
													))}
												</div>
												{orderItems.length > 5 && (
													<div className='text-center pt-2 border-t border-gray-200 mt-2'>
														<p className='text-xs text-gray-500'>
															Showing 5 of {orderItems.length} items - scroll to
															see more
														</p>
													</div>
												)}
											</div>
										)}
									</div>

									{/* Order Notes */}
									<div>
										<Label
											htmlFor='order-notes'
											className='text-xs sm:text-sm font-medium text-gray-700 block mb-1'
										>
											Order Notes (Optional)
										</Label>
										<textarea
											id='order-notes'
											placeholder='Add any special instructions or notes...'
											value={orderNotes}
											onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
												setOrderNotes(e.target.value)
											}
											rows={3}
											className='flex min-h-[60px] sm:min-h-[80px] w-full rounded-md border border-input bg-background px-2 sm:px-3 py-2 text-xs sm:text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
										/>
									</div>

									{/* Submit Button */}
									<Button
										onClick={submitOrder}
										disabled={
											submitting || !hasChanges() || orderItems.length === 0
										}
										className='w-full h-9 sm:h-10 lg:h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm hover:shadow-md transition-all duration-200 text-xs sm:text-sm lg:text-base'
									>
										{submitting ? (
											<>
												<div className='animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white mr-2'></div>
												<span className='text-xs sm:text-sm'>Updating...</span>
											</>
										) : (
											<>
												<Save className='h-3 w-3 sm:h-4 sm:w-4 mr-2' />
												<span className='text-xs sm:text-sm lg:text-base'>
													Update Order
												</span>
											</>
										)}
									</Button>

									{!hasChanges() && orderItems.length > 0 && (
										<p className='text-xs text-gray-500 text-center'>
											<Check className='h-3 w-3 inline mr-1' />
											No changes to save
										</p>
									)}
								</CardContent>
							</Card>
						</div>
					</div>
				</div>
			</DashboardLayout>
		</ProtectedRoute>
	)
}

export default EditOrder
