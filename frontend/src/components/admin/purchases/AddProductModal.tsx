'use client'

import ImageUpload from '@/components/shared/ImageUpload'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { CharacterCounterWithError } from '@/components/ui/character-counter'
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
import { productsApi, purchasesApi } from '@/lib/api'
import {
	formatValidationErrors,
	getErrorMessage,
	getValidationErrors,
} from '@/lib/errorUtils'
import {
	validateProductFormWithToast,
	VALIDATION_RULES,
} from '@/lib/validationUtils'
import {
	PaymentMethod,
	ProductCategory,
	ProductFormData,
	ProductUnit,
} from '@/types'
import { CreditCard, Package } from 'lucide-react'
import React, { useState } from 'react'
import { toast } from 'sonner'
import { getPurchaseCategoryOptions } from './categoryDisplay'

interface AddProductModalProps {
	open: boolean
	onClose: () => void
	onProductCreated: () => void
}

const AddProductModal: React.FC<AddProductModalProps> = ({
	open,
	onClose,
	onProductCreated,
}) => {
	const getInitialFormData = (): ProductFormData => ({
		name: '',
		description: '',
		price: 0,
		category: 'food-products' as ProductCategory,
		unit: 'pieces',
		amount: 0,
		count: 0,
		purchaseSite: '',
		supplier: '',
		contact: '',
		monthlyUsage: 0,
		images: [],
	})

	const [formData, setFormData] = useState<ProductFormData>(
		getInitialFormData()
	)
	const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash')
	const [createPurchase, setCreatePurchase] = useState(false)
	const [loading, setLoading] = useState(false)

	const handleInputChange = (
		field: keyof ProductFormData,
		value: string | number
	) => {
		setFormData(prev => ({ ...prev, [field]: value }))
	}

	const handleImageUpload = (images: { url: string; publicId: string }[]) => {
		const productImages = images.map(img => ({
			...img,
			isPrimary: false,
		}))
		setFormData(prev => ({ ...prev, images: productImages }))
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		// Frontend validation
		if (!validateProductFormWithToast(formData)) {
			return
		}

		setLoading(true)

		try {
			// Create the product
			const createdProduct = await productsApi.createProduct(formData)
			toast.success('Product created successfully!')

			// If createPurchase is enabled, also create a purchase record
			if (createPurchase && formData.count > 0 && formData.price > 0) {
				try {
					const totalPrice = formData.count * formData.price
					const purchaseData = {
						productId: createdProduct.product._id,
						productName: formData.name,
						category: formData.category,
						quantity: formData.count,
						price: totalPrice,
						providerName: formData.supplier || '',
						paymentWay: paymentMethod,
						unit: formData.unit,
						date: new Date().toISOString(),
						branch: 'main', // Default branch
						images: formData.images || [],
					}

					await purchasesApi.createPurchase(purchaseData)
					toast.success('Purchase created successfully!')
				} catch (purchaseError) {
					console.error('Error creating purchase:', purchaseError)
					toast.error('Product created but failed to create purchase')
				}
			}

			onProductCreated()
			onClose()
			setFormData(getInitialFormData())
			setPaymentMethod('cash')
			setCreatePurchase(false)
		} catch (error) {
			console.error('Error creating product - Full error:', error)

			const validationErrors = getValidationErrors(error)

			if (validationErrors.length > 0) {
				const errorMessages = formatValidationErrors(validationErrors)
				toast.error(`Validation failed: ${errorMessages}`)
			} else {
				const errorMessage = getErrorMessage(error)
				toast.error(
					errorMessage || 'Failed to create product. Please try again.'
				)
			}
		} finally {
			setLoading(false)
		}
	}

	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
				<DialogHeader>
					<DialogTitle className='flex items-center gap-2 text-lg'>
						<Package className='h-4 w-4' />
						Add New Product
					</DialogTitle>
				</DialogHeader>

				<form onSubmit={handleSubmit} className='space-y-6'>
					{/* Product Images */}
					<div>
						<Label className='text-sm font-medium'>Product Images</Label>
						<div className='mt-2'>
							<ImageUpload
								images={formData.images || []}
								onImagesChange={handleImageUpload}
								maxImages={5}
							/>
						</div>
					</div>

					{/* Basic Information */}
					<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
						<div>
							<Label htmlFor='name' className='text-sm font-medium'>
								Product Name *
							</Label>
							<Input
								id='name'
								value={formData.name}
								onChange={e => handleInputChange('name', e.target.value)}
								required
								className='mt-1 text-sm'
							/>
						</div>

						<div>
							<Label htmlFor='category' className='text-sm font-medium'>
								Category *
							</Label>
							<Select
								value={formData.category}
								onValueChange={value =>
									handleInputChange('category', value as ProductCategory)
								}
							>
								<SelectTrigger className='mt-1 text-sm'>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{getPurchaseCategoryOptions().map(category => (
										<SelectItem key={category.value} value={category.value}>
											{category.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div>
							<Label htmlFor='price' className='text-sm font-medium'>
								Unit Price (₩) *
							</Label>
							<Input
								id='price'
								type='number'
								value={formData.price || ''}
								onChange={e => {
									const value = e.target.value
									if (value === '') {
										handleInputChange('price', 0)
									} else {
										const numValue = parseFloat(value)
										if (!isNaN(numValue) && numValue >= 0) {
											handleInputChange('price', numValue)
										}
									}
								}}
								required
								min='0.01'
								step='0.01'
								placeholder='0.00'
								className='mt-1 text-sm'
							/>
							{formData.price <= 0 && (
								<p className='text-xs text-red-500 mt-1'>
									Price must be greater than 0
								</p>
							)}
						</div>

						<div>
							<Label htmlFor='unit' className='text-sm font-medium'>
								Unit *
							</Label>
							<Select
								value={formData.unit}
								onValueChange={value =>
									handleInputChange('unit', value as ProductUnit)
								}
							>
								<SelectTrigger className='mt-1 text-sm'>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value='pieces'>Pieces</SelectItem>
									<SelectItem value='kg'>Kilograms</SelectItem>
									<SelectItem value='liters'>Liters</SelectItem>
									<SelectItem value='boxes'>Boxes</SelectItem>
									<SelectItem value='bottles'>Bottles</SelectItem>
									<SelectItem value='cans'>Cans</SelectItem>
									<SelectItem value='packets'>Packets</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>

					{/* Quantity Information */}
					<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
						<div>
							<Label htmlFor='count' className='text-sm font-medium'>
								Quantity
							</Label>
							<Input
								id='count'
								type='number'
								value={formData.count}
								onChange={e =>
									handleInputChange('count', parseInt(e.target.value) || 0)
								}
								min='0'
								className='mt-1 text-sm'
								placeholder='Enter quantity'
							/>
						</div>

						<div>
							<Label htmlFor='totalPrice' className='text-sm font-medium'>
								Total Price (₩)
							</Label>
							<Input
								id='totalPrice'
								type='number'
								value={formData.count * formData.price}
								disabled
								className='mt-1 text-sm bg-gray-50'
								placeholder='Auto-calculated'
							/>
						</div>
					</div>

					{/* Supplier Information */}
					<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
						<div>
							<Label htmlFor='supplier' className='text-sm font-medium'>
								Supplier *
							</Label>
							<Input
								id='supplier'
								value={formData.supplier}
								onChange={e => handleInputChange('supplier', e.target.value)}
								required
								className='mt-1 text-sm'
							/>
						</div>

						<div>
							<Label htmlFor='contact' className='text-sm font-medium'>
								Contact
							</Label>
							<Input
								id='contact'
								value={formData.contact}
								onChange={e => handleInputChange('contact', e.target.value)}
								maxLength={VALIDATION_RULES.product.contact.maxLength}
								className='mt-1 text-sm'
							/>
							<CharacterCounterWithError
								current={formData.contact?.length || 0}
								max={VALIDATION_RULES.product.contact.maxLength}
								warningThreshold={0.8}
								showError={
									(formData.contact?.length || 0) >
									VALIDATION_RULES.product.contact.maxLength
								}
								errorMessage='Contact cannot exceed 100 characters'
							/>
						</div>

						<div>
							<Label htmlFor='purchaseSite' className='text-sm font-medium'>
								Purchase Site
							</Label>
							<Input
								id='purchaseSite'
								value={formData.purchaseSite}
								onChange={e =>
									handleInputChange('purchaseSite', e.target.value)
								}
								maxLength={VALIDATION_RULES.product.purchaseSite.maxLength}
								placeholder='https://...'
								className='mt-1 text-sm'
							/>
							<CharacterCounterWithError
								current={formData.purchaseSite?.length || 0}
								max={VALIDATION_RULES.product.purchaseSite.maxLength}
								warningThreshold={0.9}
								showError={
									(formData.purchaseSite?.length || 0) >
									VALIDATION_RULES.product.purchaseSite.maxLength
								}
								errorMessage='Purchase site cannot exceed 200 characters'
							/>
						</div>

						<div>
							<Label htmlFor='monthlyUsage' className='text-sm font-medium'>
								Monthly Usage
							</Label>
							<Input
								id='monthlyUsage'
								type='number'
								value={formData.monthlyUsage}
								onChange={e =>
									handleInputChange(
										'monthlyUsage',
										parseInt(e.target.value) || 0
									)
								}
								min='0'
								className='mt-1 text-sm'
							/>
						</div>

						<div>
							<Label
								htmlFor='paymentMethod'
								className='text-sm font-medium flex items-center gap-2'
							>
								<CreditCard className='h-4 w-4' />
								Payment Method *
							</Label>
							<Select
								value={paymentMethod}
								onValueChange={value =>
									setPaymentMethod(value as PaymentMethod)
								}
							>
								<SelectTrigger className='mt-1 text-sm'>
									<SelectValue placeholder='Select payment method' />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value='cash'>Cash</SelectItem>
									<SelectItem value='credit-card'>Card</SelectItem>
									<SelectItem value='bank-transfer'>Transfer</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>

					{/* Description */}
					<div>
						<Label htmlFor='description' className='text-sm font-medium'>
							Description
						</Label>
						<Input
							id='description'
							value={formData.description}
							onChange={e => handleInputChange('description', e.target.value)}
							className='mt-1 text-sm'
						/>
					</div>

					{/* Create Purchase Option */}
					<div className='flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200'>
						<input
							type='checkbox'
							id='createPurchase'
							checked={createPurchase}
							onChange={e => setCreatePurchase(e.target.checked)}
							className='w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500'
						/>
						<Label
							htmlFor='createPurchase'
							className='text-sm font-medium text-gray-700 cursor-pointer'
						>
							Create purchase record for this product
						</Label>
					</div>

					{/* Total Price Preview */}
					<Card className='bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'>
						<CardContent className='p-4'>
							<h4 className='font-semibold text-gray-800 mb-2 text-sm'>
								{createPurchase ? 'Purchase Summary' : 'Total Price Preview'}
							</h4>
							<div className='text-2xl font-bold text-green-600'>
								₩{(formData.count * formData.price).toLocaleString()}
							</div>
							<p className='text-sm text-gray-600 mt-1'>
								{formData.count} × ₩{formData.price.toLocaleString()} = ₩
								{(formData.count * formData.price).toLocaleString()}
							</p>
							{createPurchase && (
								<div className='mt-2 pt-2 border-t border-blue-200'>
									<p className='text-sm text-gray-600'>
										Payment Method:{' '}
										<span className='font-medium capitalize'>
											{paymentMethod === 'credit-card'
												? 'Card'
												: paymentMethod === 'bank-transfer'
												? 'Transfer'
												: 'Cash'}
										</span>
									</p>
								</div>
							)}
						</CardContent>
					</Card>

					<div className='flex justify-end gap-3 pt-4'>
						<Button
							type='button'
							variant='outline'
							onClick={onClose}
							disabled={loading}
							className='text-sm'
						>
							Cancel
						</Button>
						<Button
							type='submit'
							disabled={loading}
							className='bg-blue-600 hover:bg-blue-700 text-white text-sm'
						>
							{loading ? (
								<>
									<div className='animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2'></div>
									Creating...
								</>
							) : (
								<>
									<Package className='h-3 w-3 mr-2' />
									Create Product
								</>
							)}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	)
}

export default AddProductModal
