'use client'

import EditorProductAvailability from '@/components/editor/EditorProductAvailability'
import EditorShell from '@/components/editor/EditorShell'
import { useAuth } from '@/contexts/AuthContext'
import { Package } from 'lucide-react'
import { useTranslations } from 'next-intl'

export default function EditorProductsPage() {
	const { user, logout } = useAuth()
	const t = useTranslations('editor.products')

	if (!user) {
		return null
	}

	return (
		<EditorShell username={user.username} onLogout={logout}>
			<div className='space-y-3 sm:space-y-5'>
				<div>
					<h2 className='text-base sm:text-xl font-bold text-gray-900 flex items-center gap-1.5'>
						<Package className='h-4 w-4 sm:h-5 sm:w-5 text-amber-600 shrink-0' />
						{t('title')}
					</h2>
					<p className='text-xs sm:text-sm text-gray-500 mt-0.5'>{t('subtitle')}</p>
				</div>

				<EditorProductAvailability />
			</div>
		</EditorShell>
	)
}
