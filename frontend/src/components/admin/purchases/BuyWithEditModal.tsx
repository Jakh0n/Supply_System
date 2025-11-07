'use client'

import { Button } from '@/components/ui/button'
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
import { productsApi } from '@/lib/api'
import {
	PaymentMethod,
	Product,
	ProductCategory,
	ProductFormData,
	ProductUnit,
} from '@/types'
import { CreditCard, Package, ShoppingCart } from 'lucide-react'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { getPurchaseCategoryOptions } from './categoryDisplay'

interface BuyWithEditModalProps {
	open: boolean
	onClose: () => void
	product: Product | null
	onBuy: (
		product: Product,
		updatedData?: Partial<ProductFormData>,
		paymentMethod?: PaymentMethod
	) => void
}

const BuyWithEditModal: React.FC<BuyWithEditModalProps> = ({
	open,
	onClose,
	product,
	onBuy,
}) => {
	const [formData, setFormData] = useState({
		name: '',
		count: 0,
		unit: 'pieces' as ProductUnit,
		purchaseSite: '',
		supplier: '',
		contact: '',
		monthlyUsage: 0,
		price: 0,
		category: 'food-products' as ProductCategory,
		description: '',
	})
	const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash')
	const [loading, setLoading] = useState(false)
	const [hasChanges, setHasChanges] = useState(false)

	useEffect(() => {
		console.log('🔄 Modal opened with product:', product)
		console.log('📊 Product count value:', product?.count)
		console.log('📊 Product price value:', product?.price)

		if (product) {
			const initialData = {
				name: product.name,
				count: product.count || 0,
				unit: product.unit,
				purchaseSite: product.purchaseSite || '',
				supplier: product.supplier || '',
				contact: product.contact || '',
				monthlyUsage: product.monthlyUsage || 0,
				price: product.price,
				category: product.category,
				description: product.description || '',
			}
			console.log('📝 Product details loaded:', initialData)
			setFormData(initialData)
			setPaymentMethod('cash') // Reset payment method to default
			setHasChanges(false)
		}
	}, [product])

	// Track form data changes
	useEffect(() => {
		console.log('📊 Form data updated:', formData)
		console.log('🔢 Current calculation:', {
			count: formData.count,
			price: formData.price,
			total: formData.count * formData.price,
		})
	}, [formData])

	const handleInputChange = (field: string, value: string | number) => {
		console.log(`🔄 Field changed: ${field} = ${value}`)
		setFormData(prev => {
			const newData = { ...prev, [field]: value }
			console.log('📝 New form data:', newData)
			return newData
		})
		setHasChanges(true)
	}

	const handleBuy = async () => {
		console.log('🛒 Buy Now clicked!')
		console.log('📋 Current form data:', formData)
		console.log('🔍 Product:', product)

		setLoading(true)
		try {
			if (hasChanges) {
				console.log('🔄 Updating product first...')
				// Update product first, then buy
				await productsApi.updateProduct(product!._id, formData)
				console.log('✅ Product updated successfully!')
				toast.success('Product updated successfully!')
			}

			console.log('📦 Creating purchase with data:', formData)
			console.log('💳 Payment method:', paymentMethod)
			// Create purchase
			onBuy(product!, hasChanges ? formData : undefined, paymentMethod)
			console.log('✅ Purchase process completed!')
			onClose()
		} catch (error) {
			console.error('❌ Error updating product:', error)
			toast.error('Failed to update product')
		} finally {
			setLoading(false)
		}
	}

	if (!product) return null

	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
				<DialogHeader>
					<DialogTitle className='flex items-center gap-2 text-lg'>
						<ShoppingCart className='h-4 w-4' />
						Buy Product - {product.name}
					</DialogTitle>
				</DialogHeader>

				<div className='space-y-6'>
					{/* Product Image */}
					<div className='flex justify-center'>
						{product.images && product.images.length > 0 ? (
							<div className='w-24 h-24 rounded-lg overflow-hidden shadow-lg border border-gray-200'>
								<Image
									src={product.images[0].url}
									alt={product.name}
									width={96}
									height={96}
									className='w-full h-full object-cover'
								/>
							</div>
						) : (
							<div className='w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center shadow-lg border border-gray-200'>
								<Package className='h-12 w-12 text-gray-400' />
							</div>
						)}
					</div>

					{/* Product Details Form */}
					<div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
						<div>
							<Label htmlFor='name' className='text-sm font-medium'>
								Product Name
							</Label>
							<Input
								id='name'
								value={formData.name}
								onChange={e => handleInputChange('name', e.target.value)}
								className='mt-1 text-sm'
							/>
						</div>

						<div>
							<Label htmlFor='category' className='text-sm font-medium'>
								Category
							</Label>
							<Select
								value={formData.category}
								onValueChange={value => handleInputChange('category', value)}
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
								className='mt-1 text-sm'
							/>
						</div>

						<div>
							<Label htmlFor='unit' className='text-sm font-medium'>
								Unit
							</Label>
							<Select
								value={formData.unit}
								onValueChange={value => handleInputChange('unit', value)}
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

						<div>
							<Label htmlFor='price' className='text-sm font-medium'>
								Unit Price (₩)
							</Label>
							<Input
								id='price'
								type='number'
								value={formData.price}
								onChange={e =>
									handleInputChange('price', parseFloat(e.target.value) || 0)
								}
								className='mt-1 text-sm'
							/>
						</div>

						<div>
							<Label htmlFor='supplier' className='text-sm font-medium'>
								Supplier
							</Label>
							<Input
								id='supplier'
								value={formData.supplier}
								onChange={e => handleInputChange('supplier', e.target.value)}
								className='mt-1 text-sm'
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
								className='mt-1 text-sm'
								placeholder='https://...'
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
								className='mt-1 text-sm'
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

					{/* Purchase Summary */}
					<div className='bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg border border-blue-200'>
						<h4 className='font-semibold text-gray-800 mb-2 text-sm'>
							Purchase Summary
						</h4>
						<div className='grid grid-cols-2 gap-4 text-xs'>
							<div>
								<span className='text-gray-600'>Total Quantity:</span>
								<span className='font-medium ml-2'>
									{formData.count} {formData.unit}
								</span>
							</div>
							<div>
								<span className='text-gray-600'>Total Price:</span>
								<span className='font-bold text-green-600 ml-2'>
									₩{(formData.count * formData.price).toLocaleString()}
								</span>
							</div>
							<div>
								<span className='text-gray-600'>Payment Method:</span>
								<span className='font-medium ml-2 capitalize'>
									{paymentMethod === 'credit-card'
										? 'Card'
										: paymentMethod === 'bank-transfer'
										? 'Transfer'
										: 'Cash'}
								</span>
							</div>
						</div>
					</div>
				</div>

				<div className='flex justify-end gap-3 pt-4'>
					<Button
						variant='outline'
						onClick={onClose}
						disabled={loading}
						className='text-sm'
					>
						Cancel
					</Button>
					<Button
						onClick={handleBuy}
						disabled={loading}
						className='bg-blue-600 hover:bg-blue-700 text-white text-sm'
					>
						{loading ? (
							<>
								<div className='animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2'></div>
								Processing...
							</>
						) : (
							<>
								<ShoppingCart className='h-3 w-3 mr-2' />
								{hasChanges ? 'Update & Buy' : 'Buy Now'}
							</>
						)}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	)
}

export default BuyWithEditModal
