import { branchesApi } from '@/lib/api'
import { queryKeys } from '@/lib/queryKeys'
import { useQuery } from '@tanstack/react-query'

export function useBranchNames(options?: { enabled?: boolean }) {
	return useQuery({
		queryKey: queryKeys.branches.names,
		queryFn: () => branchesApi.getBranchNames(),
		enabled: options?.enabled ?? true,
		select: data => data.branches ?? [],
	})
}
