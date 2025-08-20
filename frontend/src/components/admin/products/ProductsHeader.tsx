import ImageUpload from '@/components/shared/ImageUpload'
import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
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
import { ProductCategory, ProductFormData, ProductUnit } from '@/types'
import { Plus } from 'lucide-react'
import React from 'react'

const CATEGORIES = [
	{ value: 'food' as ProductCategory, label: 'Food' },
	{ value: 'beverages' as ProductCategory, label: 'Beverages' },
	{ value: 'cleaning' as ProductCategory, label: 'Cleaning' },
	{ value: 'equipment' as ProductCategory, label: 'Equipment' },
	{ value: 'packaging' as ProductCategory, label: 'Packaging' },
	{ value: 'other' as ProductCategory, label: 'Other' },
]

const UNITS = [
	{ value: 'kg' as ProductUnit, label: 'Kilogram (kg)' },
	{ value: 'g' as ProductUnit, label: 'Gram (g)' },
	{ value: 'l' as ProductUnit, label: 'Liter (l)' },
	{ value: 'ml' as ProductUnit, label: 'Milliliter (ml)' },
	{ value: 'pieces' as ProductUnit, label: 'Pieces' },
	{ value: 'boxes' as ProductUnit, label: 'Boxes' },
	{ value: 'bottles' as ProductUnit, label: 'Bottles' },
	{ value: 'cans' as ProductUnit, label: 'Cans' },
	{ value: 'packets' as ProductUnit, label: 'Packets' },
]

// Helper function to format price in Korean Won
const formatKRW = (price: number): string => {
	return new Intl.NumberFormat('ko-KR', {
		style: 'currency',
		currency: 'KRW',
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(price)
}

// Helper function to parse KRW input (remove formatting)
const parseKRWInput = (value: string): number => {
	const numericValue = value.replace(/[^\d]/g, '')
	return parseInt(numericValue) || 0
}

interface ProductsHeaderProps {
	isCreateDialogOpen: boolean
	setIsCreateDialogOpen: (open: boolean) => void
	formData: ProductFormData
	setFormData: React.Dispatch<React.SetStateAction<ProductFormData>>
	onCreateProduct: (e: React.FormEvent) => void
	formLoading: boolean
	resetForm: () => void
}

const ProductsHeader: React.FC<ProductsHeaderProps> = ({
	isCreateDialogOpen,
	setIsCreateDialogOpen,
	formData,
	setFormData,
	onCreateProduct,
	formLoading,
	resetForm,
}) => {
	return (
		<div className='flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4'>
			<div>
				<h1 className='text-xl sm:text-2xl font-bold text-gray-900'>
					Product Management
				</h1>
				<p className='mt-1 sm:mt-2 text-sm sm:text-base text-gray-600'>
					Manage your restaurant supply products
				</p>
			</div>
			<Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
				<DialogTrigger asChild>
					<Button onClick={resetForm} className='w-full sm:w-auto'>
						<Plus className='h-4 w-4 mr-2' />
						Add Product
					</Button>
				</DialogTrigger>
				<DialogContent className='sm:max-w-[425px] mx-4 max-h-[90vh] overflow-y-auto'>
					<DialogHeader>
						<DialogTitle className='text-lg sm:text-xl'>
							Create New Product
						</DialogTitle>
						<DialogDescription>
							Add a new product to your inventory catalog.
						</DialogDescription>
					</DialogHeader>
					<form onSubmit={onCreateProduct} className='space-y-4'>
						<div>
							<Label htmlFor='name' className='text-sm font-medium'>
								Product Name *
							</Label>
							<Input
								id='name'
								value={formData.name}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
									setFormData(prev => ({ ...prev, name: e.target.value }))
								}
								placeholder='Enter product name'
								required
								className='mt-1'
							/>
						</div>
						<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
							<div>
								<Label htmlFor='category' className='text-sm font-medium'>
									Category *
								</Label>
								<Select
									value={formData.category}
									onValueChange={(value: ProductCategory) =>
										setFormData(prev => ({ ...prev, category: value }))
									}
								>
									<SelectTrigger className='mt-1'>
										<SelectValue placeholder='Select category' />
									</SelectTrigger>
									<SelectContent>
										{CATEGORIES.map(category => (
											<SelectItem key={category.value} value={category.value}>
												{category.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div>
								<Label htmlFor='unit' className='text-sm font-medium'>
									Unit *
								</Label>
								<Select
									value={formData.unit}
									onValueChange={(value: ProductUnit) =>
										setFormData(prev => ({ ...prev, unit: value }))
									}
								>
									<SelectTrigger className='mt-1'>
										<SelectValue placeholder='Select unit' />
									</SelectTrigger>
									<SelectContent>
										{UNITS.map(unit => (
											<SelectItem key={unit.value} value={unit.value}>
												{unit.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</div>
						<div>
							<Label htmlFor='supplier' className='text-sm font-medium'>
								Supplier
							</Label>
							<Input
								id='supplier'
								value={formData.supplier}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
									setFormData(prev => ({
										...prev,
										supplier: e.target.value,
									}))
								}
								placeholder='Enter supplier name'
								className='mt-1'
							/>
						</div>
						<div>
							<Label htmlFor='price' className='text-sm font-medium'>
								Price (KRW) *
							</Label>
							<Input
								id='price'
								type='text'
								value={formData.price ? formatKRW(formData.price) : ''}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
									setFormData(prev => ({
										...prev,
										price: parseKRWInput(e.target.value),
									}))
								}
								placeholder='₩0 (Korean Won)'
								required
								className='mt-1'
							/>
						</div>
						<div>
							<Label htmlFor='description' className='text-sm font-medium'>
								Description
							</Label>
							<textarea
								id='description'
								value={formData.description}
								onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
									setFormData(prev => ({
										...prev,
										description: e.target.value,
									}))
								}
								placeholder='Enter product description'
								rows={3}
								className='flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1'
							/>
						</div>

						{/* Image Upload */}
						<ImageUpload
							images={formData.images || []}
							onImagesChange={images =>
								setFormData(prev => ({
									...prev,
									images,
								}))
							}
							maxImages={5}
							disabled={formLoading}
						/>
						<div className='flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2'>
							<Button
								type='button'
								variant='outline'
								onClick={() => setIsCreateDialogOpen(false)}
								className='w-full sm:w-auto'
							>
								Cancel
							</Button>
							<Button
								type='submit'
								disabled={formLoading}
								className='w-full sm:w-auto'
							>
								{formLoading ? 'Creating...' : 'Create Product'}
							</Button>
						</div>
					</form>
				</DialogContent>
			</Dialog>
		</div>
	)
}

export default ProductsHeader
