'use client'

import AdminLayout from '@/components/shared/AdminLayout'
import ImageUpload from '@/components/shared/ImageUpload'
import ProtectedRoute from '@/components/shared/ProtectedRoute'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
	Dialog,
	DialogContent,
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
import { Skeleton } from '@/components/ui/skeleton'
import { purchasesApi } from '@/lib/api'
import {
	PaginationInfo,
	PaymentMethod,
	ProductCategory,
	ProductPurchase,
	ProductPurchaseFilters,
	ProductPurchaseFormData,
	ProductUnit,
	PurchaseStatus,
} from '@/types'
import { format } from 'date-fns'
import {
	Building,
	Calendar,
	CreditCard,
	DollarSign,
	Edit,
	Filter,
	Package,
	Plus,
	Search,
	Trash2,
} from 'lucide-react'
import React, { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

const CATEGORIES: ProductCategory[] = [
	'frozen-products',
	'main-products',
	'desserts',
	'drinks',
	'packaging-materials',
	'cleaning-materials',
]

const PAYMENT_METHODS: PaymentMethod[] = [
	'cash',
	'bank-transfer',
	'credit-card',
	'debit-card',
	'check',
	'installments',
	'other',
]

const UNITS: ProductUnit[] = [
	'kg',
	'g',
	'l',
	'ml',
	'pieces',
	'boxes',
	'bottles',
	'cans',
	'packets',
]

const STATUS_OPTIONS: PurchaseStatus[] = [
	'pending',
	'ordered',
	'received',
	'cancelled',
]

// Purchase Form Component
const PurchaseForm: React.FC<{
	purchase?: ProductPurchase
	onSubmit: (data: ProductPurchaseFormData) => void
	onCancel: () => void
	loading: boolean
}> = ({ purchase, onSubmit, onCancel, loading }) => {
	const [formData, setFormData] = useState<ProductPurchaseFormData>({
		date:
			purchase?.date.split('T')[0] || new Date().toISOString().split('T')[0],
		category: purchase?.category || 'main-products',
		productName: purchase?.productName || '',
		price: purchase?.price || 1, // Changed from 0 to 1 to pass validation
		providerName: purchase?.providerName || '',
		paymentWay: purchase?.paymentWay || 'cash',
		quantity: purchase?.quantity || 1,
		unit: purchase?.unit || 'pieces',
		notes: purchase?.notes || '',
		branch: purchase?.branch || '',
		images: purchase?.images || [],
	})

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()

		// Basic validation
		if (!formData.productName.trim()) {
			toast.error('Product name is required')
			return
		}
		if (!formData.providerName.trim()) {
			toast.error('Provider name is required')
			return
		}
		if (!formData.branch.trim()) {
			toast.error('Branch is required')
			return
		}
		if (formData.price <= 0) {
			toast.error('Price must be greater than 0')
			return
		}
		if (formData.quantity <= 0) {
			toast.error('Quantity must be greater than 0')
			return
		}

		onSubmit(formData)
	}

	return (
		<form onSubmit={handleSubmit} className='space-y-4'>
			<div className='grid grid-cols-2 gap-4'>
				<div>
					<Label htmlFor='date'>Date</Label>
					<Input
						id='date'
						type='date'
						value={formData.date}
						onChange={e => setFormData({ ...formData, date: e.target.value })}
						required
					/>
				</div>
				<div>
					<Label htmlFor='category'>Category</Label>
					<Select
						value={formData.category}
						onValueChange={(value: ProductCategory) =>
							setFormData({ ...formData, category: value })
						}
					>
						<SelectTrigger>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{CATEGORIES.map(cat => (
								<SelectItem key={cat} value={cat}>
									{cat.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</div>

			<div>
				<Label htmlFor='productName'>Product Name</Label>
				<Input
					id='productName'
					value={formData.productName}
					onChange={e =>
						setFormData({ ...formData, productName: e.target.value })
					}
					placeholder='Enter product name'
					required
				/>
			</div>

			<div>
				<Label htmlFor='providerName'>Provider Name</Label>
				<Input
					id='providerName'
					value={formData.providerName}
					onChange={e =>
						setFormData({ ...formData, providerName: e.target.value })
					}
					placeholder='Enter provider name'
					required
				/>
			</div>

			<div>
				<Label htmlFor='branch'>Branch</Label>
				<Input
					id='branch'
					value={formData.branch}
					onChange={e => setFormData({ ...formData, branch: e.target.value })}
					placeholder='Enter branch name'
					required
				/>
			</div>

			<div className='grid grid-cols-3 gap-4'>
				<div>
					<Label htmlFor='price'>Price</Label>
					<Input
						id='price'
						type='number'
						step='0.01'
						min='0'
						value={formData.price}
						onChange={e =>
							setFormData({
								...formData,
								price: parseFloat(e.target.value) || 1,
							})
						}
						placeholder='0.00'
						required
					/>
				</div>
				<div>
					<Label htmlFor='quantity'>Quantity</Label>
					<Input
						id='quantity'
						type='number'
						min='1'
						value={formData.quantity}
						onChange={e =>
							setFormData({
								...formData,
								quantity: parseInt(e.target.value) || 1,
							})
						}
						required
					/>
				</div>
				<div>
					<Label htmlFor='unit'>Unit</Label>
					<Select
						value={formData.unit}
						onValueChange={(value: ProductUnit) =>
							setFormData({ ...formData, unit: value })
						}
					>
						<SelectTrigger>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{UNITS.map(unit => (
								<SelectItem key={unit} value={unit}>
									{unit}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</div>

			<div>
				<Label htmlFor='paymentWay'>Payment Method</Label>
				<Select
					value={formData.paymentWay}
					onValueChange={(value: PaymentMethod) =>
						setFormData({ ...formData, paymentWay: value })
					}
				>
					<SelectTrigger>
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{PAYMENT_METHODS.map(method => (
							<SelectItem key={method} value={method}>
								{method
									.replace('-', ' ')
									.replace(/\b\w/g, l => l.toUpperCase())}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<div>
				<Label htmlFor='notes'>Notes (Optional)</Label>
				<Input
					id='notes'
					value={formData.notes}
					onChange={e => setFormData({ ...formData, notes: e.target.value })}
					placeholder='Additional notes...'
				/>
			</div>

			{/* Image Upload */}
			<div>
				<Label>Product Images (Optional)</Label>
				<ImageUpload
					images={formData.images || []}
					onImagesChange={images =>
						setFormData(prev => ({
							...prev,
							images,
						}))
					}
					maxImages={5}
					disabled={loading}
					uploadFunction={purchasesApi.uploadImages}
				/>
			</div>

			<div className='flex items-center gap-2 p-3 bg-gray-50 rounded-lg'>
				<span className='text-sm font-medium'>Total Amount:</span>
				<span className='text-lg font-bold text-green-600'>
					₩{(formData.price * formData.quantity).toLocaleString()}
				</span>
			</div>

			<div className='flex justify-end gap-2'>
				<Button type='button' variant='outline' onClick={onCancel}>
					Cancel
				</Button>
				<Button type='submit' disabled={loading}>
					{loading
						? 'Saving...'
						: purchase
						? 'Update Purchase'
						: 'Add Purchase'}
				</Button>
			</div>
		</form>
	)
}

// Mobile Purchase Card Component
const MobilePurchaseCard: React.FC<{
	purchase: ProductPurchase
	onEdit: (purchase: ProductPurchase) => void
	onDelete: (id: string) => void
	onView: (purchase: ProductPurchase) => void
}> = ({ purchase, onEdit, onDelete, onView }) => {
	const getStatusColor = (status: PurchaseStatus) => {
		switch (status) {
			case 'pending':
				return 'bg-yellow-100 text-yellow-800'
			case 'ordered':
				return 'bg-blue-100 text-blue-800'
			case 'received':
				return 'bg-green-100 text-green-800'
			case 'cancelled':
				return 'bg-red-100 text-red-800'
			default:
				return 'bg-gray-100 text-gray-800'
		}
	}

	return (
		<Card
			className='hover:shadow-md transition-shadow cursor-pointer'
			onClick={() => onView(purchase)}
		>
			<CardContent className='p-4'>
				<div className='flex justify-between items-start mb-3'>
					<div className='flex items-start gap-3 flex-1'>
						{purchase.images && purchase.images.length > 0 ? (
							<div className='w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0'>
								<img
									src={purchase.images[0].url}
									alt={purchase.productName}
									className='w-full h-full object-cover'
								/>
							</div>
						) : (
							<div className='w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0'>
								<Package className='h-8 w-8 text-gray-400' />
							</div>
						)}
						<div className='flex-1'>
							<h3 className='font-semibold text-lg'>{purchase.productName}</h3>
							<p className='text-sm text-gray-600 mb-2'>
								{purchase.providerName}
							</p>
							<Badge className={getStatusColor(purchase.status)}>
								{purchase.status}
							</Badge>
						</div>
					</div>
					<div className='flex items-center gap-2'>
						<Button
							variant='ghost'
							size='sm'
							onClick={e => {
								e.stopPropagation()
								onEdit(purchase)
							}}
						>
							<Edit className='h-4 w-4' />
						</Button>
						<AlertDialog>
							<AlertDialogTrigger asChild>
								<Button
									variant='ghost'
									size='sm'
									onClick={e => e.stopPropagation()}
								>
									<Trash2 className='h-4 w-4 text-red-500' />
								</Button>
							</AlertDialogTrigger>
							<AlertDialogContent>
								<AlertDialogHeader>
									<AlertDialogTitle>Delete Purchase</AlertDialogTitle>
									<AlertDialogDescription>
										Are you sure you want to delete this purchase? This action
										cannot be undone.
									</AlertDialogDescription>
								</AlertDialogHeader>
								<AlertDialogFooter>
									<AlertDialogCancel>Cancel</AlertDialogCancel>
									<AlertDialogAction
										onClick={() => onDelete(purchase._id)}
										className='bg-red-500 hover:bg-red-600'
									>
										Delete
									</AlertDialogAction>
								</AlertDialogFooter>
							</AlertDialogContent>
						</AlertDialog>
					</div>
				</div>

				<div className='grid grid-cols-2 gap-3 text-sm mb-3'>
					<div className='flex items-center gap-2'>
						<Calendar className='h-4 w-4 text-gray-400' />
						<span>{format(new Date(purchase.date), 'MMM dd, yyyy')}</span>
					</div>
					<div className='flex items-center gap-2'>
						<Package className='h-4 w-4 text-gray-400' />
						<span>{purchase.category.replace('-', ' ')}</span>
					</div>
					<div className='flex items-center gap-2'>
						<Building className='h-4 w-4 text-gray-400' />
						<span>{purchase.branch}</span>
					</div>
					<div className='flex items-center gap-2'>
						<CreditCard className='h-4 w-4 text-gray-400' />
						<span>{purchase.paymentWay.replace('-', ' ')}</span>
					</div>
				</div>

				<div className='pt-3 border-t flex justify-between items-center'>
					<div className='text-sm text-gray-600'>
						{purchase.quantity} {purchase.unit} × ₩
						{purchase.price.toLocaleString()}
					</div>
					<div className='font-semibold text-lg text-green-600'>
						₩{purchase.totalAmount.toLocaleString()}
					</div>
				</div>
			</CardContent>
		</Card>
	)
}

// Purchase Item Component (List Format)
const PurchaseItem: React.FC<{
	purchase: ProductPurchase
	onEdit: (purchase: ProductPurchase) => void
	onDelete: (id: string) => void
	onView: (purchase: ProductPurchase) => void
}> = ({ purchase, onEdit, onDelete, onView }) => {
	const getStatusColor = (status: PurchaseStatus) => {
		switch (status) {
			case 'pending':
				return 'bg-yellow-100 text-yellow-800'
			case 'ordered':
				return 'bg-blue-100 text-blue-800'
			case 'received':
				return 'bg-green-100 text-green-800'
			case 'cancelled':
				return 'bg-red-100 text-red-800'
			default:
				return 'bg-gray-100 text-gray-800'
		}
	}

	return (
		<tr
			className='hover:bg-gray-50 cursor-pointer border-b'
			onClick={() => onView(purchase)}
		>
			<td className='px-4 py-3'>
				{purchase.images && purchase.images.length > 0 ? (
					<div className='w-12 h-12 rounded-lg overflow-hidden bg-gray-100'>
						<img
							src={purchase.images[0].url}
							alt={purchase.productName}
							className='w-full h-full object-cover'
						/>
					</div>
				) : (
					<div className='w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center'>
						<Package className='h-6 w-6 text-gray-400' />
					</div>
				)}
			</td>
			<td className='px-4 py-3'>
				<div>
					<div className='font-medium text-gray-900'>
						{purchase.productName}
					</div>
					<div className='text-sm text-gray-500'>{purchase.providerName}</div>
				</div>
			</td>
			<td className='px-4 py-3'>
				<Badge className={getStatusColor(purchase.status)}>
					{purchase.status}
				</Badge>
			</td>
			<td className='px-4 py-3 text-sm text-gray-600'>
				{format(new Date(purchase.date), 'MMM dd, yyyy')}
			</td>
			<td className='px-4 py-3 text-sm text-gray-600'>
				{purchase.category.replace('-', ' ')}
			</td>
			<td className='px-4 py-3 text-sm text-gray-600'>{purchase.branch}</td>
			<td className='px-4 py-3 text-sm text-gray-600'>
				{purchase.paymentWay.replace('-', ' ')}
			</td>
			<td className='px-4 py-3 text-sm text-gray-600'>
				{purchase.quantity} {purchase.unit}
			</td>
			<td className='px-4 py-3 text-sm text-gray-600'>
				₩{purchase.price.toLocaleString()}
			</td>
			<td className='px-4 py-3 font-semibold text-green-600'>
				₩{purchase.totalAmount.toLocaleString()}
			</td>
			<td className='px-4 py-3'>
				<div className='flex items-center gap-2'>
					<Button
						variant='ghost'
						size='sm'
						onClick={e => {
							e.stopPropagation()
							onEdit(purchase)
						}}
					>
						<Edit className='h-4 w-4' />
					</Button>
					<AlertDialog>
						<AlertDialogTrigger asChild>
							<Button
								variant='ghost'
								size='sm'
								onClick={e => e.stopPropagation()}
							>
								<Trash2 className='h-4 w-4 text-red-500' />
							</Button>
						</AlertDialogTrigger>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>Delete Purchase</AlertDialogTitle>
								<AlertDialogDescription>
									Are you sure you want to delete this purchase? This action
									cannot be undone.
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter>
								<AlertDialogCancel>Cancel</AlertDialogCancel>
								<AlertDialogAction
									onClick={() => onDelete(purchase._id)}
									className='bg-red-500 hover:bg-red-600'
								>
									Delete
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				</div>
			</td>
		</tr>
	)
}

// Purchase Details Dialog
const PurchaseDetailsDialog: React.FC<{
	purchase: ProductPurchase | null
	open: boolean
	onClose: () => void
}> = ({ purchase, open, onClose }) => {
	if (!purchase) return null

	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent className='max-w-2xl'>
				<DialogHeader>
					<DialogTitle>Purchase Details</DialogTitle>
				</DialogHeader>
				<div className='space-y-6'>
					<div className='grid grid-cols-2 gap-4'>
						<div>
							<Label className='text-sm font-medium text-gray-500'>
								Product Name
							</Label>
							<p className='font-semibold'>{purchase.productName}</p>
						</div>
						<div>
							<Label className='text-sm font-medium text-gray-500'>
								Provider
							</Label>
							<p className='font-semibold'>{purchase.providerName}</p>
						</div>
						<div>
							<Label className='text-sm font-medium text-gray-500'>Date</Label>
							<p>{format(new Date(purchase.date), 'MMMM dd, yyyy')}</p>
						</div>
						<div>
							<Label className='text-sm font-medium text-gray-500'>
								Category
							</Label>
							<p>
								{purchase.category
									.replace('-', ' ')
									.replace(/\b\w/g, l => l.toUpperCase())}
							</p>
						</div>
						<div>
							<Label className='text-sm font-medium text-gray-500'>
								Branch
							</Label>
							<p>{purchase.branch}</p>
						</div>
						<div>
							<Label className='text-sm font-medium text-gray-500'>
								Status
							</Label>
							<Badge
								className={`${
									purchase.status === 'pending'
										? 'bg-yellow-100 text-yellow-800'
										: purchase.status === 'ordered'
										? 'bg-blue-100 text-blue-800'
										: purchase.status === 'received'
										? 'bg-green-100 text-green-800'
										: 'bg-red-100 text-red-800'
								}`}
							>
								{purchase.status}
							</Badge>
						</div>
						<div>
							<Label className='text-sm font-medium text-gray-500'>
								Quantity
							</Label>
							<p>
								{purchase.quantity} {purchase.unit}
							</p>
						</div>
						<div>
							<Label className='text-sm font-medium text-gray-500'>
								Unit Price
							</Label>
							<p>₩{purchase.price.toLocaleString()}</p>
						</div>
						<div>
							<Label className='text-sm font-medium text-gray-500'>
								Payment Method
							</Label>
							<p>
								{purchase.paymentWay
									.replace('-', ' ')
									.replace(/\b\w/g, l => l.toUpperCase())}
							</p>
						</div>
						<div>
							<Label className='text-sm font-medium text-gray-500'>
								Total Amount
							</Label>
							<p className='text-xl font-bold text-green-600'>
								₩{purchase.totalAmount.toLocaleString()}
							</p>
						</div>
					</div>

					{purchase.notes && (
						<div>
							<Label className='text-sm font-medium text-gray-500'>Notes</Label>
							<p className='mt-1 p-3 bg-gray-50 rounded-lg'>{purchase.notes}</p>
						</div>
					)}

					<div className='grid grid-cols-2 gap-4 pt-4 border-t text-sm text-gray-500'>
						<div>
							<Label className='text-sm font-medium text-gray-500'>
								Created By
							</Label>
							<p>{purchase.createdBy.username}</p>
						</div>
						<div>
							<Label className='text-sm font-medium text-gray-500'>
								Created At
							</Label>
							<p>
								{format(new Date(purchase.createdAt), 'MMM dd, yyyy HH:mm')}
							</p>
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	)
}

const PurchasesPage: React.FC = () => {
	const [purchases, setPurchases] = useState<ProductPurchase[]>([])
	const [pagination, setPagination] = useState<PaginationInfo>({
		current: 1,
		pages: 1,
		total: 0,
	})
	const [loading, setLoading] = useState(true)
	const [actionLoading, setActionLoading] = useState<string | null>(null)
	const [showForm, setShowForm] = useState(false)
	const [editingPurchase, setEditingPurchase] =
		useState<ProductPurchase | null>(null)
	const [viewingPurchase, setViewingPurchase] =
		useState<ProductPurchase | null>(null)
	const [filters, setFilters] = useState<ProductPurchaseFilters>({
		category: 'all',
		branch: 'all',
		status: 'all',
		search: '',
		page: 1,
		limit: 12,
	})

	const fetchPurchases = useCallback(async () => {
		setLoading(true)
		console.log('Fetching purchases with filters:', filters)
		try {
			const response = await purchasesApi.getPurchases(filters)
			console.log('API Response:', response)
			// The response has a nested data structure
			const purchases = response.data?.purchases || response.purchases || []
			const pagination = response.data?.pagination ||
				response.pagination || {
					current: 1,
					pages: 1,
					total: 0,
				}
			console.log('Extracted purchases:', purchases)
			console.log('Extracted pagination:', pagination)
			setPurchases(purchases)
			setPagination(pagination)
		} catch (error) {
			console.error('Error fetching purchases:', error)
			console.error('Error details:', error.response?.data)
			toast.error('Failed to fetch purchases')
			// Reset to default values on error
			setPurchases([])
			setPagination({
				current: 1,
				pages: 1,
				total: 0,
			})
		} finally {
			setLoading(false)
		}
	}, [filters])

	useEffect(() => {
		fetchPurchases()
	}, [fetchPurchases])

	const handleCreatePurchase = async (data: ProductPurchaseFormData) => {
		setActionLoading('create')
		try {
			const newPurchase = await purchasesApi.createPurchase(data)
			setPurchases(prev => [newPurchase, ...prev])
			setShowForm(false)
			toast.success('Purchase added successfully!')
		} catch (error: any) {
			console.error('Error creating purchase:', error)
			console.error('Error response:', error.response?.data)

			let errorMessage = 'Failed to add purchase'

			if (error.response?.data?.message) {
				errorMessage = error.response.data.message
			} else if (error.response?.data?.errors) {
				// Handle validation errors
				const validationErrors = error.response.data.errors
				if (Array.isArray(validationErrors) && validationErrors.length > 0) {
					errorMessage = `Validation error: ${validationErrors
						.map((err: any) => err.message)
						.join(', ')}`
				}
			} else if (error.message) {
				errorMessage = error.message
			}

			toast.error(errorMessage)
		} finally {
			setActionLoading(null)
		}
	}

	const handleUpdatePurchase = async (data: ProductPurchaseFormData) => {
		if (!editingPurchase) return

		setActionLoading('update')
		try {
			const updatedPurchase = await purchasesApi.updatePurchase(
				editingPurchase._id,
				data
			)
			setPurchases(prev =>
				prev.map(p => (p._id === editingPurchase._id ? updatedPurchase : p))
			)
			setEditingPurchase(null)
			toast.success('Purchase updated successfully!')
		} catch (error) {
			console.error('Error updating purchase:', error)
			toast.error('Failed to update purchase')
		} finally {
			setActionLoading(null)
		}
	}

	const handleDeletePurchase = async (id: string) => {
		setActionLoading('delete')
		try {
			await purchasesApi.deletePurchase(id)
			setPurchases(prev => prev.filter(p => p._id !== id))
			toast.success('Purchase deleted successfully!')
		} catch (error) {
			console.error('Error deleting purchase:', error)
			toast.error('Failed to delete purchase')
		} finally {
			setActionLoading(null)
		}
	}

	const handleSearch = (query: string) => {
		setFilters(prev => ({ ...prev, search: query, page: 1 }))
	}

	const PurchasesSkeleton = () => (
		<>
			{/* Desktop Table Skeleton */}
			<div className='hidden lg:block'>
				<Card>
					<CardContent className='p-0'>
						<div className='overflow-x-auto'>
							<table className='w-full'>
								<thead className='bg-gray-50 border-b'>
									<tr>
										<th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
											Image
										</th>
										<th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
											Product
										</th>
										<th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
											Status
										</th>
										<th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
											Date
										</th>
										<th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
											Category
										</th>
										<th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
											Branch
										</th>
										<th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
											Payment
										</th>
										<th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
											Quantity
										</th>
										<th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
											Unit Price
										</th>
										<th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
											Total
										</th>
										<th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
											Actions
										</th>
									</tr>
								</thead>
								<tbody className='bg-white divide-y divide-gray-200'>
									{Array.from({ length: 6 }).map((_, index) => (
										<tr key={index} className='hover:bg-gray-50'>
											<td className='px-4 py-3'>
												<Skeleton className='h-12 w-12 rounded-lg' />
											</td>
											<td className='px-4 py-3'>
												<Skeleton className='h-4 w-32 mb-1' />
												<Skeleton className='h-3 w-24' />
											</td>
											<td className='px-4 py-3'>
												<Skeleton className='h-6 w-16 rounded-full' />
											</td>
											<td className='px-4 py-3'>
												<Skeleton className='h-4 w-20' />
											</td>
											<td className='px-4 py-3'>
												<Skeleton className='h-4 w-24' />
											</td>
											<td className='px-4 py-3'>
												<Skeleton className='h-4 w-20' />
											</td>
											<td className='px-4 py-3'>
												<Skeleton className='h-4 w-16' />
											</td>
											<td className='px-4 py-3'>
												<Skeleton className='h-4 w-16' />
											</td>
											<td className='px-4 py-3'>
												<Skeleton className='h-4 w-20' />
											</td>
											<td className='px-4 py-3'>
												<Skeleton className='h-4 w-24' />
											</td>
											<td className='px-4 py-3'>
												<div className='flex items-center gap-2'>
													<Skeleton className='h-8 w-8 rounded' />
													<Skeleton className='h-8 w-8 rounded' />
												</div>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Mobile Card Skeleton */}
			<div className='lg:hidden space-y-4'>
				{Array.from({ length: 6 }).map((_, index) => (
					<Card key={index}>
						<CardContent className='p-4'>
							<div className='flex justify-between items-start mb-3'>
								<div className='flex items-start gap-3 flex-1'>
									<Skeleton className='h-16 w-16 rounded-lg flex-shrink-0' />
									<div className='flex-1'>
										<Skeleton className='h-6 w-3/4 mb-2' />
										<Skeleton className='h-4 w-1/2 mb-2' />
										<Skeleton className='h-6 w-16 rounded-full' />
									</div>
								</div>
								<div className='flex items-center gap-2'>
									<Skeleton className='h-8 w-8 rounded' />
									<Skeleton className='h-8 w-8 rounded' />
								</div>
							</div>
							<div className='grid grid-cols-2 gap-3 mb-3'>
								<Skeleton className='h-4 w-full' />
								<Skeleton className='h-4 w-full' />
								<Skeleton className='h-4 w-full' />
								<Skeleton className='h-4 w-full' />
							</div>
							<div className='flex justify-between items-center pt-3 border-t'>
								<Skeleton className='h-4 w-20' />
								<Skeleton className='h-6 w-24' />
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		</>
	)

	return (
		<ProtectedRoute requiredRole='admin'>
			<AdminLayout>
				<div className='h-full overflow-y-auto'>
					<div className='min-h-full p-4 sm:p-6 space-y-6'>
						{/* Header */}
						<div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
							<div>
								<h1 className='text-xl sm:text-2xl font-bold text-gray-900'>
									Product Purchases
								</h1>
								<p className='text-sm sm:text-base text-gray-600'>
									Manage product purchases for branches
								</p>
							</div>
							<Button
								onClick={() => setShowForm(true)}
								className='w-full sm:w-auto'
							>
								<Plus className='h-4 w-4 mr-2' />
								Add Purchase
							</Button>
						</div>

						{/* Filters */}
						<Card>
							<CardContent className='p-4'>
								<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4'>
									<div className='relative'>
										<Search className='absolute left-3 top-3 h-4 w-4 text-gray-400' />
										<Input
											placeholder='Search purchases...'
											value={filters.search || ''}
											onChange={e => handleSearch(e.target.value)}
											className='pl-10'
										/>
									</div>
									<Select
										value={filters.category || 'all'}
										onValueChange={value =>
											setFilters(prev => ({
												...prev,
												category: value as ProductCategory | 'all',
												page: 1,
											}))
										}
									>
										<SelectTrigger>
											<SelectValue placeholder='Category' />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value='all'>All Categories</SelectItem>
											{CATEGORIES.map(cat => (
												<SelectItem key={cat} value={cat}>
													{cat
														.replace('-', ' ')
														.replace(/\b\w/g, l => l.toUpperCase())}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<Select
										value={filters.status || 'all'}
										onValueChange={value =>
											setFilters(prev => ({
												...prev,
												status: value as PurchaseStatus | 'all',
												page: 1,
											}))
										}
									>
										<SelectTrigger>
											<SelectValue placeholder='Status' />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value='all'>All Status</SelectItem>
											{STATUS_OPTIONS.map(status => (
												<SelectItem key={status} value={status}>
													{status.charAt(0).toUpperCase() + status.slice(1)}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<Input
										placeholder='Branch'
										value={filters.branch === 'all' ? '' : filters.branch || ''}
										onChange={e =>
											setFilters(prev => ({
												...prev,
												branch: e.target.value || 'all',
												page: 1,
											}))
										}
									/>
									<Button
										variant='outline'
										onClick={() =>
											setFilters({
												category: 'all',
												branch: 'all',
												status: 'all',
												search: '',
												page: 1,
												limit: 12,
											})
										}
									>
										<Filter className='h-4 w-4 mr-2' />
										Clear
									</Button>
								</div>
							</CardContent>
						</Card>

						{/* Stats Cards */}
						<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
							<Card>
								<CardContent className='p-4'>
									<div className='flex items-center justify-between'>
										<div>
											<p className='text-sm font-medium text-gray-600'>
												Total Purchases
											</p>
											<p className='text-2xl font-bold'>
												{pagination?.total || 0}
											</p>
										</div>
										<Package className='h-8 w-8 text-blue-600' />
									</div>
								</CardContent>
							</Card>
							<Card>
								<CardContent className='p-4'>
									<div className='flex items-center justify-between'>
										<div>
											<p className='text-sm font-medium text-gray-600'>
												Pending
											</p>
											<p className='text-2xl font-bold text-yellow-600'>
												{purchases.filter(p => p.status === 'pending').length}
											</p>
										</div>
										<Calendar className='h-8 w-8 text-yellow-600' />
									</div>
								</CardContent>
							</Card>
							<Card>
								<CardContent className='p-4'>
									<div className='flex items-center justify-between'>
										<div>
											<p className='text-sm font-medium text-gray-600'>
												Completed
											</p>
											<p className='text-2xl font-bold text-green-600'>
												{purchases.filter(p => p.status === 'received').length}
											</p>
										</div>
										<Package className='h-8 w-8 text-green-600' />
									</div>
								</CardContent>
							</Card>
							<Card>
								<CardContent className='p-4'>
									<div className='flex items-center justify-between'>
										<div>
											<p className='text-sm font-medium text-gray-600'>
												Total Value
											</p>
											<p className='text-2xl font-bold text-blue-600'>
												₩
												{purchases
													.reduce((sum, p) => sum + p.totalAmount, 0)
													.toLocaleString()}
											</p>
										</div>
										<DollarSign className='h-8 w-8 text-blue-600' />
									</div>
								</CardContent>
							</Card>
						</div>

						{/* Purchases List */}
						{loading ? (
							<PurchasesSkeleton />
						) : purchases.length === 0 ? (
							<Card>
								<CardContent className='p-8 text-center'>
									<Package className='h-12 w-12 mx-auto text-gray-400 mb-4' />
									<h3 className='text-lg font-medium text-gray-900 mb-2'>
										No purchases found
									</h3>
									<p className='text-gray-600 mb-4'>
										Get started by adding your first purchase.
									</p>
									<Button onClick={() => setShowForm(true)}>
										<Plus className='h-4 w-4 mr-2' />
										Add Purchase
									</Button>
								</CardContent>
							</Card>
						) : (
							<>
								{/* Desktop Table View */}
								<div className='hidden lg:block'>
									<Card>
										<CardContent className='p-0'>
											<div className='overflow-x-auto'>
												<table className='w-full'>
													<thead className='bg-gray-50 border-b'>
														<tr>
															<th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
																Image
															</th>
															<th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
																Product
															</th>
															<th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
																Status
															</th>
															<th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
																Date
															</th>
															<th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
																Category
															</th>
															<th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
																Branch
															</th>
															<th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
																Payment
															</th>
															<th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
																Quantity
															</th>
															<th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
																Unit Price
															</th>
															<th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
																Total
															</th>
															<th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
																Actions
															</th>
														</tr>
													</thead>
													<tbody className='bg-white divide-y divide-gray-200'>
														{purchases.map(purchase => (
															<PurchaseItem
																key={purchase._id}
																purchase={purchase}
																onEdit={setEditingPurchase}
																onDelete={handleDeletePurchase}
																onView={setViewingPurchase}
															/>
														))}
													</tbody>
												</table>
											</div>
										</CardContent>
									</Card>
								</div>

								{/* Mobile Card View */}
								<div className='lg:hidden space-y-4'>
									{purchases.map(purchase => (
										<MobilePurchaseCard
											key={purchase._id}
											purchase={purchase}
											onEdit={setEditingPurchase}
											onDelete={handleDeletePurchase}
											onView={setViewingPurchase}
										/>
									))}
								</div>
							</>
						)}

						{/* Pagination */}
						{(pagination?.pages || 0) > 1 && (
							<div className='flex justify-center items-center gap-2'>
								<Button
									variant='outline'
									disabled={(pagination?.current || 1) === 1}
									onClick={() =>
										setFilters(prev => ({ ...prev, page: prev.page! - 1 }))
									}
								>
									Previous
								</Button>
								<span className='text-sm text-gray-600'>
									Page {pagination?.current || 1} of {pagination?.pages || 1}
								</span>
								<Button
									variant='outline'
									disabled={
										(pagination?.current || 1) === (pagination?.pages || 1)
									}
									onClick={() =>
										setFilters(prev => ({ ...prev, page: prev.page! + 1 }))
									}
								>
									Next
								</Button>
							</div>
						)}
					</div>
				</div>

				{/* Add/Edit Purchase Dialog */}
				<Dialog
					open={showForm || editingPurchase !== null}
					onOpenChange={open => {
						if (!open) {
							setShowForm(false)
							setEditingPurchase(null)
						}
					}}
				>
					<DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
						<DialogHeader>
							<DialogTitle>
								{editingPurchase ? 'Edit Purchase' : 'Add New Purchase'}
							</DialogTitle>
						</DialogHeader>
						<PurchaseForm
							purchase={editingPurchase || undefined}
							onSubmit={
								editingPurchase ? handleUpdatePurchase : handleCreatePurchase
							}
							onCancel={() => {
								setShowForm(false)
								setEditingPurchase(null)
							}}
							loading={actionLoading === 'create' || actionLoading === 'update'}
						/>
					</DialogContent>
				</Dialog>

				{/* Purchase Details Dialog */}
				<PurchaseDetailsDialog
					purchase={viewingPurchase}
					open={viewingPurchase !== null}
					onClose={() => setViewingPurchase(null)}
				/>
			</AdminLayout>
		</ProtectedRoute>
	)
}

export default PurchasesPage
