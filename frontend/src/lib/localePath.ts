import { routing } from '@/i18n/routing'

export function getLocaleFromPathname(pathname: string): string {
	const segment = pathname.split('/').filter(Boolean)[0]
	if (routing.locales.includes(segment as (typeof routing.locales)[number])) {
		return segment
	}
	return routing.defaultLocale
}

export function getLocalizedPath(path: string, pathname?: string): string {
	const locale = pathname
		? getLocaleFromPathname(pathname)
		: typeof window !== 'undefined'
			? getLocaleFromPathname(window.location.pathname)
			: routing.defaultLocale

	const normalizedPath = path.startsWith('/') ? path : `/${path}`
	return `/${locale}${normalizedPath}`
}
