import { OrderStatus } from '@/types'

export const ORDER_STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
	{ value: 'pending', label: 'Pending' },
	{ value: 'approved', label: 'Approved' },
	{ value: 'rejected', label: 'Rejected' },
	{ value: 'completed', label: 'Completed' },
]

export type OrderStatusFilter = OrderStatus | 'all'

export const ORDER_STATUS_FILTER_TABS: {
	value: OrderStatusFilter
	label: string
}[] = [
	{ value: 'all', label: 'All' },
	{ value: 'pending', label: 'Pending' },
	{ value: 'approved', label: 'Approved' },
	{ value: 'completed', label: 'Completed' },
	{ value: 'rejected', label: 'Rejected' },
]

export function getOrderStatusBadgeClass(status: string): string {
	switch (status) {
		case 'pending':
			return 'bg-yellow-100 text-yellow-800 border border-yellow-200'
		case 'approved':
			return 'bg-green-100 text-green-800 border border-green-200'
		case 'rejected':
			return 'bg-red-100 text-red-800 border border-red-200'
		case 'completed':
			return 'bg-blue-100 text-blue-800 border border-blue-200'
		default:
			return 'bg-gray-100 text-gray-800 border border-gray-200'
	}
}

export function getOrderRowClass(status: string): string {
	if (status === 'pending') {
		return 'border-l-4 border-l-amber-400 bg-amber-50/40 hover:bg-amber-50/70'
	}
	return 'hover:bg-gray-50'
}
