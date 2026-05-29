import { ordersApi } from '@/lib/api'
import { queryKeys } from '@/lib/queryKeys'
import { OrderFilters } from '@/types'
import { useQueries } from '@tanstack/react-query'
import { OrderStatusFilter } from '@/components/editor/orderStatus'

type StatusCounts = Record<OrderStatusFilter, number>

const STATUS_KEYS: OrderStatusFilter[] = [
	'all',
	'pending',
	'approved',
	'completed',
	'rejected',
]

function buildFilters(
	base: Pick<OrderFilters, 'date' | 'branch'>,
	status: OrderStatusFilter
): OrderFilters {
	return {
		date: base.date,
		branch: base.branch,
		status: status === 'all' ? undefined : status,
		page: 1,
		limit: 1,
	}
}

export function useOrderStatusCounts(
	baseFilters: Pick<OrderFilters, 'date' | 'branch'>,
	options?: { enabled?: boolean }
) {
	const enabled = options?.enabled ?? true

	const results = useQueries({
		queries: STATUS_KEYS.map(status => ({
			queryKey: queryKeys.orders.list(buildFilters(baseFilters, status)),
			queryFn: () => ordersApi.getOrders(buildFilters(baseFilters, status)),
			enabled,
			staleTime: 30_000,
		})),
	})

	const counts = STATUS_KEYS.reduce((acc, status, index) => {
		acc[status] = results[index]?.data?.pagination.total ?? 0
		return acc
	}, {} as StatusCounts)

	const isLoading = results.some(r => r.isLoading)

	return { counts, isLoading }
}
