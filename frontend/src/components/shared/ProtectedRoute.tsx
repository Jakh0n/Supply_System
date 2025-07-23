'use client'

import { useAuth } from '@/contexts/AuthContext'
import { Package } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React, { useEffect } from 'react'

interface ProtectedRouteProps {
	children: React.ReactNode
	requiredRole?: 'admin' | 'worker'
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
	children,
	requiredRole,
}) => {
	const { user, loading } = useAuth()
	const router = useRouter()

	useEffect(() => {
		if (!loading) {
			if (!user) {
				router.push('/login')
				return
			}

			if (requiredRole && user.position !== requiredRole) {
				if (user.position === 'admin') {
					router.push('/admin')
				} else {
					router.push('/worker')
				}
				return
			}
		}
	}, [user, loading, requiredRole, router])

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

	if (!user || (requiredRole && user.position !== requiredRole)) {
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

	return <>{children}</>
}

export default ProtectedRoute
