'use client'

import { useAuth } from '@/contexts/AuthContext'
import { getDashboardPathForRole } from '@/lib/authRouting'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function HomePage() {
	const { user, loading } = useAuth()
	const router = useRouter()

	useEffect(() => {
		if (!loading) {
			if (user) {
				router.push(getDashboardPathForRole(user.position))
			} else {
				// Redirect unauthenticated users to login
				router.push('/login')
			}
		}
	}, [user, loading, router])

	// Show loading spinner while checking authentication
	if (loading) {
		return (
			<div className='min-h-screen flex items-center justify-center bg-gray-50'>
				<div className='text-center'>
					<Image
						src='/crown.png'
						alt='King Kebab Supply'
						width={48}
						height={48}
						className='h-12 w-12 mx-auto animate-pulse'
					/>
					<h2 className='mt-4 text-xl font-semibold text-blue-500'>
						<span className='text-red-600'>King Kebab</span> Supply
					</h2>
					<p className='mt-2 text-gray-600'>Loading...</p>
				</div>
			</div>
		)
	}

	// This will briefly show before redirect
	return (
		<div className='min-h-screen flex items-center justify-center bg-gray-50'>
			<div className='text-center'>
				<Image
					src='/crown.png'
					alt='King Kebab Supply'
					width={48}
					height={48}
					className='h-12 w-12 mx-auto'
				/>
				<h2 className='mt-4 text-xl font-semibold text-blue-500'>
					<span className='text-red-600'>King Kebab</span> Supply
				</h2>
				<p className='mt-2 text-gray-600'>Redirecting...</p>
			</div>
		</div>
	)
}
