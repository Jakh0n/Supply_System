import { AuthUser } from '@/types'

/** Branch for orders: account branch field, or login username (one account per branch). */
export function getWorkerBranch(user: AuthUser | null | undefined): string {
	if (!user) return ''
	const branch = user.branch?.trim()
	if (branch) return branch
	return user.username?.trim() ?? ''
}
