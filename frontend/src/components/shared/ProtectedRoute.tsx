'use client'

import { useRouter } from '@/i18n/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { getDashboardPathForRole } from '@/lib/authRouting'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'

interface ProtectedRouteProps {
	children: React.ReactNode
	requiredRole?: 'admin' | 'worker' | 'editor'
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
	children,
	requiredRole,
}) => {
	const { user, loading } = useAuth()
	const router = useRouter()
	const t = useTranslations('common')
	const [isRedirecting, setIsRedirecting] = useState(false)

	useEffect(() => {
		if (isRedirecting) return

		if (!loading) {
			if (!user) {
				setIsRedirecting(true)
				router.push('/login')
				return
			}

			if (requiredRole && user.position !== requiredRole) {
				setIsRedirecting(true)
				router.push(getDashboardPathForRole(user.position))
				return
			}
		}
	}, [user, loading, requiredRole, router, isRedirecting])

	const loadingView = (message: string) => (
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
				<p className='mt-2 text-gray-600'>{message}</p>
			</div>
		</div>
	)

	if (loading) {
		return loadingView(t('loading'))
	}

	if (!user) {
		return loadingView(t('redirectingToLogin'))
	}

	if (requiredRole && user.position !== requiredRole) {
		return loadingView(t('redirecting'))
	}

	return <>{children}</>
}

export default ProtectedRoute
