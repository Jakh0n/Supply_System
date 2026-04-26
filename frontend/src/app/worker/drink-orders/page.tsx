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
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { drinkOrdersApi } from '@/lib/api'
import { DrinkOrder, OrderStatus } from '@/types'
import {
	AlertCircle,
	CheckCircle,
	Clock,
	CupSoda,
	Eye,
	Plus,
	Trash2,
	XCircle,
} from 'lucide-react'
import Link from 'next/link'
import React, { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

const formatDate = (dateString: string): string =>
	new Date(dateString).toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
	})

const getStatusDisplay = (status: OrderStatus) => {
	switch (status) {
		case 'pending':
			return {
				label: 'Pending',
				color: 'bg-orange-100 text-orange-800',
				icon: <Clock className='h-3 w-3 sm:h-4 sm:w-4' />,
			}
		case 'approved':
			return {
				label: 'Approved',
				color: 'bg-green-100 text-green-800',
				icon: <CheckCircle className='h-3 w-3 sm:h-4 sm:w-4' />,
			}
		case 'rejected':
			return {
				label: 'Rejected',
				color: 'bg-red-100 text-red-800',
				icon: <XCircle className='h-3 w-3 sm:h-4 sm:w-4' />,
			}
		case 'completed':
			return {
				label: 'Completed',
				color: 'bg-blue-100 text-blue-800',
				icon: <CheckCircle className='h-3 w-3 sm:h-4 sm:w-4' />,
			}
		default:
			return {
				label: status,
				color: 'bg-gray-100 text-gray-800',
				icon: <AlertCircle className='h-3 w-3 sm:h-4 sm:w-4' />,
			}
	}
}

const DrinkOrdersPage: React.FC = () => {
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')
	const [drinkOrders, setDrinkOrders] = useState<DrinkOrder[]>([])
	const [selectedOrder, setSelectedOrder] = useState<DrinkOrder | null>(null)
	const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)

	const fetchDrinkOrders = useCallback(async () => {
		try {
			setLoading(true)
			const response = await drinkOrdersApi.getDrinkOrders({ page: 1, limit: 20 })
			setDrinkOrders(response.drinkOrders)
		} catch (err) {
			console.error('Drink orders fetch error:', err)
			setError('Failed to load drink orders')
		} finally {
			setLoading(false)
		}
	}, [])

	useEffect(() => {
		fetchDrinkOrders()
	}, [fetchDrinkOrders])

	const deleteDrinkOrder = async (order: DrinkOrder) => {
		if (order.status !== 'pending') {
			toast.error('Only pending drink orders can be deleted')
			return
		}

		if (!confirm(`Delete drink order ${order.orderNumber}?`)) {
			return
		}

		try {
			await drinkOrdersApi.deleteDrinkOrder(order._id)
			toast.success('Drink order deleted')
			await fetchDrinkOrders()
		} catch (err) {
			console.error('Delete drink order error:', err)
			toast.error('Failed to delete drink order')
		}
	}

	return (
		<ProtectedRoute requiredRole='worker'>
			<DashboardLayout>
				<div className='space-y-4 sm:space-y-6'>
					<div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
						<div>
							<h1 className='text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2'>
								<CupSoda className='h-6 w-6 text-cyan-600' />
								My Drink Orders
							</h1>
							<p className='text-sm text-gray-600 mt-1'>
								Drink requests are fully separated from normal orders
							</p>
						</div>
						<Link href='/worker/new-drink-order'>
							<Button className='bg-cyan-600 hover:bg-cyan-700 w-full sm:w-auto'>
								<Plus className='h-4 w-4 mr-2' />
								New Drink Order
							</Button>
						</Link>
					</div>

					{error && (
						<div className='bg-red-50 border border-red-200 rounded-md p-3'>
							<p className='text-sm text-red-700'>{error}</p>
						</div>
					)}

					<Card>
						<CardHeader className='p-4 sm:p-6'>
							<CardTitle>Drink Orders</CardTitle>
							<CardDescription>
								This list only contains orders created from the drink module
							</CardDescription>
						</CardHeader>
						<CardContent className='p-4 sm:p-6 pt-0'>
							{loading ? (
								<p className='text-sm text-gray-500'>Loading drink orders...</p>
							) : drinkOrders.length === 0 ? (
								<div className='text-center py-10'>
									<CupSoda className='h-10 w-10 text-gray-400 mx-auto mb-3' />
									<p className='text-sm text-gray-500 mb-4'>No drink orders yet</p>
									<Link href='/worker/new-drink-order'>
										<Button>Create First Drink Order</Button>
									</Link>
								</div>
							) : (
								<div className='space-y-3'>
									{drinkOrders.map(order => {
										const status = getStatusDisplay(order.status)
										return (
											<div
												key={order._id}
												className='border rounded-lg p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'
											>
												<div className='min-w-0'>
													<p className='font-mono text-xs sm:text-sm font-semibold truncate'>
														{order.orderNumber}
													</p>
													<p className='text-xs text-gray-500 mt-1'>
														Requested: {formatDate(order.requestedDate)} •{' '}
														{order.items.length} products
													</p>
												</div>
												<div className='flex flex-wrap items-center gap-2'>
													<span
														className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${status.color}`}
													>
														{status.icon}
														<span className='ml-1'>{status.label}</span>
													</span>
													<Button
														variant='outline'
														size='sm'
														className='h-9'
														onClick={() => {
															setSelectedOrder(order)
															setIsDetailDialogOpen(true)
														}}
													>
														<Eye className='h-4 w-4 mr-1' />
														View
													</Button>
													{order.status === 'pending' && (
														<Button
															variant='outline'
															size='sm'
															className='text-red-600 h-9'
															onClick={() => deleteDrinkOrder(order)}
														>
															<Trash2 className='h-4 w-4 mr-1' />
															Delete
														</Button>
													)}
												</div>
											</div>
										)
									})}
								</div>
							)}
						</CardContent>
					</Card>
				</div>

				<Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
					<DialogContent className='w-[95vw] sm:w-full max-w-xl max-h-[85vh] overflow-y-auto'>
						<DialogHeader>
							<DialogTitle>{selectedOrder?.orderNumber}</DialogTitle>
							<DialogDescription>Drink order details</DialogDescription>
						</DialogHeader>
						{selectedOrder && (
							<div className='space-y-3'>
								<div className='text-sm text-gray-600 space-y-1'>
									<div>Branch: {selectedOrder.branch}</div>
									<div>Requested Date: {formatDate(selectedOrder.requestedDate)}</div>
								</div>
								<div className='border rounded-md max-h-72 overflow-y-auto'>
									{selectedOrder.items.map(item => (
										<div
											key={item.product._id}
											className='px-3 py-2 text-sm border-b last:border-b-0 flex items-center justify-between gap-3'
										>
											<span className='truncate pr-2'>{item.product.name}</span>
											<span className='font-medium'>
												{item.quantity} {item.product.unit}
											</span>
										</div>
									))}
								</div>
								{selectedOrder.notes && (
									<div className='text-sm bg-gray-50 rounded-md p-3'>
										{selectedOrder.notes}
									</div>
								)}
							</div>
						)}
					</DialogContent>
				</Dialog>
			</DashboardLayout>
		</ProtectedRoute>
	)
}

export default DrinkOrdersPage
