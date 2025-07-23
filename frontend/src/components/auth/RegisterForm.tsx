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
import { RegisterData } from '@/types'
import { AlertCircle, Eye, EyeOff } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'

interface RegisterFormData {
	username: string
	password: string
}

const RegisterForm: React.FC = () => {
	const { register, user } = useAuth()
	const router = useRouter()
	const [formData, setFormData] = useState<RegisterFormData>({
		username: '',
		password: '',
	})
	const [confirmPassword, setConfirmPassword] = useState('')
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState('')
	const [showPassword, setShowPassword] = useState(false)
	const [showConfirmPassword, setShowConfirmPassword] = useState(false)

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setLoading(true)
		setError('')

		// Validation
		if (!formData.username.trim()) {
			setError('Username is required')
			setLoading(false)
			return
		}

		if (formData.password !== confirmPassword) {
			setError('Passwords do not match')
			setLoading(false)
			return
		}

		if (formData.password.length < 6) {
			setError('Password must be at least 6 characters long')
			setLoading(false)
			return
		}

		// Validate username format (letters, numbers, underscores only)
		if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
			setError('Username can only contain letters, numbers, and underscores')
			setLoading(false)
			return
		}

		try {
			const registerData: RegisterData = {
				username: formData.username.trim(),
				password: formData.password,
				position: 'worker', // Always register as worker
				// branch will be assigned later by admin
			}

			await register(registerData)
			// Navigation will be handled by useEffect when user state changes
		} catch (err: unknown) {
			const errorMessage =
				err instanceof Error
					? err.message
					: 'Registration failed. Please try again.'
			setError(errorMessage)
		} finally {
			setLoading(false)
		}
	}

	// Handle navigation after user state changes
	React.useEffect(() => {
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
		setFormData(prev => ({
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
						<Image
							src='/crown.png'
							alt='King Kebab Supply'
							width={48}
							height={48}
							className='h-12 w-12'
						/>
					</div>
					<h2 className='mt-6 text-3xl font-extrabold text-gray-900'>
						Create Account
					</h2>
					<p className='mt-2 text-sm text-gray-600'>
						Join King Kebab Supply to manage your orders
					</p>
				</div>

				{/* Registration form */}
				<Card>
					<CardHeader>
						<CardTitle>Get started</CardTitle>
						<CardDescription>
							Create your worker account to access King Kebab Supply
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
									<Label htmlFor='username'>Username *</Label>
									<Input
										id='username'
										name='username'
										type='text'
										required
										value={formData.username}
										onChange={handleChange}
										placeholder='Enter your username (letters, numbers, _ only)'
										className='mt-1'
									/>
								</div>

								<div>
									<Label htmlFor='password'>Password *</Label>
									<div className='relative mt-1'>
										<Input
											id='password'
											name='password'
											type={showPassword ? 'text' : 'password'}
											required
											value={formData.password}
											onChange={handleChange}
											placeholder='Enter your password (min 6 characters)'
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

								<div>
									<Label htmlFor='confirmPassword'>Confirm Password *</Label>
									<div className='relative mt-1'>
										<Input
											id='confirmPassword'
											name='confirmPassword'
											type={showConfirmPassword ? 'text' : 'password'}
											required
											value={confirmPassword}
											onChange={e => setConfirmPassword(e.target.value)}
											placeholder='Confirm your password'
											className='pr-10'
										/>
										<button
											type='button'
											className='absolute inset-y-0 right-0 pr-3 flex items-center'
											onClick={() =>
												setShowConfirmPassword(!showConfirmPassword)
											}
										>
											{showConfirmPassword ? (
												<EyeOff className='h-4 w-4 text-gray-400' />
											) : (
												<Eye className='h-4 w-4 text-gray-400' />
											)}
										</button>
									</div>
								</div>
							</div>

							<Button type='submit' className='w-full' disabled={loading}>
								{loading ? 'Creating account...' : 'Create account'}
							</Button>
						</form>

						<div className='mt-6'>
							<div className='relative'>
								<div className='absolute inset-0 flex items-center'>
									<div className='w-full border-t border-gray-300' />
								</div>
								<div className='relative flex justify-center text-sm'>
									<span className='px-2 bg-white text-gray-500'>
										Already have an account?
									</span>
								</div>
							</div>

							<div className='mt-6'>
								<Link href='/login'>
									<Button variant='outline' className='w-full'>
										Sign in to your account
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

export default RegisterForm
