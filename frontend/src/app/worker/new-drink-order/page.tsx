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
import { ProductThumbnail } from '@/components/ui/ProductImage'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { useAuth } from '@/contexts/AuthContext'
import { drinkOrdersApi, productsApi } from '@/lib/api'
import { getPrimaryImage } from '@/lib/imageUtils'
import { Product } from '@/types'
import {
	AlertCircle,
	Calendar,
	CupSoda,
	Minus,
	Plus,
	Search,
	Trash2,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

interface DrinkOrderItem {
	product: Product
	quantity: number
}

const DELIVERY_BRANCHES = [
	'Kondae New',
	'Hongdae',
	'Seulde',
	'Seulde Tantuni',
	'Gangnam',
	'Kondae',
	'Itewon',
	'Paket',
	'Posco',
]

const getTodayDate = (): string => new Date().toISOString().split('T')[0]

const NewDrinkOrderPage: React.FC = () => {
	const { user } = useAuth()
	const router = useRouter()

	const [loading, setLoading] = useState(true)
	const [submitting, setSubmitting] = useState(false)
	const [searchTerm, setSearchTerm] = useState('')
	const [selectedBranch, setSelectedBranch] = useState(user?.branch || '')
	const [requestedDate, setRequestedDate] = useState(getTodayDate())
	const [orderNotes, setOrderNotes] = useState('')
	const [allDrinkProducts, setAllDrinkProducts] = useState<Product[]>([])
	const [orderItems, setOrderItems] = useState<DrinkOrderItem[]>([])
	const totalQuantity = orderItems.reduce((acc, item) => acc + item.quantity, 0)

	useEffect(() => {
		const loadDrinkProducts = async () => {
			try {
				setLoading(true)
				const response = await productsApi.getProducts({ active: 'true' })
				const drinkProducts = (response.products || []).filter(product =>
					['drinks', 'beverages'].includes(product.category)
				)
				setAllDrinkProducts(drinkProducts)
			} catch (error) {
				console.error('Failed to fetch drink products:', error)
				toast.error('Failed to load drink products')
			} finally {
				setLoading(false)
			}
		}

		loadDrinkProducts()
	}, [])

	const filteredDrinkProducts = useMemo(() => {
		if (!searchTerm.trim()) {
			return allDrinkProducts
		}

		const query = searchTerm.toLowerCase()
		return allDrinkProducts.filter(
			product =>
				product.name.toLowerCase().includes(query) ||
				product.description?.toLowerCase().includes(query)
		)
	}, [allDrinkProducts, searchTerm])

	const getQuantity = (productId: string) => {
		const item = orderItems.find(current => current.product._id === productId)
		return item?.quantity || 0
	}

	const upsertQuantity = (product: Product, quantity: number) => {
		if (quantity <= 0) {
			setOrderItems(prev => prev.filter(item => item.product._id !== product._id))
			return
		}

		setOrderItems(prev => {
			const existing = prev.find(item => item.product._id === product._id)
			if (!existing) {
				return [...prev, { product, quantity }]
			}

			return prev.map(item =>
				item.product._id === product._id ? { ...item, quantity } : item
			)
		})
	}

	const submitDrinkOrder = async () => {
		if (!selectedBranch) {
			toast.error('Please select a delivery branch')
			return
		}
		if (!requestedDate) {
			toast.error('Please select requested date')
			return
		}
		if (orderItems.length === 0) {
			toast.error('Please add at least one drink')
			return
		}

		try {
			setSubmitting(true)
			await drinkOrdersApi.createDrinkOrder({
				branch: selectedBranch,
				requestedDate,
				items: orderItems.map(item => ({
					product: item.product._id,
					quantity: item.quantity,
				})),
				notes: orderNotes || undefined,
			})

			toast.success('Drink order created successfully')
			router.push('/worker/drink-orders')
		} catch (error) {
			console.error('Create drink order error:', error)
			toast.error('Failed to create drink order')
		} finally {
			setSubmitting(false)
		}
	}

	return (
		<ProtectedRoute requiredRole='worker'>
			<DashboardLayout>
				<div className='space-y-4 sm:space-y-6 pb-24 lg:pb-0'>
					<div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
						<div className='min-w-0'>
							<h1 className='text-xl sm:text-2xl font-bold text-gray-900'>
								Create Drink Order
							</h1>
							<p className='text-sm text-gray-600 mt-1'>
								This flow is separate from normal supply orders
							</p>
						</div>
						<Button
							variant='outline'
							onClick={() => router.push('/worker/drink-orders')}
							className='w-full sm:w-auto'
						>
							View Drink Orders
						</Button>
					</div>

					<div className='grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6'>
						<div className='lg:col-span-2'>
							<Card>
								<CardHeader className='p-4 sm:p-6'>
									<CardTitle className='flex items-center gap-2'>
										<CupSoda className='h-5 w-5 text-cyan-600' />
										Select Drinks
									</CardTitle>
									<CardDescription>
										Only drink products are shown in this page
									</CardDescription>
								</CardHeader>
								<CardContent className='space-y-4 p-4 sm:p-6 pt-0'>
									<div className='relative'>
										<Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
										<Input
											placeholder='Search drinks...'
											value={searchTerm}
											onChange={e => setSearchTerm(e.target.value)}
											className='pl-10 h-10 sm:h-11'
										/>
									</div>

									{loading ? (
										<p className='text-sm text-gray-500'>Loading drinks...</p>
									) : filteredDrinkProducts.length === 0 ? (
										<div className='flex items-center gap-2 text-sm text-gray-500'>
											<AlertCircle className='h-4 w-4' />
											No drink products found
										</div>
									) : (
										<div className='space-y-2 max-h-[55vh] lg:max-h-[560px] overflow-y-auto pr-1'>
											{filteredDrinkProducts.map(product => {
												const quantity = getQuantity(product._id)
												return (
													<div
														key={product._id}
														className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border rounded-lg p-3'
													>
														<div className='flex items-center gap-3 min-w-0 w-full sm:w-auto'>
															<div className='h-10 w-10 sm:h-11 sm:w-11'>
																<ProductThumbnail
																	src={getPrimaryImage(product)}
																	alt={product.name}
																	category={product.category}
																	size='sm'
																/>
															</div>
															<div className='min-w-0 flex-1'>
																<p className='font-medium text-sm sm:text-base truncate'>
																	{product.name}
																</p>
																<p className='text-xs text-gray-500'>{product.unit}</p>
															</div>
														</div>

														<div className='flex items-center justify-end gap-2 w-full sm:w-auto'>
															<Button
																variant='outline'
																size='sm'
																onClick={() => upsertQuantity(product, quantity - 1)}
																className='h-9 w-9'
															>
																<Minus className='h-3 w-3' />
															</Button>
															<span className='w-8 text-center text-base font-semibold'>
																{quantity}
															</span>
															<Button
																variant='outline'
																size='sm'
																onClick={() => upsertQuantity(product, quantity + 1)}
																className='h-9 w-9'
															>
																<Plus className='h-3 w-3' />
															</Button>
														</div>
													</div>
												)
											})}
										</div>
									)}
								</CardContent>
							</Card>
						</div>

						<div>
							<Card className='lg:sticky lg:top-6'>
								<CardHeader className='p-4 sm:p-6'>
									<CardTitle>Drink Order Summary</CardTitle>
								</CardHeader>
								<CardContent className='space-y-4 p-4 sm:p-6 pt-0'>
									<div className='space-y-2'>
										<Label>Delivery Branch</Label>
										<Select value={selectedBranch} onValueChange={setSelectedBranch}>
											<SelectTrigger className='h-10 sm:h-11'>
												<SelectValue placeholder='Select branch' />
											</SelectTrigger>
											<SelectContent>
												{DELIVERY_BRANCHES.map(branch => (
													<SelectItem key={branch} value={branch}>
														{branch}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>

									<div className='space-y-2'>
										<Label className='flex items-center gap-2'>
											<Calendar className='h-4 w-4' />
											Requested Date
										</Label>
										<Input
											type='date'
											value={requestedDate}
											onChange={e => setRequestedDate(e.target.value)}
											min={getTodayDate()}
											className='h-10 sm:h-11'
										/>
									</div>

									<div className='space-y-2'>
										<Label>Notes (optional)</Label>
										<textarea
											value={orderNotes}
											onChange={e => setOrderNotes(e.target.value)}
											rows={3}
											className='w-full rounded-md border border-input px-3 py-2 text-sm resize-none'
											placeholder='Any notes for this drink order...'
										/>
									</div>

									<div className='border rounded-md p-3 bg-gray-50 space-y-2'>
										<div className='flex items-center justify-between text-sm'>
											<span>Products</span>
											<span className='font-semibold'>{orderItems.length}</span>
										</div>
										<div className='flex items-center justify-between text-sm'>
											<span>Total Quantity</span>
											<span className='font-semibold'>
												{totalQuantity}
											</span>
										</div>

										{orderItems.length > 0 && (
											<div className='pt-2 border-t space-y-1 max-h-40 overflow-y-auto'>
												<p className='text-xs font-medium text-gray-600'>
													Selected drinks
												</p>
												{orderItems.map(item => (
													<div
														key={item.product._id}
														className='flex items-center justify-between text-xs text-gray-700'
													>
														<span className='truncate pr-2'>{item.product.name}</span>
														<span className='font-medium whitespace-nowrap'>
															{item.quantity} {item.product.unit}
														</span>
													</div>
												))}
											</div>
										)}
									</div>

									<Button
										onClick={submitDrinkOrder}
										disabled={submitting || orderItems.length === 0}
										className='hidden lg:flex w-full bg-cyan-600 hover:bg-cyan-700 h-11'
									>
										{submitting ? 'Submitting...' : 'Submit Drink Order'}
									</Button>

									<Button
										variant='outline'
										className='hidden lg:flex w-full h-11'
										onClick={() => {
											setOrderItems([])
											setOrderNotes('')
										}}
									>
										<Trash2 className='h-4 w-4 mr-2' />
										Clear Selection
									</Button>
								</CardContent>
							</Card>
						</div>
					</div>
				</div>

				<div className='lg:hidden fixed bottom-0 left-0 right-0 border-t bg-white/95 backdrop-blur p-3 z-40'>
					<div className='max-w-7xl mx-auto flex items-center gap-2'>
						<Button
							variant='outline'
							className='flex-1 h-11'
							onClick={() => {
								setOrderItems([])
								setOrderNotes('')
							}}
							disabled={orderItems.length === 0}
						>
							Clear
						</Button>
						<Button
							onClick={submitDrinkOrder}
							disabled={submitting || orderItems.length === 0}
							className='flex-[2] h-11 bg-cyan-600 hover:bg-cyan-700'
						>
							{submitting
								? 'Submitting...'
								: `Submit (${orderItems.length} items / ${totalQuantity})`}
						</Button>
					</div>
				</div>
			</DashboardLayout>
		</ProtectedRoute>
	)
}

export default NewDrinkOrderPage
