'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { purchasesApi } from '@/lib/api'
import { ProductPurchase } from '@/types'
import { Download, Package, Search } from 'lucide-react'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface PurchaseHistoryProps {
	refreshTrigger?: number
}

const PurchaseHistory: React.FC<PurchaseHistoryProps> = ({
	refreshTrigger,
}) => {
	const [purchases, setPurchases] = useState<ProductPurchase[]>([])
	const [loading, setLoading] = useState(true)
	const [searchTerm, setSearchTerm] = useState('')
	const [categoryFilter, setCategoryFilter] = useState('all')
	const [branchFilter, setBranchFilter] = useState('all')
	const [paymentFilter, setPaymentFilter] = useState('all')

	const fetchPurchases = async () => {
		try {
			const response = await purchasesApi.getPurchases()
			setPurchases(response.purchases || [])
		} catch (error) {
			console.error('Error fetching purchases:', error)
		} finally {
			setLoading(false)
		}
	}

	const handleDeletePurchase = async (purchaseId: string) => {
		if (window.confirm('Are you sure you want to delete this purchase?')) {
			try {
				await purchasesApi.deletePurchase(purchaseId)
				toast.success('Purchase deleted successfully')
				fetchPurchases() // Refresh the list
			} catch (error) {
				console.error('Error deleting purchase:', error)
				toast.error('Failed to delete purchase')
			}
		}
	}

	const handleEditPurchase = async () => {
		// TODO: Implement edit functionality
		toast.info('Edit functionality coming soon')
	}

	useEffect(() => {
		fetchPurchases()
	}, [refreshTrigger])

	const filteredPurchases = purchases.filter(purchase => {
		const matchesSearch =
			purchase.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
			(purchase as ProductPurchase & { supplier?: string }).supplier
				?.toLowerCase()
				.includes(searchTerm.toLowerCase())
		const matchesCategory =
			categoryFilter === 'all' || purchase.category === categoryFilter
		const matchesBranch =
			branchFilter === 'all' || purchase.branch === branchFilter
		const matchesPayment =
			paymentFilter === 'all' ||
			(purchase as ProductPurchase & { paymentMethod?: string })
				.paymentMethod === paymentFilter

		return matchesSearch && matchesCategory && matchesBranch && matchesPayment
	})

	const getCategoryColor = (category: string) => {
		const colors: { [key: string]: string } = {
			'main-products': 'bg-blue-100 text-blue-800',
			'side-products': 'bg-green-100 text-green-800',
			beverages: 'bg-purple-100 text-purple-800',
			snacks: 'bg-yellow-100 text-yellow-800',
			supplies: 'bg-gray-100 text-gray-800',
		}
		return colors[category] || 'bg-gray-100 text-gray-800'
	}

	const getPaymentColor = (payment: string) => {
		const colors: { [key: string]: string } = {
			cash: 'bg-green-100 text-green-800',
			card: 'bg-blue-100 text-blue-800',
			transfer: 'bg-purple-100 text-purple-800',
			credit: 'bg-orange-100 text-orange-800',
		}
		return colors[payment] || 'bg-gray-100 text-gray-800'
	}

	if (loading) {
		return (
			<div className='space-y-4'>
				{[1, 2, 3].map(i => (
					<div key={i} className='flex items-center space-x-4'>
						<Skeleton className='h-12 w-12 rounded' />
						<div className='space-y-2'>
							<Skeleton className='h-4 w-[200px]' />
							<Skeleton className='h-4 w-[100px]' />
						</div>
					</div>
				))}
			</div>
		)
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle className='flex items-center gap-2'>
					<Package className='h-5 w-5' />
					Purchase History
				</CardTitle>
			</CardHeader>
			<CardContent>
				{/* Filters */}
				<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-4 sm:mb-6'>
					<div>
						<div className='relative'>
							<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
							<Input
								placeholder='Search purchases...'
								value={searchTerm}
								onChange={e => setSearchTerm(e.target.value)}
								className='pl-10'
							/>
						</div>
					</div>

					<Select value={categoryFilter} onValueChange={setCategoryFilter}>
						<SelectTrigger>
							<SelectValue placeholder='Category' />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value='all'>All Categories</SelectItem>
							<SelectItem value='main-products'>Main Products</SelectItem>
							<SelectItem value='side-products'>Side Products</SelectItem>
							<SelectItem value='beverages'>Beverages</SelectItem>
							<SelectItem value='snacks'>Snacks</SelectItem>
							<SelectItem value='supplies'>Supplies</SelectItem>
						</SelectContent>
					</Select>

					<Select value={branchFilter} onValueChange={setBranchFilter}>
						<SelectTrigger>
							<SelectValue placeholder='Branch' />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value='all'>All Branches</SelectItem>
							<SelectItem value='main'>Main Branch</SelectItem>
							<SelectItem value='branch-1'>Branch 1</SelectItem>
							<SelectItem value='branch-2'>Branch 2</SelectItem>
						</SelectContent>
					</Select>

					<Select value={paymentFilter} onValueChange={setPaymentFilter}>
						<SelectTrigger>
							<SelectValue placeholder='Payment' />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value='all'>All Payment</SelectItem>
							<SelectItem value='cash'>Cash</SelectItem>
							<SelectItem value='card'>Card</SelectItem>
							<SelectItem value='transfer'>Transfer</SelectItem>
							<SelectItem value='credit'>Credit</SelectItem>
						</SelectContent>
					</Select>

					<Button variant='outline' className='flex items-center gap-2'>
						<Download className='h-4 w-4' />
						Export
					</Button>
				</div>

				{/* Purchase List */}
				{filteredPurchases.length === 0 ? (
					<div className='text-center py-8'>
						<Package className='h-12 w-12 mx-auto text-gray-400 mb-4' />
						<h3 className='text-lg font-medium text-gray-900 mb-2'>
							No purchases found
						</h3>
						<p className='text-gray-600'>
							Start by creating your first purchase
						</p>
					</div>
				) : (
					<div className='bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden'>
						<table className='w-full'>
							<thead className='bg-gradient-to-r from-blue-50 to-indigo-50'>
								<tr>
									<th className='text-left p-1 sm:p-2 font-medium text-gray-800 text-xs uppercase tracking-wider w-16'>
										Image
									</th>
									<th className='text-left p-1 sm:p-2 font-medium text-gray-800 text-xs uppercase tracking-wider'>
										Product Name
									</th>
									<th className='text-left p-1 sm:p-2 font-medium text-gray-800 text-xs uppercase tracking-wider w-16'>
										Qty
									</th>
									<th className='text-left p-1 sm:p-2 font-medium text-gray-800 text-xs uppercase tracking-wider w-16 hidden sm:table-cell'>
										Unit
									</th>
									<th className='text-left p-1 sm:p-2 font-medium text-gray-800 text-xs uppercase tracking-wider w-20'>
										Total
									</th>
									<th className='text-left p-1 sm:p-2 font-medium text-gray-800 text-xs uppercase tracking-wider w-20 hidden md:table-cell'>
										Unit Price
									</th>
									<th className='text-left p-1 sm:p-2 font-medium text-gray-800 text-xs uppercase tracking-wider w-20 hidden lg:table-cell'>
										Category
									</th>
									<th className='text-left p-1 sm:p-2 font-medium text-gray-800 text-xs uppercase tracking-wider w-20 hidden lg:table-cell'>
										Provider
									</th>
									<th className='text-left p-1 sm:p-2 font-medium text-gray-800 text-xs uppercase tracking-wider w-20 hidden xl:table-cell'>
										Payment
									</th>
									<th className='text-left p-1 sm:p-2 font-medium text-gray-800 text-xs uppercase tracking-wider w-16 hidden xl:table-cell'>
										Branch
									</th>
									<th className='text-left p-1 sm:p-2 font-medium text-gray-800 text-xs uppercase tracking-wider w-20 hidden md:table-cell'>
										Date
									</th>
									<th className='text-left p-1 sm:p-2 font-medium text-gray-800 text-xs uppercase tracking-wider w-24'>
										Actions
									</th>
								</tr>
							</thead>
							<tbody className='divide-y divide-gray-100'>
								{filteredPurchases.map((purchase, index) => (
									<tr
										key={purchase._id}
										className={`hover:bg-gray-50 transition-colors duration-150 ${
											index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
										}`}
									>
										<td className='p-1 sm:p-2'>
											{purchase.images && purchase.images.length > 0 ? (
												<div className='w-10 h-10 rounded-lg overflow-hidden shadow-sm border border-gray-200'>
													<Image
														src={purchase.images[0].url}
														alt={purchase.productName}
														width={40}
														height={40}
														className='w-full h-full object-cover'
													/>
												</div>
											) : (
												<div className='w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center shadow-sm border border-gray-200'>
													<Package className='h-4 w-4 text-gray-400' />
												</div>
											)}
										</td>
										<td className='p-1 sm:p-2'>
											<div className='font-medium text-gray-900 text-xs leading-tight'>
												<div className='line-clamp-2'>
													{purchase.productName}
												</div>
											</div>
										</td>
										<td className='p-1 sm:p-2'>
											<span className='inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800'>
												{purchase.quantity}
											</span>
										</td>
										<td className='p-1 sm:p-2 text-gray-700 font-medium text-xs hidden sm:table-cell'>
											{purchase.unit}
										</td>
										<td className='p-1 sm:p-2'>
											<div className='font-bold text-green-600 text-xs sm:text-sm'>
												₩{purchase.price?.toLocaleString()}
											</div>
										</td>
										<td className='p-1 sm:p-2 text-gray-700 font-medium text-xs hidden md:table-cell'>
											₩
											{(
												(purchase.price || 0) / purchase.quantity
											).toLocaleString()}
										</td>
										<td className='p-1 sm:p-2 hidden lg:table-cell'>
											<span
												className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(
													purchase.category
												)}`}
											>
												{purchase.category
													.replace('-', ' ')
													.replace(/\b\w/g, l => l.toUpperCase())}
											</span>
										</td>
										<td className='p-1 sm:p-2 text-gray-700 font-medium text-xs hidden lg:table-cell'>
											{purchase.providerName}
										</td>
										<td className='p-1 sm:p-2 hidden xl:table-cell'>
											<span
												className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${getPaymentColor(
													purchase.paymentWay
												)}`}
											>
												{purchase.paymentWay
													.replace('-', ' ')
													.replace(/\b\w/g, l => l.toUpperCase())}
											</span>
										</td>
										<td className='p-1 sm:p-2 text-gray-700 font-medium text-xs hidden xl:table-cell'>
											{purchase.branch}
										</td>
										<td className='p-1 sm:p-2 text-gray-700 font-medium text-xs hidden md:table-cell'>
											{new Date(purchase.date).toLocaleDateString()}
										</td>
										<td className='p-1 sm:p-2'>
											<div className='flex items-center space-x-1'>
												<Button
													variant='outline'
													size='sm'
													onClick={() => handleEditPurchase()}
													className='h-6 px-2 text-xs'
												>
													Edit
												</Button>
												<Button
													variant='destructive'
													size='sm'
													onClick={() => handleDeletePurchase(purchase._id)}
													className='h-6 px-2 text-xs'
												>
													Del
												</Button>
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</CardContent>
		</Card>
	)
}

export default PurchaseHistory
