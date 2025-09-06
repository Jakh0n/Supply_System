'use client'

import { useAuth } from '@/contexts/AuthContext'
import { Package } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
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
	const [isRedirecting, setIsRedirecting] = useState(false)

	useEffect(() => {
		// Prevent multiple redirects
		if (isRedirecting) return

		if (!loading) {
			if (!user) {
				setIsRedirecting(true)
				router.push('/login')
				return
			}

			if (requiredRole && user.position !== requiredRole) {
				setIsRedirecting(true)
				if (user.position === 'admin') {
					router.push('/admin')
				} else if (user.position === 'editor') {
					router.push('/editor')
				} else {
					router.push('/worker')
				}
				return
			}
		}
	}, [user, loading, requiredRole, router, isRedirecting])

	// Show loading state while authentication is being checked
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

	// Show redirecting state if user is not authenticated
	if (!user) {
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
					<p className='mt-2 text-gray-600'>Redirecting to login...</p>
				</div>
			</div>
		)
	}

	// Show redirecting state if user doesn't have required role
	if (requiredRole && user.position !== requiredRole) {
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

	// User is authenticated and has the required role
	return <>{children}</>
}

export default ProtectedRoute
