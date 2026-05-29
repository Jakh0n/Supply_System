import { AuthUser } from '@/types'

export type DashboardPath = '/admin' | '/editor' | '/worker' | '/login'

export function getDashboardPathForRole(
	position: AuthUser['position'] | undefined
): DashboardPath {
	switch (position) {
		case 'admin':
			return '/admin'
		case 'editor':
			return '/editor'
		case 'worker':
			return '/worker'
		default:
			return '/login'
	}
}
