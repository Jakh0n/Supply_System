import { drinkOrdersApi, ordersApi } from '@/lib/api'
import { queryKeys } from '@/lib/queryKeys'
import { OrderFilters, OrderStatus } from '@/types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export function useOrdersList(
	filters?: OrderFilters,
	options?: { enabled?: boolean }
) {
	return useQuery({
		queryKey: queryKeys.orders.list(filters ?? {}),
		queryFn: () => ordersApi.getOrders(filters),
		enabled: options?.enabled ?? true,
	})
}

export function useOrderDetail(orderId: string | null) {
	return useQuery({
		queryKey: queryKeys.orders.detail(orderId ?? ''),
		queryFn: () => ordersApi.getOrder(orderId!),
		enabled: Boolean(orderId),
	})
}

export function useOrderDayContext(
	requestedDate?: string,
	options?: { enabled?: boolean }
) {
	return useQuery({
		queryKey: queryKeys.orders.dayContext(requestedDate),
		queryFn: () => ordersApi.getOrderDayContext(requestedDate),
		enabled: (options?.enabled ?? true) && Boolean(requestedDate),
	})
}

export function useDashboardStats(options?: { enabled?: boolean }) {
	return useQuery({
		queryKey: queryKeys.orders.dashboardStats(),
		queryFn: () => ordersApi.getDashboardStats(),
		enabled: options?.enabled ?? true,
	})
}

export function useUpdateOrderStatus() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: ({
			id,
			status,
			adminNotes,
		}: {
			id: string
			status: OrderStatus
			adminNotes?: string
		}) => ordersApi.updateOrderStatus(id, status, adminNotes),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.orders.all })
			toast.success('Order status updated successfully')
		},
		onError: () => {
			toast.error('Failed to update order status')
		},
	})
}

export function useBulkUpdateOrderStatus() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: ({
			orderIds,
			status,
			adminNotes,
		}: {
			orderIds: string[]
			status: OrderStatus
			adminNotes?: string
		}) => ordersApi.bulkUpdateOrderStatus(orderIds, status, adminNotes),
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({ queryKey: queryKeys.orders.all })
			toast.success(
				`Successfully updated ${variables.orderIds.length} orders to ${variables.status}`
			)
		},
		onError: () => {
			toast.error('Failed to update orders')
		},
	})
}

export function useBulkUpdateAllOrdersStatus() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (options: {
			status: OrderStatus
			scope: 'all' | 'filtered'
			date?: string
			branch?: string
			includeDrinkOrders?: boolean
		}) => {
			const ordersResult = await ordersApi.bulkUpdateAllOrderStatus({
				status: options.status,
				scope: options.scope,
				date: options.date,
				branch: options.branch,
			})

			let drinkUpdated = 0
			if (options.includeDrinkOrders) {
				const drinkResult = await drinkOrdersApi.bulkUpdateAllDrinkOrderStatus({
					status: options.status,
					scope: options.scope,
					date: options.date,
					branch: options.branch,
				})
				drinkUpdated = drinkResult.updatedCount
			}

			return { ordersResult, drinkUpdated }
		},
		onSuccess: data => {
			queryClient.invalidateQueries({ queryKey: queryKeys.orders.all })
			queryClient.invalidateQueries({ queryKey: queryKeys.drinkOrders.all })
			const ordersCount = data.ordersResult.updatedCount
			const drinkPart =
				data.drinkUpdated > 0
					? ` and ${data.drinkUpdated} drink orders`
					: ''
			toast.success(
				`Updated ${ordersCount} orders${drinkPart} to completed`
			)
		},
		onError: () => {
			toast.error('Failed to update all orders')
		},
	})
}
