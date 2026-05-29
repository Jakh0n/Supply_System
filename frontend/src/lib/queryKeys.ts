import { DrinkOrderFilters, OrderFilters } from '@/types'

export const queryKeys = {
	orders: {
		all: ['orders'] as const,
		lists: () => [...queryKeys.orders.all, 'list'] as const,
		list: (filters: OrderFilters = {}) =>
			[...queryKeys.orders.lists(), filters] as const,
		details: () => [...queryKeys.orders.all, 'detail'] as const,
		detail: (id: string) => [...queryKeys.orders.details(), id] as const,
		dayContext: (requestedDate?: string) =>
			[...queryKeys.orders.all, 'dayContext', requestedDate ?? 'today'] as const,
	},
	drinkOrders: {
		all: ['drinkOrders'] as const,
		lists: () => [...queryKeys.drinkOrders.all, 'list'] as const,
		list: (filters: DrinkOrderFilters = {}) =>
			[...queryKeys.drinkOrders.lists(), filters] as const,
	},
	branches: {
		names: ['branches', 'names'] as const,
	},
}
