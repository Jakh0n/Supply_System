'use client'

import ImageUpload from '@/components/shared/ImageUpload'
import { Badge } from '@/components/ui/badge'
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
import {
	PaymentMethod,
	Product,
	ProductCategory,
	ProductImage,
	ProductPurchaseFormData,
	ProductUnit,
} from '@/types'
import { Package } from 'lucide-react'
import React, { useState } from 'react'

interface QuickPurchaseModalProps {
	product: Product | null
	open: boolean
	onClose: () => void
	onSubmit: (data: ProductPurchaseFormData) => void
	loading?: boolean
}

const QuickPurchaseModal: React.FC<QuickPurchaseModalProps> = ({
	product,
	open,
	onClose,
	onSubmit,
	loading = false,
}) => {
	const [formData, setFormData] = useState<ProductPurchaseFormData>({
		date: new Date().toISOString().split('T')[0],
		category: 'main-products',
		productName: '',
		price: 0,
		providerName: '',
		paymentWay: 'cash',
		quantity: 1,
		unit: 'pieces',
		notes: '',
		branch: '',
		images: [],
	})

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		onSubmit(formData)
	}

	const handleImageUpload = (images: ProductImage[]) => {
		setFormData(prev => ({ ...prev, images }))
	}

	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
				<DialogHeader>
					<DialogTitle className='flex items-center gap-2'>
						<Package className='h-5 w-5' />
						{product ? `Purchase - ${product.name}` : 'Create New Purchase'}
					</DialogTitle>
				</DialogHeader>

				<form onSubmit={handleSubmit} className='space-y-6'>
					<div>
						<Label htmlFor='date'>Purchase Date *</Label>
						<Input
							id='date'
							type='date'
							value={formData.date}
							onChange={e =>
								setFormData(prev => ({ ...prev, date: e.target.value }))
							}
							required
						/>
					</div>

					<div>
						<Label htmlFor='category'>Category *</Label>
						<Select
							value={formData.category}
							onValueChange={value =>
								setFormData(prev => ({
									...prev,
									category: value as ProductCategory,
								}))
							}
						>
							<SelectTrigger>
								<SelectValue placeholder='Select category' />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='frozen-products'>Frozen Products</SelectItem>
								<SelectItem value='main-products'>Main Products</SelectItem>
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
						<Label htmlFor='productName'>Product Name *</Label>
						<Input
							id='productName'
							value={formData.productName}
							onChange={e =>
								setFormData(prev => ({ ...prev, productName: e.target.value }))
							}
							placeholder='Enter product name'
							required
						/>
					</div>

					<div className='grid grid-cols-2 gap-4'>
						<div>
							<Label htmlFor='price'>Unit Price (₩) *</Label>
							<Input
								id='price'
								type='number'
								value={formData.price}
								onChange={e =>
									setFormData(prev => ({
										...prev,
										price: Number(e.target.value),
									}))
								}
								placeholder='0'
								min='0'
								required
							/>
						</div>
						<div>
							<Label htmlFor='quantity'>Quantity *</Label>
							<Input
								id='quantity'
								type='number'
								value={formData.quantity}
								onChange={e =>
									setFormData(prev => ({
										...prev,
										quantity: Number(e.target.value),
									}))
								}
								placeholder='1'
								min='1'
								required
							/>
						</div>
					</div>

					<div>
						<Label htmlFor='unit'>Unit *</Label>
						<Select
							value={formData.unit}
							onValueChange={value =>
								setFormData(prev => ({ ...prev, unit: value as ProductUnit }))
							}
						>
							<SelectTrigger>
								<SelectValue placeholder='Select unit' />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='pieces'>Pieces</SelectItem>
								<SelectItem value='kg'>Kilograms</SelectItem>
								<SelectItem value='liters'>Liters</SelectItem>
								<SelectItem value='boxes'>Boxes</SelectItem>
								<SelectItem value='packs'>Packs</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div>
						<Label htmlFor='providerName'>Provider/Supplier *</Label>
						<Input
							id='providerName'
							value={formData.providerName}
							onChange={e =>
								setFormData(prev => ({ ...prev, providerName: e.target.value }))
							}
							placeholder='Enter provider name'
							required
						/>
					</div>

					<div>
						<Label htmlFor='paymentWay'>Payment Method *</Label>
						<Select
							value={formData.paymentWay}
							onValueChange={value =>
								setFormData(prev => ({
									...prev,
									paymentWay: value as PaymentMethod,
								}))
							}
						>
							<SelectTrigger>
								<SelectValue placeholder='Select payment method' />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='cash'>Cash</SelectItem>
								<SelectItem value='card'>Card</SelectItem>
								<SelectItem value='bank-transfer'>Bank Transfer</SelectItem>
								<SelectItem value='credit'>Credit</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div>
						<Label htmlFor='branch'>Branch *</Label>
						<Input
							id='branch'
							value={formData.branch}
							onChange={e =>
								setFormData(prev => ({ ...prev, branch: e.target.value }))
							}
							placeholder='Enter branch name'
							required
						/>
					</div>

					<div>
						<Label htmlFor='notes'>Notes</Label>
						<textarea
							id='notes'
							value={formData.notes}
							onChange={e =>
								setFormData(prev => ({ ...prev, notes: e.target.value }))
							}
							placeholder='Additional notes...'
							className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
							rows={3}
						/>
					</div>

					<div>
						<Label>Images</Label>
						<ImageUpload
							images={formData.images || []}
							onImagesChange={handleImageUpload}
							maxImages={5}
						/>
					</div>

					<div className='bg-gray-50 p-4 rounded-lg'>
						<div className='flex justify-between items-center'>
							<span className='text-lg font-medium'>Total Amount:</span>
							<Badge variant='outline' className='text-lg font-bold'>
								₩{(formData.price * formData.quantity).toLocaleString()}
							</Badge>
						</div>
					</div>

					<div className='flex justify-end gap-3 pt-4'>
						<Button type='button' variant='outline' onClick={onClose}>
							Cancel
						</Button>
						<Button type='submit' disabled={loading}>
							{loading ? 'Creating...' : 'Create Purchase'}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	)
}

export default QuickPurchaseModal
