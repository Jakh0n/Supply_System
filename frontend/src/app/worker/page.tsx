'use client'

import DashboardLayout from '@/components/shared/DashboardLayout'
import ProtectedRoute from '@/components/shared/ProtectedRoute'
import {
	QuickActionSkeleton,
	WorkerDashboardHeaderSkeleton,
} from '@/components/skeletonLoadings/worker'
import { useAuth } from '@/contexts/AuthContext'
import { ordersApi } from '@/lib/api'
import { Order } from '@/types'
import React, { lazy, Suspense, useCallback, useEffect, useState } from 'react'

// Lazy load all worker components for better code splitting
const WorkerDashboardHeader = lazy(
	() => import('@/components/worker/WorkerDashboardHeader')
)
const QuickActions = lazy(() => import('@/components/worker/QuickActions'))
const RecentOrdersList = lazy(
	() => import('@/components/worker/RecentOrdersList')
)
const OrderDetailsModal = lazy(
	() => import('@/components/worker/OrderDetailsModal')
)

const WorkerDashboard: React.FC = () => {
	const { user } = useAuth()
	const [recentOrders, setRecentOrders] = useState<Order[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')
	const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
	const [isModalOpen, setIsModalOpen] = useState(false)

	// Pagination states
	const [currentPage, setCurrentPage] = useState(1)
	const [totalPages, setTotalPages] = useState(1)
	const [totalOrders, setTotalOrders] = useState(0)

	// Filter states
	const [dateFilter, setDateFilter] = useState<
		'all' | 'today' | 'yesterday' | 'weekly'
	>('all')

	const ordersPerPage = 7

	// Date helper functions
	const getTodayDate = () => {
		return new Date().toISOString().split('T')[0]
	}

	const getYesterdayDate = () => {
		const yesterday = new Date()
		yesterday.setDate(yesterday.getDate() - 1)
		return yesterday.toISOString().split('T')[0]
	}

	const getWeeklyStartDate = () => {
		const today = new Date()
		const firstDay = today.getDate() - today.getDay()
		const weekStart = new Date(today.setDate(firstDay))
		return weekStart.toISOString().split('T')[0]
	}

	const fetchRecentOrders = useCallback(async () => {
		try {
			setLoading(true)

			let dateFilterValue: string | undefined = undefined
			if (dateFilter === 'today') {
				dateFilterValue = getTodayDate()
			} else if (dateFilter === 'yesterday') {
				dateFilterValue = getYesterdayDate()
			} else if (dateFilter === 'weekly') {
				dateFilterValue = getWeeklyStartDate()
			}

			const filters = {
				page: currentPage,
				limit: ordersPerPage,
				date: dateFilterValue,
			}

			const response = await ordersApi.getOrders(filters)
			setRecentOrders(response.orders)
			setTotalPages(response.pagination.pages)
			setTotalOrders(response.pagination.total)
		} catch (err) {
			setError('Failed to load recent orders')
			console.error('Recent orders error:', err)
		} finally {
			setLoading(false)
		}
	}, [currentPage, dateFilter])

	useEffect(() => {
		fetchRecentOrders()
	}, [fetchRecentOrders])

	const handleViewOrder = async (orderId: string) => {
		try {
			const response = await ordersApi.getOrder(orderId)
			setSelectedOrder(response.order)
			setIsModalOpen(true)
		} catch (err) {
			console.error('Failed to fetch order details:', err)
		}
	}

	const handlePageChange = (newPage: number) => {
		setCurrentPage(newPage)
	}

	const handleDateFilterChange = (
		dateFilter: 'all' | 'today' | 'yesterday' | 'weekly'
	) => {
		setDateFilter(dateFilter)
		setCurrentPage(1) // Reset to first page when filtering
	}

	const handleCloseModal = () => {
		setIsModalOpen(false)
		setSelectedOrder(null)
	}

	return (
		<ProtectedRoute requiredRole='worker'>
			<DashboardLayout>
				<div className='space-y-4 sm:space-y-6'>
					{/* Header with Suspense and skeleton */}
					<Suspense fallback={<WorkerDashboardHeaderSkeleton />}>
						<WorkerDashboardHeader
							username={user?.username}
							branch={user?.branch}
						/>
					</Suspense>

					{/* Quick Actions with Suspense and skeleton */}
					<Suspense fallback={<QuickActionSkeleton />}>
						<QuickActions />
					</Suspense>

					{/* Recent Orders - component handles its own loading state */}
					<RecentOrdersList
						orders={recentOrders}
						totalOrders={totalOrders}
						currentPage={currentPage}
						totalPages={totalPages}
						loading={loading}
						error={error}
						dateFilter={dateFilter}
						onViewOrder={handleViewOrder}
						onPageChange={handlePageChange}
						onDateFilterChange={handleDateFilterChange}
						onRetry={fetchRecentOrders}
					/>
				</div>

				{/* Order Details Modal with Suspense */}
				<Suspense fallback={<div></div>}>
					<OrderDetailsModal
						order={selectedOrder}
						isOpen={isModalOpen}
						onClose={handleCloseModal}
					/>
				</Suspense>
			</DashboardLayout>
		</ProtectedRoute>
	)
}

export default WorkerDashboard
