'use client'

import {
	AddProductModal,
	BuyWithEditModal,
	ProductCatalog,
	PurchaseHistory,
} from '@/components/admin/purchases'
import AdminLayout from '@/components/shared/AdminLayout'
import ProtectedRoute from '@/components/shared/ProtectedRoute'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { productsApi, purchasesApi } from '@/lib/api'
import {
	PaymentMethod,
	Product,
	ProductFormData,
	ProductPurchase,
} from '@/types'
import { Activity, DollarSign, ShoppingCart, TrendingUp } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'

const PurchasesPage: React.FC = () => {
	// State for purchase history
	const [purchases, setPurchases] = useState<ProductPurchase[]>([])
	const [purchaseLoading, setPurchaseLoading] = useState(true)
	const [purchaseRefreshTrigger, setPurchaseRefreshTrigger] = useState(0)

	// State for product catalog
	const [productRefreshTrigger, setProductRefreshTrigger] = useState(0)

	// Modal states
	const [showAddProductModal, setShowAddProductModal] = useState(false)
	const [selectedProductForBuy, setSelectedProductForBuy] =
		useState<Product | null>(null)
	const [showBuyWithEditModal, setShowBuyWithEditModal] = useState(false)

	// Fetch purchases
	const fetchPurchases = async () => {
		try {
			setPurchaseLoading(true)
			const response = await purchasesApi.getPurchases()
			setPurchases(response.purchases || [])
		} catch (error) {
			console.error('Error fetching purchases:', error)
			setPurchases([]) // Reset to empty array on error
		} finally {
			setPurchaseLoading(false)
		}
	}

	useEffect(() => {
		fetchPurchases()
	}, [purchaseRefreshTrigger])

	// Handler for product buy
	const handleProductBuy = (product: Product) => {
		setSelectedProductForBuy(product)
		setShowBuyWithEditModal(true)
	}

	// Handler for product delete
	const handleProductDelete = async (product: Product) => {
		// Show confirmation dialog
		const confirmed = window.confirm(
			`Are you sure you want to delete "${product.name}"? This action cannot be undone.`
		)

		if (!confirmed) return

		try {
			await productsApi.deleteProduct(product._id)
			toast.success('Product deleted successfully!')
			// Refresh product list
			setProductRefreshTrigger(prev => prev + 1)
		} catch (error) {
			console.error('Error deleting product:', error)
			toast.error('Failed to delete product')
		}
	}

	// Handler for buy with edit
	const handleBuyWithEdit = async (
		product: Product,
		updatedData?: Partial<ProductFormData>,
		paymentMethod: PaymentMethod = 'cash'
	) => {
		console.log('🛒 Creating purchase with product details:')
		console.log('📦 Product:', product)
		console.log('📝 Updated data:', updatedData)

		try {
			// Calculate quantity and price based on count only
			// Ensure we have valid values for calculation
			const count = updatedData?.count || product.count || 1 // Default to 1 if 0
			const unitPrice = updatedData?.price || product.price || 0
			const totalQuantity = count
			const totalPrice = totalQuantity * unitPrice

			console.log('📊 Purchase calculation:')
			console.log('  Count:', count)
			console.log('  Unit Price:', unitPrice)
			console.log('  Total Quantity:', totalQuantity)
			console.log('  Total Price:', totalPrice)

			// Validate that we have valid values
			if (totalQuantity <= 0) {
				throw new Error('Total quantity must be greater than 0')
			}
			if (unitPrice <= 0) {
				throw new Error('Unit price must be greater than 0')
			}

			const purchaseData = {
				productId: product._id,
				productName: updatedData?.name || product.name,
				category: updatedData?.category || product.category,
				quantity: totalQuantity,
				price: totalPrice,
				providerName: updatedData?.supplier || product.supplier || '',
				paymentWay: paymentMethod,
				unit: updatedData?.unit || product.unit,
				date: new Date().toISOString(),
				branch: 'main', // Default branch
				images: product.images || [],
			}

			console.log('📦 Final purchase data:', purchaseData)

			await purchasesApi.createPurchase(purchaseData)
			console.log('✅ Purchase created successfully!')
			toast.success('Purchase created successfully!')

			// Refresh both purchase history and product list
			setPurchaseRefreshTrigger(prev => prev + 1)
			setProductRefreshTrigger(prev => prev + 1)
		} catch (error) {
			console.error('❌ Error creating purchase:', error)
			toast.error('Failed to create purchase')
		}
	}

	// Handler for product created
	const handleProductCreated = () => {
		setProductRefreshTrigger(prev => prev + 1)
		// Also refresh purchases in case a purchase was created with the product
		setPurchaseRefreshTrigger(prev => prev + 1)
	}

	// Calculate stats
	const totalPurchases = purchases.length
	const totalAmount = purchases.reduce(
		(sum, purchase) => sum + (purchase.price || 0),
		0
	)
	const averageOrderValue =
		totalPurchases > 0 ? totalAmount / totalPurchases : 0

	// Debug logging
	console.log('📊 Stats calculation:', {
		purchases: purchases.length,
		totalPurchases,
		totalAmount,
		averageOrderValue,
		purchaseLoading,
	})

	return (
		<ProtectedRoute requiredRole='admin'>
			<AdminLayout>
				<div className='space-y-4 p-2 sm:space-y-6 sm:p-6'>
					{/* Header */}
					<div className='flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0'>
						<div>
							<h1 className='text-xl font-bold text-gray-900 sm:text-2xl'>
								Purchases
							</h1>
							<p className='text-sm text-gray-600 sm:text-base'>
								Manage your purchase orders and product catalog
							</p>
						</div>
					</div>

					{/* Stats Cards */}
					<div className='grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6'>
						<Card>
							<CardContent className='p-3 sm:p-6'>
								<div className='flex items-center'>
									<div className='p-1.5 sm:p-2 bg-blue-100 rounded-lg'>
										<ShoppingCart className='h-4 w-4 sm:h-6 sm:w-6 text-blue-600' />
									</div>
									<div className='ml-2 sm:ml-4 min-w-0 flex-1'>
										<p className='text-xs sm:text-sm font-medium text-gray-600 truncate'>
											Total Purchases
										</p>
										<p className='text-lg sm:text-2xl font-bold text-gray-900'>
											{purchaseLoading ? '...' : totalPurchases}
										</p>
									</div>
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardContent className='p-3 sm:p-6'>
								<div className='flex items-center'>
									<div className='p-1.5 sm:p-2 bg-green-100 rounded-lg'>
										<DollarSign className='h-4 w-4 sm:h-6 sm:w-6 text-green-600' />
									</div>
									<div className='ml-2 sm:ml-4 min-w-0 flex-1'>
										<p className='text-xs sm:text-sm font-medium text-gray-600 truncate'>
											Total Amount
										</p>
										<p className='text-lg sm:text-2xl font-bold text-gray-900 truncate'>
											{purchaseLoading
												? '...'
												: `₩${totalAmount.toLocaleString()}`}
										</p>
									</div>
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardContent className='p-3 sm:p-6'>
								<div className='flex items-center'>
									<div className='p-1.5 sm:p-2 bg-purple-100 rounded-lg'>
										<TrendingUp className='h-4 w-4 sm:h-6 sm:w-6 text-purple-600' />
									</div>
									<div className='ml-2 sm:ml-4 min-w-0 flex-1'>
										<p className='text-xs sm:text-sm font-medium text-gray-600 truncate'>
											Avg Order Value
										</p>
										<p className='text-lg sm:text-2xl font-bold text-gray-900 truncate'>
											{purchaseLoading
												? '...'
												: `₩${averageOrderValue.toLocaleString()}`}
										</p>
									</div>
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardContent className='p-3 sm:p-6'>
								<div className='flex items-center'>
									<div className='p-1.5 sm:p-2 bg-orange-100 rounded-lg'>
										<Activity className='h-4 w-4 sm:h-6 sm:w-6 text-orange-600' />
									</div>
									<div className='ml-2 sm:ml-4 min-w-0 flex-1'>
										<p className='text-xs sm:text-sm font-medium text-gray-600 truncate'>
											This Month
										</p>
										<p className='text-lg sm:text-2xl font-bold text-gray-900'>
											{purchaseLoading
												? '...'
												: purchases.filter(p => {
														const purchaseDate = new Date(p.createdAt)
														const now = new Date()
														return (
															purchaseDate.getMonth() === now.getMonth() &&
															purchaseDate.getFullYear() === now.getFullYear()
														)
												  }).length}
										</p>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Main Content */}
					<Tabs defaultValue='history' className='space-y-4 sm:space-y-6'>
						<TabsList className='grid w-full grid-cols-2 h-10 sm:h-11'>
							<TabsTrigger value='history' className='text-xs sm:text-sm'>
								Purchase History
							</TabsTrigger>
							<TabsTrigger value='products' className='text-xs sm:text-sm'>
								Product Catalog
							</TabsTrigger>
						</TabsList>

						<TabsContent value='history' className='space-y-4 sm:space-y-6'>
							<PurchaseHistory refreshTrigger={purchaseRefreshTrigger} />
						</TabsContent>

						<TabsContent value='products' className='space-y-4 sm:space-y-6'>
							<ProductCatalog
								refreshTrigger={productRefreshTrigger}
								onProductBuy={handleProductBuy}
								onProductDelete={handleProductDelete}
								onAddProduct={() => setShowAddProductModal(true)}
							/>
						</TabsContent>
					</Tabs>

					{/* Modals */}
					<AddProductModal
						open={showAddProductModal}
						onClose={() => setShowAddProductModal(false)}
						onProductCreated={handleProductCreated}
					/>

					<BuyWithEditModal
						open={showBuyWithEditModal}
						onClose={() => setShowBuyWithEditModal(false)}
						product={selectedProductForBuy}
						onBuy={handleBuyWithEdit}
					/>
				</div>
			</AdminLayout>
		</ProtectedRoute>
	)
}

export default PurchasesPage
