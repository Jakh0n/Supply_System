import { OrderStatusFilter } from '@/components/editor/orderStatus'
import { drinkOrdersApi } from '@/lib/api'
import { queryKeys } from '@/lib/queryKeys'
import { DrinkOrderFilters } from '@/types'
import { useQueries } from '@tanstack/react-query'

type StatusCounts = Record<OrderStatusFilter, number>

const STATUS_KEYS: OrderStatusFilter[] = [
	'all',
	'pending',
	'approved',
	'completed',
	'rejected',
]

function buildFilters(
	base: Pick<DrinkOrderFilters, 'date' | 'branch'>,
	status: OrderStatusFilter
): DrinkOrderFilters {
	return {
		date: base.date,
		branch: base.branch,
		status: status === 'all' ? undefined : status,
		page: 1,
		limit: 1,
		viewAll: 'true',
	}
}

export function useDrinkOrderStatusCounts(
	baseFilters: Pick<DrinkOrderFilters, 'date' | 'branch'>,
	options?: { enabled?: boolean }
) {
	const enabled = options?.enabled ?? true

	const results = useQueries({
		queries: STATUS_KEYS.map(status => ({
			queryKey: queryKeys.drinkOrders.list(buildFilters(baseFilters, status)),
			queryFn: () => drinkOrdersApi.getDrinkOrders(buildFilters(baseFilters, status)),
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
