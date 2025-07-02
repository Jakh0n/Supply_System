'use client'

import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/contexts/AuthContext'
import { LoginCredentials } from '@/types'
import { AlertCircle, Eye, EyeOff, Package } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

const LoginForm: React.FC = () => {
	const { login, user } = useAuth()
	const router = useRouter()
	const [credentials, setCredentials] = useState<LoginCredentials>({
		username: '',
		password: '',
	})
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState('')
	const [showPassword, setShowPassword] = useState(false)

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setLoading(true)
		setError('')

		try {
			await login(credentials)

			// The user state will be updated in the context after successful login
			// We'll handle navigation in a useEffect
		} catch (err: unknown) {
			const errorMessage =
				err instanceof Error ? err.message : 'Login failed. Please try again.'
			setError(errorMessage)
		} finally {
			setLoading(false)
		}
	}

	// Handle navigation after user state changes
	useEffect(() => {
		if (user) {
			if (user.position === 'admin') {
				router.push('/admin')
			} else if (user.position === 'editor') {
				router.push('/editor')
			} else {
				router.push('/worker')
			}
		}
	}, [user, router])

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target
		setCredentials(prev => ({
			...prev,
			[name]: value,
		}))
	}

	return (
		<div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
			<div className='max-w-md w-full space-y-8'>
				{/* Logo and title */}
				<div className='text-center'>
					<div className='flex justify-center'>
						<Package className='h-12 w-12 text-blue-600' />
					</div>
					<h2 className='mt-6 text-3xl font-extrabold text-gray-900'>
						RestaurantSupply
					</h2>
					<p className='mt-2 text-sm text-gray-600'>Sign in to your account</p>
				</div>

				{/* Login form */}
				<Card>
					<CardHeader>
						<CardTitle>Welcome back</CardTitle>
						<CardDescription>
							Enter your credentials to access your account
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleSubmit} className='space-y-6'>
							{error && (
								<div className='bg-red-50 border border-red-200 rounded-md p-4'>
									<div className='flex'>
										<AlertCircle className='h-5 w-5 text-red-400' />
										<div className='ml-3'>
											<p className='text-sm text-red-800'>{error}</p>
										</div>
									</div>
								</div>
							)}

							<div className='space-y-4'>
								<div>
									<Label htmlFor='username'>Username</Label>
									<Input
										id='username'
										name='username'
										type='text'
										required
										value={credentials.username}
										onChange={handleChange}
										placeholder='Enter your username'
										className='mt-1'
									/>
								</div>

								<div>
									<Label htmlFor='password'>Password</Label>
									<div className='relative mt-1'>
										<Input
											id='password'
											name='password'
											type={showPassword ? 'text' : 'password'}
											required
											value={credentials.password}
											onChange={handleChange}
											placeholder='Enter your password'
											className='pr-10'
										/>
										<button
											type='button'
											className='absolute inset-y-0 right-0 pr-3 flex items-center'
											onClick={() => setShowPassword(!showPassword)}
										>
											{showPassword ? (
												<EyeOff className='h-4 w-4 text-gray-400' />
											) : (
												<Eye className='h-4 w-4 text-gray-400' />
											)}
										</button>
									</div>
								</div>
							</div>

							<Button type='submit' className='w-full' disabled={loading}>
								{loading ? 'Signing in...' : 'Sign in'}
							</Button>
						</form>

						<div className='mt-6'>
							<div className='relative'>
								<div className='absolute inset-0 flex items-center'>
									<div className='w-full border-t border-gray-300' />
								</div>
								<div className='relative flex justify-center text-sm'>
									<span className='px-2 bg-white text-gray-500'>
										Don&apos;t have an account?
									</span>
								</div>
							</div>

							<div className='mt-6'>
								<Link href='/register'>
									<Button variant='outline' className='w-full'>
										Create new account
									</Button>
								</Link>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	)
}

export default LoginForm
