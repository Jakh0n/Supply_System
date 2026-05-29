import { drinkOrdersApi } from '@/lib/api'
import { queryKeys } from '@/lib/queryKeys'
import {
	DrinkOrderFilters,
	DrinkOrderFormData,
	OrderStatus,
} from '@/types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export function useDrinkOrdersList(
	filters?: DrinkOrderFilters,
	options?: { enabled?: boolean }
) {
	return useQuery({
		queryKey: queryKeys.drinkOrders.list(filters ?? {}),
		queryFn: () => drinkOrdersApi.getDrinkOrders(filters),
		enabled: options?.enabled ?? true,
	})
}

export function useCreateDrinkOrder() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: (data: DrinkOrderFormData) =>
			drinkOrdersApi.createDrinkOrder(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.drinkOrders.all })
		},
	})
}

export function useDeleteDrinkOrder() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: (id: string) => drinkOrdersApi.deleteDrinkOrder(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.drinkOrders.all })
			toast.success('Drink order deleted')
		},
		onError: () => {
			toast.error('Failed to delete drink order')
		},
	})
}

export function useUpdateDrinkOrderStatus() {
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
		}) => drinkOrdersApi.updateDrinkOrderStatus(id, status, adminNotes),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.drinkOrders.all })
			toast.success('Drink order status updated successfully')
		},
		onError: () => {
			toast.error('Failed to update drink order status')
		},
	})
}
