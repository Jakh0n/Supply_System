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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { useAuth } from '@/contexts/AuthContext'
import { branchesApi, ordersApi, productsApi } from '@/lib/api'
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
	notes?: string
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
		setSelectedBranch(user?.branch || '')
		toast.success('Order cleared')
	}

	// Get suggested products (products not yet added to order)
	const getSuggestedProducts = () => {
		const addedProductIds = orderItems.map(item => item.product._id)
		return products.filter(product => !addedProductIds.includes(product._id))
	}

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
					notes: item.notes || undefined,
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
								Submit a new supply request for any branch
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

									{/* Products Table */}
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
										<div className='overflow-x-auto max-h-96 overflow-y-auto border rounded-lg'>
											<table className='w-full table-fixed'>
												<thead className='bg-gray-50 sticky top-0'>
													<tr className='border-b'>
														<th className='text-left p-3 font-medium text-gray-700 w-1/2'>
															Product
														</th>
														<th className='text-left p-3 font-medium text-gray-700 w-1/4'>
															Category
														</th>
														<th className='text-left p-3 font-medium text-gray-700 w-1/6'>
															Unit
														</th>
														<th className='text-right p-3 font-medium text-gray-700 w-1/6'>
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
																	<Package className='h-4 w-4 text-gray-400 mr-3 flex-shrink-0 mt-0.5' />
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
																	{getCategoryLabel(product.category)}
																</span>
															</td>
															<td className='p-3 text-sm text-gray-600 font-medium truncate'>
																{product.unit}
															</td>
															<td className='p-3 text-right'>
																<Button
																	size='sm'
																	onClick={() => addProductToOrder(product)}
																	className='bg-green-600 hover:bg-green-700 text-white whitespace-nowrap'
																>
																	<Plus className='h-4 w-4 mr-1' />
																	Add
																</Button>
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

						{/* Order Summary */}
						<div>
							<Card className='sticky top-6 shadow-lg border-2'>
								<CardHeader className='bg-gradient-to-r from-blue-50 to-indigo-50 border-b'>
									<CardTitle className='flex items-center text-lg'>
										<ShoppingCart className='h-5 w-5 mr-2 text-blue-600' />
										Order Summary
									</CardTitle>
									<CardDescription className='text-sm'>
										Review your order details before submitting
									</CardDescription>
								</CardHeader>
								<CardContent className='space-y-6 p-6'>
									{/* Branch Selection */}
									<div className='space-y-2'>
										<Label
											htmlFor='branch-select'
											className='text-sm font-semibold text-gray-700 flex items-center'
										>
											<Package className='h-4 w-4 mr-2 text-gray-500' />
											Delivery Branch
										</Label>
										<Select
											value={selectedBranch}
											onValueChange={setSelectedBranch}
											disabled={branchesLoading}
										>
											<SelectTrigger className='h-11 border-2 focus:border-blue-500'>
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
															{branch.name}
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
											className='text-sm font-semibold text-gray-700 flex items-center'
										>
											<Calendar className='h-4 w-4 mr-2 text-gray-500' />
											Requested Delivery Date
										</Label>
										<div className='relative'>
											<Calendar className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
											<Input
												id='requested-date'
												type='date'
												value={requestedDate}
												onChange={e => setRequestedDate(e.target.value)}
												min={getTomorrowDate()}
												className='pl-10 h-11 border-2 focus:border-blue-500'
											/>
										</div>
										<p className='text-xs text-gray-500 mt-1'>
											Orders must be placed at least 1 day in advance
										</p>
									</div>

									{/* Order Items */}
									<div className='space-y-3'>
										<div className='flex items-center justify-between'>
											<Label className='text-sm font-semibold text-gray-700 flex items-center'>
												<ShoppingCart className='h-4 w-4 mr-2 text-gray-500' />
												Order Items
											</Label>
											<div className='flex items-center space-x-2'>
												<span className='bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded-full'>
													{orderItems.length}{' '}
													{orderItems.length === 1 ? 'item' : 'items'}
												</span>
											</div>
										</div>

										{orderItems.length === 0 ? (
											<div className='text-center py-8 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200'>
												<ShoppingCart className='h-12 w-12 mx-auto mb-3 text-gray-300' />
												<p className='text-sm font-medium text-gray-600 mb-1'>
													No items added yet
												</p>
												<p className='text-xs text-gray-500'>
													Start by selecting products from the table
												</p>
											</div>
										) : (
											<div className='space-y-3 max-h-72 overflow-y-auto bg-gray-50 rounded-lg p-3 border'>
												{orderItems.map(item => (
													<div
														key={item.product._id}
														className='bg-white border rounded-lg p-4 space-y-3 shadow-sm hover:shadow-md transition-shadow'
													>
														<div className='flex items-start justify-between'>
															<div className='flex-1 min-w-0'>
																<div className='flex items-center mb-2'>
																	<Package className='h-4 w-4 text-gray-400 mr-2 flex-shrink-0' />
																	<p className='font-semibold text-sm text-gray-900 truncate'>
																		{item.product.name}
																	</p>
																</div>
																<p className='text-xs text-gray-500 ml-6'>
																	{item.product.category} • {item.product.unit}
																</p>
															</div>
															<Button
																variant='ghost'
																size='sm'
																onClick={() =>
																	removeItemFromOrder(item.product._id)
																}
																className='text-red-500 hover:text-red-700 hover:bg-red-50 p-2 h-8 w-8'
																title='Remove item'
															>
																<Trash2 className='h-4 w-4' />
															</Button>
														</div>

														{/* Quantity controls */}
														<div className='flex items-center justify-between bg-gray-50 rounded-lg p-2'>
															<span className='text-sm font-medium text-gray-700'>
																Quantity:
															</span>
															<div className='flex items-center space-x-3'>
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
																	className='h-8 w-8 p-0 rounded-full'
																>
																	<Minus className='h-3 w-3' />
																</Button>
																<span className='text-sm font-bold text-gray-900 min-w-[2rem] text-center bg-white px-3 py-1 rounded-md border'>
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
																	className='h-8 w-8 p-0 rounded-full'
																>
																	<Plus className='h-3 w-3' />
																</Button>
															</div>
														</div>

														{/* Item notes */}
														<div className='space-y-1'>
															<Label className='text-xs font-medium text-gray-600'>
																Special Instructions (Optional)
															</Label>
															<Input
																placeholder='e.g., urgent, specific brand, etc.'
																value={item.notes || ''}
																onChange={e =>
																	updateItemNotes(
																		item.product._id,
																		e.target.value
																	)
																}
																className='text-sm h-9 border-gray-200 focus:border-blue-400'
															/>
														</div>

														{/* Item total */}
														<div className='flex justify-between items-center pt-2 border-t border-gray-100'>
															<span className='text-xs text-gray-500'>
																Total:
															</span>
															<span className='text-sm font-bold text-gray-900 bg-blue-50 px-2 py-1 rounded'>
																{item.quantity} {item.product.unit}
															</span>
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

									{/* Submit Button */}
									<div className='pt-4 border-t border-gray-200'>
										<Button
											onClick={handleSubmitOrder}
											disabled={
												!selectedBranch ||
												!requestedDate ||
												orderItems.length === 0 ||
												submitting
											}
											className='w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:from-gray-400 disabled:to-gray-500 disabled:shadow-none'
										>
											{submitting ? (
												<div className='flex items-center justify-center space-x-2'>
													<div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
													<span>Submitting Order...</span>
												</div>
											) : (
												<div className='flex items-center justify-center space-x-2'>
													<Check className='h-5 w-5' />
													<span>Submit Order Request</span>
												</div>
											)}
										</Button>

										{/* Helper text */}
										<div className='mt-3 text-center'>
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
					<DialogContent className='max-w-4xl max-h-[80vh] overflow-hidden flex flex-col'>
						<DialogHeader>
							<DialogTitle className='flex items-center'>
								<Package className='h-5 w-5 mr-2 text-blue-600' />
								Any items you might have forgotten?
							</DialogTitle>
							<DialogDescription>
								Here are some products you haven&apos;t added yet. Add any items
								you might have forgotten before submitting your order.
							</DialogDescription>
						</DialogHeader>

						<div className='flex-1 overflow-hidden flex flex-col space-y-4'>
							{/* Search for suggested products */}
							<div className='relative'>
								<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
								<Input
									placeholder='Search suggested products...'
									value={modalSearchTerm}
									onChange={e => setModalSearchTerm(e.target.value)}
									className='pl-10'
								/>
							</div>

							{/* Suggested Products List */}
							<div className='flex-1 overflow-y-auto border rounded-lg'>
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
											<div className='text-center py-8'>
												<Package className='h-12 w-12 text-gray-400 mx-auto mb-3' />
												<p className='text-gray-500'>
													{modalSearchTerm
														? 'No matching products found'
														: 'All available products have been added to your order!'}
												</p>
											</div>
										)
									}

									return (
										<div className='space-y-2 p-4'>
											{filteredSuggestions.slice(0, 10).map(product => (
												<div
													key={product._id}
													className='flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors'
												>
													<div className='flex items-center flex-1 min-w-0'>
														<Package className='h-4 w-4 text-gray-400 mr-3 flex-shrink-0' />
														<div className='min-w-0 flex-1'>
															<p className='font-medium text-sm text-gray-900 truncate'>
																{product.name}
															</p>
															<div className='flex items-center space-x-2 mt-1'>
																<span className='inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800'>
																	{getCategoryLabel(product.category)}
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
													<Button
														size='sm'
														onClick={() => {
															addProductToOrder(product)
															// Remove from suggestions after adding
															setSuggestedProducts(prev =>
																prev.filter(p => p._id !== product._id)
															)
														}}
														className='bg-green-600 hover:bg-green-700 text-white ml-3'
													>
														<Plus className='h-4 w-4 mr-1' />
														Add
													</Button>
												</div>
											))}
											{filteredSuggestions.length > 10 && (
												<p className='text-xs text-gray-500 text-center py-2'>
													Showing first 10 results. Use search to find more
													specific items.
												</p>
											)}
										</div>
									)
								})()}
							</div>
						</div>

						<DialogFooter className='flex items-center justify-between'>
							<p className='text-sm text-gray-500'>
								{orderItems.length} {orderItems.length === 1 ? 'item' : 'items'}{' '}
								in your order
							</p>
							<div className='flex space-x-2'>
								<Button
									variant='outline'
									onClick={() => setShowSuggestionsModal(false)}
								>
									Continue Shopping
								</Button>
								<Button
									onClick={submitOrderDirectly}
									disabled={submitting}
									className='bg-blue-600 hover:bg-blue-700'
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
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</DashboardLayout>
		</ProtectedRoute>
	)
}

export default NewOrder
