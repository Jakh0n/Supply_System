import { ordersApi } from '@/lib/api'
import { queryKeys } from '@/lib/queryKeys'
import { OrderFilters } from '@/types'
import { useQuery } from '@tanstack/react-query'

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
