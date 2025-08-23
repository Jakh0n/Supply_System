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
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ProductThumbnail } from '@/components/ui/ProductImage'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { useAuth } from '@/contexts/AuthContext'
import { branchesApi, ordersApi, productsApi } from '@/lib/api'
import { getPrimaryImage } from '@/lib/imageUtils'
import { Product, ProductCategory } from '@/types'
import {
	AlertCircle,
	Calendar,
	Check,
	CheckCircle,
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
}

// Branch interface
interface Branch {
	name: string
	activeWorkers: number
	totalOrders: number
	pendingOrders: number
}

const NewOrder: React.FC = () => {
	const { user } = useAuth()
	const router = useRouter()
	const [products, setProducts] = useState<Product[]>([])
	const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
	const [branches, setBranches] = useState<Branch[]>([])
	const [selectedBranch, setSelectedBranch] = useState<string>('')
	const [loading, setLoading] = useState(true)
	const [branchesLoading, setBranchesLoading] = useState(true)
	const [error, setError] = useState('')
	const [searchTerm, setSearchTerm] = useState('')
	const [categoryFilter, setCategoryFilter] = useState<ProductCategory | 'all'>(
		'all'
	)
	const [orderItems, setOrderItems] = useState<OrderItem[]>([])
	const [requestedDate, setRequestedDate] = useState(getTomorrowDate())
	const [orderNotes, setOrderNotes] = useState('')
	const [submitting, setSubmitting] = useState(false)
	const [showSuggestionsModal, setShowSuggestionsModal] = useState(false)
	const [suggestedProducts, setSuggestedProducts] = useState<Product[]>([])
	const [modalSearchTerm, setModalSearchTerm] = useState('')
	const [modalQuantities, setModalQuantities] = useState<{
		[key: string]: number
	}>({})

	// Fetch branches
	const fetchBranches = useCallback(async () => {
		try {
			setBranchesLoading(true)
			const response = await branchesApi.getBranchNames()
			setBranches(response.branches || [])

			// Set default branch to user's assigned branch if they have one
			if (user?.branch) {
				setSelectedBranch(user.branch)
			}
		} catch (err) {
			console.error('Failed to fetch branches:', err)
			setBranches([]) // No fallback branches - use empty array
			toast.error('Failed to load branches. Please try again.')
		} finally {
			setBranchesLoading(false)
		}
	}, [user?.branch])

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
		fetchBranches()
		fetchProducts()
	}, [fetchBranches, fetchProducts])

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

	// Remove item from order
	const removeItemFromOrder = (productId: string) => {
		setOrderItems(prev => prev.filter(item => item.product._id !== productId))
	}

	// Get current quantity for a product in the order
	const getProductQuantity = (productId: string): number => {
		const item = orderItems.find(item => item.product._id === productId)
		return item ? item.quantity : 0
	}

	// Clear entire order
	const clearOrder = () => {
		setOrderItems([])
		setRequestedDate(getTomorrowDate())
		setOrderNotes('')
		setSelectedBranch(user?.branch || '')
		toast.success('Order cleared')
	}

	// Get suggested products (products not yet added to order)
	const getSuggestedProducts = () => {
		const addedProductIds = orderItems.map(item => item.product._id)
		return products.filter(product => !addedProductIds.includes(product._id))
	}

	// getPrimaryImage function is now imported from imageUtils

	// Handle showing suggestions modal
	const handleShowSuggestions = () => {
		if (orderItems.length === 0) {
			toast.error('Please add at least one item to your order')
			return
		}

		if (!selectedBranch) {
			toast.error('Please select a branch for this order')
			return
		}

		if (!requestedDate) {
			toast.error('Please select a requested date')
			return
		}

		const suggestions = getSuggestedProducts()
		setSuggestedProducts(suggestions)
		setModalSearchTerm('')
		setShowSuggestionsModal(true)

		// Initialize quantities for suggested products
		const initialQuantities: { [key: string]: number } = {}
		suggestions.forEach(product => {
			initialQuantities[product._id] = 1
		})
		setModalQuantities(initialQuantities)
	}

	// Modal quantity control functions
	const updateModalQuantity = (productId: string, quantity: number) => {
		if (quantity < 1) return
		setModalQuantities(prev => ({
			...prev,
			[productId]: quantity,
		}))
	}

	const addProductFromModal = (product: Product) => {
		const quantity = modalQuantities[product._id] || 1

		// Add the product with the specified quantity
		const newOrderItem: OrderItem = {
			product,
			quantity,
		}

		setOrderItems(prev => {
			const existingItemIndex = prev.findIndex(
				item => item.product._id === product._id
			)

			if (existingItemIndex >= 0) {
				// Update existing item
				const updated = [...prev]
				updated[existingItemIndex].quantity += quantity
				return updated
			} else {
				// Add new item
				return [...prev, newOrderItem]
			}
		})

		// Remove from suggested products
		setSuggestedProducts(prev => prev.filter(p => p._id !== product._id))

		toast.success(`Added ${quantity} ${product.unit} of ${product.name}`)
	}

	// Submit order directly (called from modal or when skipping suggestions)
	const submitOrderDirectly = async () => {
		try {
			setSubmitting(true)
			setShowSuggestionsModal(false)

			const orderData = {
				requestedDate,
				branch: selectedBranch,
				items: orderItems.map(item => ({
					product: item.product._id,
					quantity: item.quantity,
				})),
				notes: orderNotes || undefined,
			}

			console.log('=== FRONTEND ORDER SUBMISSION DEBUG ===')
			console.log('Order data being sent:', JSON.stringify(orderData, null, 2))
			console.log('Selected branch:', selectedBranch)
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

	// Submit order (show suggestions first)
	const handleSubmitOrder = async () => {
		handleShowSuggestions()
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
				<div className='space-y-4 sm:space-y-6'>
					{/* Header */}
					<div className='flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4'>
						<div>
							<h1 className='text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900'>
								Create New Order
							</h1>
							<p className='mt-1 sm:mt-2 text-sm sm:text-base text-gray-600'>
								Submit a new supply request for any branch
							</p>
						</div>
						<div className='flex flex-col sm:flex-row gap-2 sm:gap-3'>
							{orderItems.length > 0 && (
								<Button
									variant='outline'
									onClick={clearOrder}
									className='text-red-600 hover:text-red-700 h-9 sm:h-10 text-sm'
								>
									<Trash2 className='h-4 w-4 mr-2' />
									Clear Order
								</Button>
							)}
							<Button
								variant='outline'
								onClick={() => router.push('/worker/orders')}
								className='h-9 sm:h-10 text-sm'
							>
								<X className='h-4 w-4 mr-2' />
								Cancel
							</Button>
						</div>
					</div>

					{/* Error message */}
					{error && (
						<div className='bg-red-50 border border-red-200 rounded-md p-3 sm:p-4'>
							<div className='flex'>
								<AlertCircle className='h-4 w-4 sm:h-5 sm:w-5 text-red-400 flex-shrink-0 mt-0.5' />
								<div className='ml-3'>
									<p className='text-sm text-red-800'>{error}</p>
								</div>
							</div>
						</div>
					)}

					<div className='grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6'>
						{/* Product Selection */}
						<div className='lg:col-span-2 order-2 lg:order-1'>
							<Card>
								<CardHeader className='p-4 sm:p-6'>
									<CardTitle className='text-lg sm:text-xl'>
										Select Products
									</CardTitle>
									<CardDescription className='text-sm'>
										Choose items for your supply request
									</CardDescription>
								</CardHeader>
								<CardContent className='p-4 sm:p-6 pt-0'>
									{/* Search and Filter */}
									<div className='flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-6'>
										<div className='w-full'>
											<div className='relative'>
												<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
												<Input
													placeholder='Search products...'
													value={searchTerm}
													onChange={e => setSearchTerm(e.target.value)}
													className='pl-10 h-9 sm:h-10 text-sm'
												/>
											</div>
										</div>
										<div className='w-full sm:w-auto'>
											<Select
												value={categoryFilter}
												onValueChange={(value: ProductCategory | 'all') =>
													setCategoryFilter(value)
												}
											>
												<SelectTrigger className='w-full h-9 sm:h-10 text-sm'>
													<SelectValue placeholder='All categories' />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value='all'>All Categories</SelectItem>
													<SelectItem value='frozen-products'>
														Frozen Products
													</SelectItem>
													<SelectItem value='main-products'>
														Main Products
													</SelectItem>
													<SelectItem value='desserts-drinks'>
														Desserts and Drinks
													</SelectItem>
													<SelectItem value='packaging-materials'>
														Packaging Materials
													</SelectItem>
													<SelectItem value='cleaning-materials'>
														Cleaning Materials
													</SelectItem>
												</SelectContent>
											</Select>
										</div>
									</div>

									{/* Products Display */}
									{filteredProducts.length === 0 ? (
										<div className='text-center py-8 sm:py-12'>
											<Package className='h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-3 sm:mb-4' />
											<h3 className='text-base sm:text-lg font-medium text-gray-900 mb-2'>
												No products found
											</h3>
											<p className='text-sm text-gray-500'>
												{searchTerm || categoryFilter !== 'all'
													? 'Try adjusting your search or filter'
													: 'No products available'}
											</p>
										</div>
									) : (
										<>
											{/* Mobile Card View */}
											<div className='block sm:hidden space-y-3 max-h-80 overflow-y-auto'>
												{filteredProducts.map(product => (
													<div
														key={product._id}
														className='border rounded-lg p-3 hover:bg-gray-50 transition-colors'
													>
														<div className='flex items-start justify-between mb-2'>
															<div className='flex items-start flex-1 min-w-0'>
																<div className='w-10 h-10 flex-shrink-0 mr-3'>
																	<ProductThumbnail
																		src={getPrimaryImage(product)}
																		alt={product.name}
																		category={product.category}
																		size='sm'
																		priority={false}
																	/>
																</div>
																<div className='min-w-0 flex-1'>
																	<p className='font-medium text-sm text-gray-900 mb-1 line-clamp-2'>
																		{product.name}
																	</p>
																	{product.description && (
																		<p className='text-xs text-gray-500 line-clamp-2 mb-2'>
																			{product.description}
																		</p>
																	)}
																	<div className='flex items-center gap-2 mb-2'>
																		<span className='inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800'>
																			{getCategoryDisplayName(product.category)}
																		</span>
																		<span className='text-xs text-gray-600 font-medium'>
																			{product.unit}
																		</span>
																	</div>
																</div>
															</div>
														</div>
														{/* Inline quantity controls */}
														<div className='flex items-center justify-center gap-1 w-full'>
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
																		className='h-7 w-7 p-0 rounded-full'
																	>
																		<Minus className='h-3 w-3' />
																	</Button>
																	<span className='text-sm font-bold text-center min-w-[2rem] px-1'>
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
																		className='h-7 w-7 p-0 rounded-full'
																	>
																		<Plus className='h-3 w-3' />
																	</Button>
																</>
															) : (
																<Button
																	size='sm'
																	onClick={() => addProductToOrder(product)}
																	className='w-full bg-green-600 hover:bg-green-700 text-white h-7 text-xs'
																>
																	<Plus className='h-3 w-3 mr-1' />
																	Add
																</Button>
															)}
														</div>
													</div>
												))}
											</div>

											{/* Desktop Table View */}
											<div className='hidden sm:block overflow-x-auto max-h-96 overflow-y-auto border rounded-lg'>
												<table className='w-full table-fixed'>
													<thead className='bg-gray-50 sticky top-0'>
														<tr className='border-b'>
															<th className='text-left p-3 font-medium text-gray-700 text-sm w-1/2'>
																Product
															</th>
															<th className='text-left p-3 font-medium text-gray-700 text-sm w-1/4'>
																Category
															</th>
															<th className='text-left p-3 font-medium text-gray-700 text-sm w-1/6'>
																Unit
															</th>
															<th className='text-right p-3 font-medium text-gray-700 text-sm w-1/6'>
																Action
															</th>
														</tr>
													</thead>
													<tbody>
														{filteredProducts.map(product => (
															<tr
																key={product._id}
																className='border-b hover:bg-gray-50 transition-colors'
															>
																<td className='p-3'>
																	<div className='flex items-start'>
																		<div className='w-10 h-10 flex-shrink-0 mr-3'>
																			<ProductThumbnail
																				src={getPrimaryImage(product)}
																				alt={product.name}
																				category={product.category}
																				size='sm'
																				priority={false}
																			/>
																		</div>
																		<div className='min-w-0 flex-1'>
																			<p className='font-medium text-sm text-gray-900 mb-1 truncate'>
																				{product.name}
																			</p>
																			{product.description && (
																				<div className='group relative'>
																					<p className='text-xs text-gray-500 line-clamp-2 leading-relaxed'>
																						{product.description}
																					</p>
																					{product.description.length > 80 && (
																						<div className='absolute left-0 top-full mt-1 hidden group-hover:block z-10 bg-gray-900 text-white text-xs p-2 rounded-md shadow-lg max-w-xs'>
																							{product.description}
																							<div className='absolute -top-1 left-4 w-2 h-2 bg-gray-900 rotate-45'></div>
																						</div>
																					)}
																				</div>
																			)}
																		</div>
																	</div>
																</td>
																<td className='p-3'>
																	<span className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 truncate'>
																		{getCategoryDisplayName(product.category)}
																	</span>
																</td>
																<td className='p-3 text-sm text-gray-600 font-medium truncate'>
																	{product.unit}
																</td>
																<td className='p-3 text-right'>
																	{/* Inline quantity controls */}
																	<div className='flex items-center justify-end gap-1'>
																		{getProductQuantity(product._id) > 0 ? (
																			<>
																				<Button
																					variant='outline'
																					size='sm'
																					onClick={() =>
																						updateItemQuantity(
																							product._id,
																							getProductQuantity(product._id) -
																								1
																						)
																					}
																					className='h-7 w-7 p-0 rounded-full'
																				>
																					<Minus className='h-3 w-3' />
																				</Button>
																				<span className='text-sm font-bold text-center min-w-[2rem] px-1'>
																					{getProductQuantity(product._id)}
																				</span>
																				<Button
																					variant='outline'
																					size='sm'
																					onClick={() =>
																						updateItemQuantity(
																							product._id,
																							getProductQuantity(product._id) +
																								1
																						)
																					}
																					className='h-7 w-7 p-0 rounded-full'
																				>
																					<Plus className='h-3 w-3' />
																				</Button>
																			</>
																		) : (
																			<Button
																				size='sm'
																				onClick={() =>
																					addProductToOrder(product)
																				}
																				className='bg-green-600 hover:bg-green-700 text-white text-xs h-7'
																			>
																				<Plus className='h-3 w-3 mr-1' />
																				Add
																			</Button>
																		)}
																	</div>
																</td>
															</tr>
														))}
													</tbody>
												</table>
											</div>
										</>
									)}
								</CardContent>
							</Card>
						</div>

						{/* Order Summary */}
						<div className='order-1 lg:order-2'>
							<Card className='sticky top-4 sm:top-6 shadow-lg border-2'>
								<CardHeader className='bg-gradient-to-r from-blue-50 to-indigo-50 border-b p-4 sm:p-6'>
									<CardTitle className='flex items-center text-base sm:text-lg'>
										<ShoppingCart className='h-4 w-4 sm:h-5 sm:w-5 mr-2 text-blue-600' />
										Order Summary
									</CardTitle>
									<CardDescription className='text-xs sm:text-sm'>
										Review your order details before submitting
									</CardDescription>
								</CardHeader>
								<CardContent className='space-y-4 sm:space-y-6 p-4 sm:p-6'>
									{/* Branch Selection */}
									<div className='space-y-2'>
										<Label
											htmlFor='branch-select'
											className='text-xs sm:text-sm font-semibold text-gray-700 flex items-center'
										>
											<Package className='h-3 w-3 sm:h-4 sm:w-4 mr-2 text-gray-500' />
											Delivery Branch
										</Label>
										<Select
											value={selectedBranch}
											onValueChange={setSelectedBranch}
											disabled={branchesLoading}
										>
											<SelectTrigger className='h-9 sm:h-11 border-2 focus:border-blue-500 text-sm'>
												<SelectValue
													placeholder={
														branchesLoading
															? 'Loading branches...'
															: 'Select delivery branch'
													}
												/>
											</SelectTrigger>
											<SelectContent>
												{branches.map(branch => (
													<SelectItem key={branch.name} value={branch.name}>
														<div className='flex items-center'>
															<div className='w-2 h-2 bg-green-500 rounded-full mr-2'></div>
															<span className='text-sm'>{branch.name}</span>
														</div>
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>

									{/* Order Date */}
									<div className='space-y-2'>
										<Label
											htmlFor='requested-date'
											className='text-xs sm:text-sm font-semibold text-gray-700 flex items-center'
										>
											<Calendar className='h-3 w-3 sm:h-4 sm:w-4 mr-2 text-gray-500' />
											Requested Delivery Date
										</Label>
										<div className='relative'>
											<Calendar className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3 sm:h-4 sm:w-4' />
											<Input
												id='requested-date'
												type='date'
												value={requestedDate}
												onChange={e => setRequestedDate(e.target.value)}
												min={getTomorrowDate()}
												className='pl-9 sm:pl-10 h-9 sm:h-11 border-2 focus:border-blue-500 text-sm'
											/>
										</div>
										<p className='text-xs text-gray-500 mt-1'>
											Orders must be placed at least 1 day in advance
										</p>
									</div>

									{/* Order Items */}
									<div className='space-y-3'>
										<div className='flex items-center justify-between'>
											<Label className='text-xs sm:text-sm font-semibold text-gray-700 flex items-center'>
												<ShoppingCart className='h-3 w-3 sm:h-4 sm:w-4 mr-2 text-gray-500' />
												Order Items
											</Label>
											<div className='flex items-center space-x-2'>
												<span className='bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full'>
													{orderItems.length}{' '}
													{orderItems.length === 1 ? 'item' : 'items'}
												</span>
											</div>
										</div>

										{orderItems.length === 0 ? (
											<div className='text-center py-6 sm:py-8 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200'>
												<ShoppingCart className='h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-2 sm:mb-3 text-gray-300' />
												<p className='text-xs sm:text-sm font-medium text-gray-600 mb-1'>
													No items added yet
												</p>
												<p className='text-xs text-gray-500'>
													Start by selecting products
												</p>
											</div>
										) : (
											<div className='bg-gray-50 rounded-lg p-2 border'>
												<div className='space-y-2 max-h-[260px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100'>
													{orderItems.map(item => (
														<div
															key={item.product._id}
															className='bg-white border rounded-lg p-2 shadow-sm hover:shadow-md transition-shadow'
														>
															<div className='flex items-center gap-2'>
																{/* Product thumbnail */}
																<div className='w-8 h-8 flex-shrink-0'>
																	<ProductThumbnail
																		src={getPrimaryImage(item.product)}
																		alt={item.product.name}
																		category={item.product.category}
																		size='sm'
																		priority={false}
																	/>
																</div>

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
																	<Trash2 className='h-3 w-3' />
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

									{/* Order Notes - Simple */}
									<div>
										<Label
											htmlFor='order-notes'
											className='text-xs sm:text-sm font-medium text-gray-700'
										>
											Order Notes (Optional)
										</Label>
										<textarea
											id='order-notes'
											placeholder='Add any notes for this order...'
											value={orderNotes}
											onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
												setOrderNotes(e.target.value)
											}
											rows={2}
											className='flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-xs sm:text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 mt-1'
										/>
									</div>

									{/* Submit Button */}
									<div className='pt-3 sm:pt-4 border-t border-gray-200'>
										<Button
											onClick={handleSubmitOrder}
											disabled={
												!selectedBranch ||
												!requestedDate ||
												orderItems.length === 0 ||
												submitting
											}
											className='w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:from-gray-400 disabled:to-gray-500 disabled:shadow-none text-sm'
										>
											{submitting ? (
												<div className='flex items-center justify-center space-x-2'>
													<div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
													<span>Submitting Order...</span>
												</div>
											) : (
												<div className='flex items-center justify-center space-x-2'>
													<Check className='h-4 w-4 sm:h-5 sm:w-5' />
													<span>Submit Order Request</span>
												</div>
											)}
										</Button>

										{/* Helper text */}
										<div className='mt-2 sm:mt-3 text-center'>
											{!selectedBranch ||
											!requestedDate ||
											orderItems.length === 0 ? (
												<p className='text-xs text-gray-500 flex items-center justify-center space-x-1'>
													<AlertCircle className='h-3 w-3' />
													<span>
														{!selectedBranch
															? 'Please select a delivery branch'
															: !requestedDate
															? 'Please select a delivery date'
															: 'Please add at least one item to continue'}
													</span>
												</p>
											) : (
												<p className='text-xs text-green-600 flex items-center justify-center space-x-1'>
													<CheckCircle className='h-3 w-3' />
													<span>Ready to submit your order</span>
												</p>
											)}
										</div>
									</div>
								</CardContent>
							</Card>
						</div>
					</div>
				</div>

				{/* Suggestions Modal */}
				<Dialog
					open={showSuggestionsModal}
					onOpenChange={setShowSuggestionsModal}
				>
					<DialogContent className='w-full max-w-[95vw] sm:max-w-2xl lg:max-w-4xl h-[90vh] sm:h-[85vh] overflow-hidden flex flex-col mx-2 sm:mx-auto'>
						<DialogHeader className='p-3 sm:p-4 lg:p-6 pb-3 sm:pb-4 border-b flex-shrink-0'>
							<DialogTitle className='flex items-center text-sm sm:text-base lg:text-lg font-semibold'>
								<Package className='h-4 w-4 sm:h-5 sm:w-5 mr-2 text-blue-600 flex-shrink-0' />
								<span className='truncate'>
									Any items you might have forgotten?
								</span>
							</DialogTitle>
							<DialogDescription className='text-xs sm:text-sm text-gray-600 mt-1'>
								Add any missing items before submitting your order.
							</DialogDescription>
						</DialogHeader>

						<div className='flex-1 overflow-hidden flex flex-col p-3 sm:p-4 lg:p-6 pt-0 min-h-0'>
							{/* Search for suggested products */}
							<div className='relative mb-3 sm:mb-4 flex-shrink-0'>
								<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
								<Input
									placeholder='Search products...'
									value={modalSearchTerm}
									onChange={e => setModalSearchTerm(e.target.value)}
									className='pl-10 h-9 sm:h-10 text-sm border-gray-300 focus:border-blue-500'
								/>
							</div>

							{/* Suggested Products List */}
							<div className='flex-1 overflow-y-auto border rounded-lg bg-gray-50 min-h-0'>
								{(() => {
									const filteredSuggestions = suggestedProducts.filter(
										product =>
											product.name
												.toLowerCase()
												.includes(modalSearchTerm.toLowerCase()) ||
											product.description
												?.toLowerCase()
												.includes(modalSearchTerm.toLowerCase())
									)

									if (filteredSuggestions.length === 0) {
										return (
											<div className='flex flex-col items-center justify-center h-full py-8 sm:py-12 text-center'>
												<Package className='h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mb-3 sm:mb-4' />
												<h3 className='text-sm sm:text-base font-medium text-gray-900 mb-1 sm:mb-2'>
													{modalSearchTerm
														? 'No matching products found'
														: 'All products added!'}
												</h3>
												<p className='text-xs sm:text-sm text-gray-500 px-4'>
													{modalSearchTerm
														? 'Try a different search term'
														: 'You have added all available products to your order'}
												</p>
											</div>
										)
									}

									return (
										<div className='p-2 sm:p-3 space-y-2'>
											{filteredSuggestions.slice(0, 8).map(product => (
												<div
													key={product._id}
													className='bg-white border rounded-lg p-3 hover:bg-gray-50 transition-colors'
												>
													{/* Mobile Layout */}
													<div className='block sm:hidden'>
														<div className='flex items-start mb-2'>
															<div className='w-10 h-10 flex-shrink-0 mr-3'>
																<ProductThumbnail
																	src={getPrimaryImage(product)}
																	alt={product.name}
																	category={product.category}
																	size='sm'
																	priority={false}
																/>
															</div>
															<div className='flex-1 min-w-0'>
																<p className='font-medium text-sm text-gray-900 mb-1 line-clamp-2'>
																	{product.name}
																</p>
																<div className='flex items-center gap-2 mb-2'>
																	<span className='inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800'>
																		{getCategoryDisplayName(product.category)}
																	</span>
																	<span className='text-xs text-gray-500'>
																		{product.unit}
																	</span>
																</div>
																{product.description && (
																	<p className='text-xs text-gray-500 line-clamp-2'>
																		{product.description}
																	</p>
																)}
															</div>
														</div>

														{/* Quantity Controls - Mobile */}
														<div className='flex items-center justify-between gap-2'>
															<div className='flex items-center bg-gray-100 rounded-lg'>
																<Button
																	variant='ghost'
																	size='sm'
																	onClick={() =>
																		updateModalQuantity(
																			product._id,
																			(modalQuantities[product._id] || 1) - 1
																		)
																	}
																	disabled={modalQuantities[product._id] <= 1}
																	className='h-8 w-8 p-0 text-gray-600 hover:text-gray-800 hover:bg-gray-200'
																>
																	<Minus className='h-3 w-3' />
																</Button>
																<span className='px-3 py-1 text-sm font-medium text-gray-700 min-w-[40px] text-center'>
																	{modalQuantities[product._id] || 1}
																</span>
																<Button
																	variant='ghost'
																	size='sm'
																	onClick={() =>
																		updateModalQuantity(
																			product._id,
																			(modalQuantities[product._id] || 1) + 1
																		)
																	}
																	className='h-8 w-8 p-0 text-gray-600 hover:text-gray-800 hover:bg-gray-200'
																>
																	<Plus className='h-3 w-3' />
																</Button>
															</div>
															<Button
																size='sm'
																onClick={() => addProductFromModal(product)}
																className='flex-1 bg-green-600 hover:bg-green-700 text-white h-8 text-xs'
															>
																<Check className='h-3 w-3 mr-1' />
																Add {modalQuantities[product._id] || 1}{' '}
																{product.unit}
															</Button>
														</div>
													</div>

													{/* Desktop Layout */}
													<div className='hidden sm:flex items-center justify-between'>
														<div className='flex items-center flex-1 min-w-0 mr-3'>
															<div className='w-10 h-10 flex-shrink-0 mr-3'>
																<ProductThumbnail
																	src={getPrimaryImage(product)}
																	alt={product.name}
																	category={product.category}
																	size='sm'
																	priority={false}
																/>
															</div>
															<div className='min-w-0 flex-1'>
																<p className='font-medium text-sm text-gray-900 truncate mb-1'>
																	{product.name}
																</p>
																<div className='flex items-center space-x-2'>
																	<span className='inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800'>
																		{getCategoryDisplayName(product.category)}
																	</span>
																	<span className='text-xs text-gray-500'>
																		{product.unit}
																	</span>
																</div>
																{product.description && (
																	<p className='text-xs text-gray-500 mt-1 line-clamp-1'>
																		{product.description}
																	</p>
																)}
															</div>
														</div>

														{/* Quantity Controls - Desktop */}
														<div className='flex items-center gap-3'>
															<div className='flex items-center bg-gray-100 rounded-lg'>
																<Button
																	variant='ghost'
																	size='sm'
																	onClick={() =>
																		updateModalQuantity(
																			product._id,
																			(modalQuantities[product._id] || 1) - 1
																		)
																	}
																	disabled={modalQuantities[product._id] <= 1}
																	className='h-8 w-8 p-0 text-gray-600 hover:text-gray-800 hover:bg-gray-200'
																>
																	<Minus className='h-3 w-3' />
																</Button>
																<span className='px-3 py-1 text-sm font-medium text-gray-700 min-w-[50px] text-center'>
																	{modalQuantities[product._id] || 1}
																</span>
																<Button
																	variant='ghost'
																	size='sm'
																	onClick={() =>
																		updateModalQuantity(
																			product._id,
																			(modalQuantities[product._id] || 1) + 1
																		)
																	}
																	className='h-8 w-8 p-0 text-gray-600 hover:text-gray-800 hover:bg-gray-200'
																>
																	<Plus className='h-3 w-3' />
																</Button>
															</div>
															<Button
																size='sm'
																onClick={() => addProductFromModal(product)}
																className='bg-green-600 hover:bg-green-700 text-white whitespace-nowrap text-xs px-4'
															>
																<Check className='h-3 w-3 mr-1' />
																Add {modalQuantities[product._id] || 1}
															</Button>
														</div>
													</div>
												</div>
											))}
											{filteredSuggestions.length > 8 && (
												<div className='text-center py-2'>
													<p className='text-xs text-gray-500'>
														Showing first 8 results. Use search to find more
														items.
													</p>
												</div>
											)}
										</div>
									)
								})()}
							</div>
						</div>

						<DialogFooter className='flex-shrink-0 p-3 sm:p-4 lg:p-6 pt-3 sm:pt-4 border-t bg-white'>
							{/* Mobile Footer */}
							<div className='block sm:hidden w-full space-y-3'>
								<div className='text-center'>
									<span className='text-sm text-gray-600'>
										{orderItems.length}{' '}
										{orderItems.length === 1 ? 'item' : 'items'} in order
									</span>
								</div>
								<div className='grid grid-cols-2 gap-2'>
									<Button
										variant='outline'
										onClick={() => setShowSuggestionsModal(false)}
										className='h-10 text-sm'
									>
										Continue Shopping
									</Button>
									<Button
										onClick={submitOrderDirectly}
										disabled={submitting}
										className='bg-blue-600 hover:bg-blue-700 h-10 text-sm'
									>
										{submitting ? (
											<div className='flex items-center space-x-1'>
												<div className='animate-spin rounded-full h-3 w-3 border-b-2 border-white'></div>
												<span>Submitting...</span>
											</div>
										) : (
											<div className='flex items-center space-x-1'>
												<Check className='h-4 w-4' />
												<span>Submit Order</span>
											</div>
										)}
									</Button>
								</div>
							</div>

							{/* Desktop Footer */}
							<div className='hidden sm:flex items-center justify-between w-full'>
								<p className='text-sm text-gray-500'>
									{orderItems.length}{' '}
									{orderItems.length === 1 ? 'item' : 'items'} in your order
								</p>
								<div className='flex space-x-2'>
									<Button
										variant='outline'
										onClick={() => setShowSuggestionsModal(false)}
										className='h-9 text-sm'
									>
										Continue Shopping
									</Button>
									<Button
										onClick={submitOrderDirectly}
										disabled={submitting}
										className='bg-blue-600 hover:bg-blue-700 h-9 text-sm'
									>
										{submitting ? (
											<div className='flex items-center space-x-2'>
												<div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
												<span>Submitting...</span>
											</div>
										) : (
											<div className='flex items-center space-x-2'>
												<Check className='h-4 w-4' />
												<span>Submit Order</span>
											</div>
										)}
									</Button>
								</div>
							</div>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</DashboardLayout>
		</ProtectedRoute>
	)
}

export default NewOrder
