'use client'

import { useAuth } from '@/contexts/AuthContext'
import { Package } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function HomePage() {
	const { user, loading } = useAuth()
	const router = useRouter()

	useEffect(() => {
		if (!loading) {
			if (user) {
				// Redirect authenticated users to their dashboard
				if (user.position === 'admin') {
					router.push('/admin')
				} else {
					router.push('/worker')
				}
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
					<Package className='h-12 w-12 text-blue-600 mx-auto animate-pulse' />
					<h2 className='mt-4 text-xl font-semibold text-gray-900'>
						RestaurantSupply
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
				<Package className='h-12 w-12 text-blue-600 mx-auto' />
				<h2 className='mt-4 text-xl font-semibold text-gray-900'>
					RestaurantSupply
				</h2>
				<p className='mt-2 text-gray-600'>Redirecting...</p>
			</div>
		</div>
	)
}
