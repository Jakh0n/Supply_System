'use client'

import { usePathname, useRouter } from '@/i18n/navigation'
import { routing, type Locale } from '@/i18n/routing'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { useLocale, useTranslations } from 'next-intl'
import { useTransition } from 'react'

export default function LanguageSwitcher() {
	const t = useTranslations('common')
	const locale = useLocale()
	const router = useRouter()
	const pathname = usePathname()
	const [isPending, startTransition] = useTransition()

	const onChange = (nextLocale: string) => {
		startTransition(() => {
			router.replace(pathname, { locale: nextLocale as Locale })
		})
	}

	return (
		<Select value={locale} onValueChange={onChange} disabled={isPending}>
			<SelectTrigger
				className='h-8 w-[5.5rem] sm:w-[7rem] text-xs px-2'
				aria-label={t('language')}
			>
				<SelectValue />
			</SelectTrigger>
			<SelectContent align='end'>
				{routing.locales.map(loc => (
					<SelectItem key={loc} value={loc} className='text-xs'>
						{loc === 'en' ? t('english') : t('turkish')}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	)
}
