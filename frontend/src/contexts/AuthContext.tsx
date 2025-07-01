'use client'

import { authApi } from '@/lib/api'
import { AuthUser, LoginCredentials, RegisterData } from '@/types'
import React, { createContext, useContext, useEffect, useState } from 'react'
import { toast } from 'sonner'

interface AuthContextType {
	user: AuthUser | null
	loading: boolean
	login: (credentials: LoginCredentials) => Promise<void>
	register: (data: RegisterData) => Promise<void>
	logout: () => Promise<void>
	isAdmin: boolean
	isWorker: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
	const context = useContext(AuthContext)
	if (context === undefined) {
		throw new Error('useAuth must be used within an AuthProvider')
	}
	return context
}

interface AuthProviderProps {
	children: React.ReactNode
}

interface ApiError {
	response?: {
		data?: {
			message?: string
		}
	}
}

const isApiError = (error: unknown): error is ApiError => {
	return typeof error === 'object' && error !== null && 'response' in error
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
	const [user, setUser] = useState<AuthUser | null>(null)
	const [loading, setLoading] = useState(true)

	// Check if user is logged in on mount
	useEffect(() => {
		const initAuth = async () => {
			const token = localStorage.getItem('token')
			if (token) {
				try {
					const response = await authApi.getCurrentUser()
					setUser(response.user)
				} catch {
					localStorage.removeItem('token')
				}
			}
			setLoading(false)
		}

		initAuth()
	}, [])

	const login = async (credentials: LoginCredentials) => {
		try {
			const response = await authApi.login(credentials)
			localStorage.setItem('token', response.token)
			setUser(response.user)
			toast.success('Login successful!')
		} catch (error: unknown) {
			const message = isApiError(error)
				? error.response?.data?.message || 'Login failed'
				: 'Login failed'
			toast.error(message)
			throw error
		}
	}

	const register = async (data: RegisterData) => {
		try {
			const response = await authApi.register(data)
			localStorage.setItem('token', response.token)
			setUser(response.user)
			toast.success('Registration successful!')
		} catch (error: unknown) {
			const message = isApiError(error)
				? error.response?.data?.message || 'Registration failed'
				: 'Registration failed'
			toast.error(message)
			throw error
		}
	}

	const logout = async () => {
		try {
			await authApi.logout()
			setUser(null)
			toast.success('Logged out successfully')
		} catch {
			// Even if logout fails on server, we should clear local state
			localStorage.removeItem('token')
			setUser(null)
			toast.success('Logged out successfully')
		}
	}

	const isAdmin = user?.position === 'admin'
	const isWorker = user?.position === 'worker'

	const value: AuthContextType = {
		user,
		loading,
		login,
		register,
		logout,
		isAdmin,
		isWorker,
	}

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
