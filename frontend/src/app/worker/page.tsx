'use client'

import DashboardLayout from '@/components/shared/DashboardLayout'
import ProtectedRoute from '@/components/shared/ProtectedRoute'
import {
	QuickActionSkeleton,
	WorkerDashboardHeaderSkeleton,
} from '@/components/skeletonLoadings/worker'
import { useAuth } from '@/contexts/AuthContext'
import { useOrderDetail, useOrdersList } from '@/hooks/queries'
import {
	getDateFilterValue,
	WorkerDateFilter,
} from '@/lib/orderDateFilters'
import React, { lazy, Suspense, useMemo, useState } from 'react'

const WorkerDashboardHeader = lazy(
	() => import('@/components/worker/WorkerDashboardHeader')
)
const QuickActions = lazy(() => import('@/components/worker/QuickActions'))
const HolidayDayNotice = lazy(
	() => import('@/components/worker/HolidayDayNotice')
)
const RecentOrdersList = lazy(
	() => import('@/components/worker/RecentOrdersList')
)
const OrderDetailsModal = lazy(
	() => import('@/components/worker/OrderDetailsModal')
)

const ORDERS_PER_PAGE = 7

const WorkerDashboard: React.FC = () => {
	const { user } = useAuth()
	const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [currentPage, setCurrentPage] = useState(1)
	const [dateFilter, setDateFilter] = useState<WorkerDateFilter>('all')

	const orderFilters = useMemo(
		() => ({
			page: currentPage,
			limit: ORDERS_PER_PAGE,
			date: getDateFilterValue(dateFilter),
		}),
		[currentPage, dateFilter]
	)

	const {
		data: ordersData,
		isLoading,
		isFetching,
		isError,
		refetch,
	} = useOrdersList(orderFilters)

	const { data: orderDetailData } = useOrderDetail(
		isModalOpen ? selectedOrderId : null
	)

	const handleViewOrder = (orderId: string) => {
		setSelectedOrderId(orderId)
		setIsModalOpen(true)
	}

	const handlePageChange = (newPage: number) => {
		setCurrentPage(newPage)
	}

	const handleDateFilterChange = (filter: WorkerDateFilter) => {
		setDateFilter(filter)
		setCurrentPage(1)
	}

	const handleCloseModal = () => {
		setIsModalOpen(false)
		setSelectedOrderId(null)
	}

	return (
		<ProtectedRoute requiredRole='worker'>
			<DashboardLayout>
				<div className='space-y-4 sm:space-y-6 md:space-y-8'>
					<Suspense fallback={<WorkerDashboardHeaderSkeleton />}>
						<WorkerDashboardHeader username={user?.username} />
					</Suspense>

					<Suspense fallback={<QuickActionSkeleton />}>
						<QuickActions />
					</Suspense>

					<Suspense fallback={<div className='h-16' />}>
						<HolidayDayNotice
							requestedDate={new Date().toISOString().split('T')[0]}
						/>
					</Suspense>

					<RecentOrdersList
						orders={ordersData?.orders ?? []}
						totalOrders={ordersData?.pagination.total ?? 0}
						currentPage={currentPage}
						totalPages={ordersData?.pagination.pages ?? 1}
						loading={isLoading || isFetching}
						error={isError ? 'Failed to load recent orders' : ''}
						dateFilter={dateFilter}
						onViewOrder={handleViewOrder}
						onPageChange={handlePageChange}
						onDateFilterChange={handleDateFilterChange}
						onRetry={() => refetch()}
					/>
				</div>

				<Suspense fallback={<div></div>}>
					<OrderDetailsModal
						order={orderDetailData?.order ?? null}
						isOpen={isModalOpen}
						onClose={handleCloseModal}
					/>
				</Suspense>
			</DashboardLayout>
		</ProtectedRoute>
	)
}

export default WorkerDashboard
