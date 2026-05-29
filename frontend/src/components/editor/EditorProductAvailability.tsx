'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import {
	useProductsList,
	useToggleProductStatus,
} from '@/hooks/queries'
import { getCategoryDisplayName } from '@/lib/orderCategories'
import { Order, Product } from '@/types'
import { AlertTriangle, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { editorTouchSm } from './editorUi'

type AvailabilityFilter = 'all' | 'available' | 'sold-out'
type ProductAvailabilityStatus = 'available' | 'sold-out'

function isWorkerOrderProduct(product: Product): boolean {
	return !product.supplier || product.supplier.trim() === ''
}

function toAvailabilityStatus(isActive: boolean): ProductAvailabilityStatus {
	return isActive ? 'available' : 'sold-out'
}

interface EditorProductAvailabilityProps {
	orders: Order[]
	/** When true, only show drink-category products */
	drinkOnly?: boolean
}

const DRINK_CATEGORIES = new Set(['drinks', 'beverages'])

const AVAILABILITY_OPTIONS: {
	value: ProductAvailabilityStatus
	label: string
}[] = [
	{ value: 'available', label: 'Available' },
	{ value: 'sold-out', label: 'Sold out' },
]

export default function EditorProductAvailability({
	orders,
	drinkOnly = false,
}: EditorProductAvailabilityProps) {
	const [search, setSearch] = useState('')
	const [availabilityFilter, setAvailabilityFilter] =
		useState<AvailabilityFilter>('available')
	const [updatingId, setUpdatingId] = useState<string | null>(null)

	const { data, isLoading } = useProductsList({ active: 'all' })
	const toggleMutation = useToggleProductStatus()

	const pendingOrderCounts = useMemo(() => {
		const counts = new Map<string, number>()
		orders.forEach(order => {
			if (order.status !== 'pending') return
			order.items.forEach(item => {
				const productId =
					typeof item.product === 'string'
						? item.product
						: item.product?._id
				if (!productId) return
				counts.set(productId, (counts.get(productId) ?? 0) + item.quantity)
			})
		})
		return counts
	}, [orders])

	const workerProducts = useMemo(() => {
		const products = (data?.products ?? []).filter(product => {
			if (!isWorkerOrderProduct(product)) return false
			if (drinkOnly) return DRINK_CATEGORIES.has(product.category)
			return true
		})
		const term = search.trim().toLowerCase()

		return products
			.filter(product => {
				if (availabilityFilter === 'available' && !product.isActive) {
					return false
				}
				if (availabilityFilter === 'sold-out' && product.isActive) {
					return false
				}
				if (!term) return true
				return (
					product.name.toLowerCase().includes(term) ||
					getCategoryDisplayName(product.category)
						.toLowerCase()
						.includes(term)
				)
			})
			.sort((a, b) => {
				const aPending = pendingOrderCounts.get(a._id) ?? 0
				const bPending = pendingOrderCounts.get(b._id) ?? 0
				if (aPending !== bPending) return bPending - aPending
				if (a.isActive !== b.isActive) return a.isActive ? -1 : 1
				return a.name.localeCompare(b.name)
			})
	}, [data?.products, search, availabilityFilter, pendingOrderCounts, drinkOnly])

	const catalogProducts = useMemo(
		() =>
			(data?.products ?? []).filter(product => {
				if (!isWorkerOrderProduct(product)) return false
				if (drinkOnly) return DRINK_CATEGORIES.has(product.category)
				return true
			}),
		[data?.products, drinkOnly]
	)

	const soldOutCount = catalogProducts.filter(p => !p.isActive).length
	const availableCount = catalogProducts.filter(p => p.isActive).length

	const handleAvailabilityChange = (
		product: Product,
		nextStatus: ProductAvailabilityStatus
	) => {
		const currentStatus = toAvailabilityStatus(product.isActive)
		if (nextStatus === currentStatus) return

		setUpdatingId(product._id)
		toggleMutation.mutate(product._id, {
			onSettled: () => setUpdatingId(null),
		})
	}

	return (
		<Card>
			<CardHeader className='pb-3'>
				<div className='flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3'>
					<div className='flex flex-wrap gap-2 sm:justify-end sm:ml-auto'>
						<Badge variant='outline' className='bg-green-50 text-green-700 border-green-200'>
							Available: {availableCount}
						</Badge>
						<Badge variant='outline' className='bg-red-50 text-red-700 border-red-200'>
							Sold out: {soldOutCount}
						</Badge>
					</div>
				</div>
			</CardHeader>
			<CardContent className='space-y-4'>
				<div className='flex flex-col sm:flex-row gap-3'>
					<div className='relative flex-1'>
						<Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
						<Input
							placeholder='Search product or category...'
							value={search}
							onChange={e => setSearch(e.target.value)}
							className='pl-9 h-12 sm:h-10 text-base'
						/>
					</div>
					<Select
						value={availabilityFilter}
						onValueChange={value =>
							setAvailabilityFilter(value as AvailabilityFilter)
						}
					>
						<SelectTrigger className='w-full sm:w-[180px] h-12 sm:h-10 text-base'>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value='available'>Available only</SelectItem>
							<SelectItem value='sold-out'>Sold out only</SelectItem>
							<SelectItem value='all'>All products</SelectItem>
						</SelectContent>
					</Select>
				</div>

				{pendingOrderCounts.size > 0 && (
					<div className='flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900'>
						<AlertTriangle className='h-4 w-4 mt-0.5 shrink-0' />
						<span>
							Products with pending orders are listed first. Set availability to
							sold out so workers stop ordering unavailable stock.
						</span>
					</div>
				)}

				<div className='hidden md:block overflow-x-auto rounded-md border'>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Product</TableHead>
								<TableHead className='hidden sm:table-cell'>Category</TableHead>
								<TableHead className='hidden md:table-cell'>
									Pending qty
								</TableHead>
								<TableHead className='w-[160px]'>Availability</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{isLoading ? (
								<TableRow>
									<TableCell colSpan={4} className='text-center py-8 text-gray-500'>
										Loading products...
									</TableCell>
								</TableRow>
							) : workerProducts.length === 0 ? (
								<TableRow>
									<TableCell colSpan={4} className='text-center py-8 text-gray-500'>
										No products match your filters
									</TableCell>
								</TableRow>
							) : (
								workerProducts.map(product => {
									const pendingQty = pendingOrderCounts.get(product._id) ?? 0
									const isUpdating =
										updatingId === product._id && toggleMutation.isPending
									const currentStatus = toAvailabilityStatus(product.isActive)

									return (
										<TableRow key={product._id}>
											<TableCell className='font-medium text-sm'>
												{product.name}
											</TableCell>
											<TableCell className='hidden sm:table-cell text-sm text-gray-600'>
												{getCategoryDisplayName(product.category)}
											</TableCell>
											<TableCell className='hidden md:table-cell text-sm'>
												{pendingQty > 0 ? (
													<span className='font-medium text-amber-700'>
														{pendingQty}
													</span>
												) : (
													<span className='text-gray-400'>—</span>
												)}
											</TableCell>
											<TableCell>
												<Select
													value={currentStatus}
													disabled={isUpdating}
													onValueChange={value =>
														handleAvailabilityChange(
															product,
															value as ProductAvailabilityStatus
														)
													}
												>
													<SelectTrigger
														className={`h-9 w-full min-w-[140px] ${
															currentStatus === 'available'
																? 'border-green-200 bg-green-50 text-green-800'
																: 'border-red-200 bg-red-50 text-red-800'
														}`}
													>
														<SelectValue
															placeholder='Select status'
														/>
													</SelectTrigger>
													<SelectContent>
														{AVAILABILITY_OPTIONS.map(option => (
															<SelectItem
																key={option.value}
																value={option.value}
															>
																{option.label}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
											</TableCell>
										</TableRow>
									)
								})
							)}
						</TableBody>
					</Table>
				</div>

				<div className='md:hidden space-y-3'>
					{isLoading ? (
						<p className='text-center py-8 text-gray-500'>Loading products...</p>
					) : workerProducts.length === 0 ? (
						<p className='text-center py-8 text-gray-500'>
							No products match your filters
						</p>
					) : (
						workerProducts.map(product => {
							const pendingQty = pendingOrderCounts.get(product._id) ?? 0
							const isUpdating =
								updatingId === product._id && toggleMutation.isPending
							const currentStatus = toAvailabilityStatus(product.isActive)

							return (
								<Card key={product._id} className='overflow-hidden shadow-sm'>
									<CardContent className='p-4 space-y-3'>
										<div className='flex items-start justify-between gap-3'>
											<div className='min-w-0 flex-1'>
												<p className='font-semibold text-gray-900 leading-snug'>
													{product.name}
												</p>
												<p className='text-sm text-gray-500 mt-0.5'>
													{getCategoryDisplayName(product.category)}
												</p>
											</div>
											{pendingQty > 0 && (
												<div className='shrink-0 text-right'>
													<p className='text-xs text-amber-700'>Pending</p>
													<p className='text-lg font-bold text-amber-800'>
														{pendingQty}
													</p>
												</div>
											)}
										</div>

										<Select
											value={currentStatus}
											disabled={isUpdating}
											onValueChange={value =>
												handleAvailabilityChange(
													product,
													value as ProductAvailabilityStatus
												)
											}
										>
											<SelectTrigger
												className={`${editorTouchSm} h-12 w-full text-base ${
													currentStatus === 'available'
														? 'border-green-200 bg-green-50 text-green-800'
														: 'border-red-200 bg-red-50 text-red-800'
												} ${isUpdating ? 'opacity-50' : ''}`}
											>
												<SelectValue placeholder='Select status' />
											</SelectTrigger>
											<SelectContent>
												{AVAILABILITY_OPTIONS.map(option => (
													<SelectItem
														key={option.value}
														value={option.value}
													>
														{option.label}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</CardContent>
								</Card>
							)
						})
					)}
				</div>
			</CardContent>
		</Card>
	)
}
