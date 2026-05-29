import { productsApi } from '@/lib/api'
import { queryKeys } from '@/lib/queryKeys'
import { ProductFilters } from '@/types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export function useProductsList(
	filters?: ProductFilters,
	options?: { enabled?: boolean }
) {
	return useQuery({
		queryKey: queryKeys.products.list(filters ?? {}),
		queryFn: () => productsApi.getProducts(filters),
		enabled: options?.enabled ?? true,
	})
}

export function useToggleProductStatus() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: (id: string) => productsApi.toggleProductStatus(id),
		onSuccess: data => {
			queryClient.invalidateQueries({ queryKey: queryKeys.products.all })
			const label = data.product.isActive ? 'available' : 'sold out'
			toast.success(`${data.product.name} marked as ${label}`)
		},
		onError: () => {
			toast.error('Failed to update product availability')
		},
	})
}
