'use client'

import { useRouter } from '@/i18n/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { getDashboardPathForRole } from '@/lib/authRouting'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { useEffect } from 'react'

export default function HomePage() {
	const { user, loading } = useAuth()
	const router = useRouter()
	const t = useTranslations('common')

	useEffect(() => {
		if (!loading) {
			if (user) {
				router.push(getDashboardPathForRole(user.position))
			} else {
				router.push('/login')
			}
		}
	}, [user, loading, router])

	if (loading) {
		return (
			<div className='min-h-screen flex items-center justify-center bg-gray-50'>
				<div className='text-center'>
					<Image
						src='/crown.png'
						alt={t('appName')}
						width={48}
						height={48}
						className='h-12 w-12 mx-auto animate-pulse'
					/>
					<h2 className='mt-4 text-xl font-semibold text-blue-500'>
						<span className='text-red-600'>King Kebab</span> Supply
					</h2>
					<p className='mt-2 text-gray-600'>{t('loading')}</p>
				</div>
			</div>
		)
	}

	return (
		<div className='min-h-screen flex items-center justify-center bg-gray-50'>
			<div className='text-center'>
				<Image
					src='/crown.png'
					alt={t('appName')}
					width={48}
					height={48}
					className='h-12 w-12 mx-auto'
				/>
				<h2 className='mt-4 text-xl font-semibold text-blue-500'>
					<span className='text-red-600'>King Kebab</span> Supply
				</h2>
				<p className='mt-2 text-gray-600'>{t('redirecting')}</p>
			</div>
		</div>
	)
}
