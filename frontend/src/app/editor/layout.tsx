'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function EditorLayout({
	children,
}: {
	children: React.ReactNode
}) {
	const { user, loading } = useAuth()
	const router = useRouter()

	useEffect(() => {
		if (!loading) {
			if (!user) {
				router.push('/login')
			} else if (user.position !== 'editor') {
				// Redirect to appropriate dashboard based on role
				if (user.position === 'admin') {
					router.push('/admin')
				} else {
					router.push('/worker')
				}
			}
		}
	}, [user, loading, router])

	if (loading) {
		return (
			<div className='min-h-screen flex items-center justify-center'>
				<div className='text-center'>
					<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto'></div>
					<p className='mt-2 text-gray-600'>Loading...</p>
				</div>
			</div>
		)
	}

	if (!user || user.position !== 'editor') {
		return (
			<div className='min-h-screen flex items-center justify-center'>
				<div className='text-center'>
					<p className='text-gray-600'>
						Access denied. Editor privileges required.
					</p>
				</div>
			</div>
		)
	}

	return <>{children}</>
}
