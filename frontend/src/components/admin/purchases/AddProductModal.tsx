'use client'

import ImageUpload from '@/components/shared/ImageUpload'
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
import { productsApi } from '@/lib/api'
import { ProductCategory, ProductFormData, ProductUnit } from '@/types'
import { Package } from 'lucide-react'
import React, { useState } from 'react'
import { toast } from 'sonner'

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
	const [formData, setFormData] = useState<ProductFormData>({
		name: '',
		description: '',
		price: 0,
		category: 'main-products',
		unit: 'pieces',
		amount: 0, // Keep for compatibility but won't be used in UI
		count: 0,
		purchaseSite: '',
		supplier: '',
		contact: '',
		monthlyUsage: 0,
		images: [],
	})
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
		setLoading(true)

		try {
			await productsApi.createProduct(formData)
			toast.success('Product created successfully!')
			onProductCreated()
			onClose()
			// Reset form
			setFormData({
				name: '',
				description: '',
				price: 0,
				category: 'main-products',
				unit: 'pieces',
				amount: 0, // Keep for compatibility
				count: 0,
				purchaseSite: '',
				supplier: '',
				contact: '',
				monthlyUsage: 0,
				images: [],
			})
		} catch (error) {
			console.error('Error creating product:', error)
			toast.error('Failed to create product')
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
									<SelectItem value='main-products'>Main Products</SelectItem>
									<SelectItem value='frozen-products'>
										Frozen Products
									</SelectItem>
									<SelectItem value='desserts'>Desserts</SelectItem>
									<SelectItem value='drinks'>Drinks</SelectItem>
									<SelectItem value='packaging-materials'>
										Packaging Materials
									</SelectItem>
									<SelectItem value='cleaning-materials'>
										Cleaning Materials
									</SelectItem>
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
								value={formData.price}
								onChange={e =>
									handleInputChange('price', parseFloat(e.target.value) || 0)
								}
								required
								min='0'
								step='0.01'
								className='mt-1 text-sm'
							/>
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
								placeholder='https://...'
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
								min='0'
								className='mt-1 text-sm'
							/>
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

					{/* Total Price Preview */}
					<Card className='bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'>
						<CardContent className='p-4'>
							<h4 className='font-semibold text-gray-800 mb-2 text-sm'>
								Total Price Preview
							</h4>
							<div className='text-2xl font-bold text-green-600'>
								₩{(formData.count * formData.price).toLocaleString()}
							</div>
							<p className='text-sm text-gray-600 mt-1'>
								{formData.count} × ₩{formData.price.toLocaleString()} = ₩
								{(formData.count * formData.price).toLocaleString()}
							</p>
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
