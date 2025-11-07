'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { ProductPurchase } from '@/types'
import {
	Calendar,
	CalendarDays,
	DollarSign,
	ShoppingCart,
	TrendingUp,
} from 'lucide-react'
import React, { useState } from 'react'

interface PurchaseStatisticsProps {
	purchases: ProductPurchase[]
	loading?: boolean
}

type TimePeriod = 'day' | 'week' | 'month' | 'year' | 'all'

const PurchaseStatistics: React.FC<PurchaseStatisticsProps> = ({
	purchases,
	loading = false,
}) => {
	const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('all')

	// Utility function to format currency
	const formatKRW = (amount: number): string => {
		return `₩${amount.toLocaleString()}`
	}

	// Utility function to check if date is within period
	const isDateInPeriod = (
		date: Date,
		period: 'day' | 'week' | 'month' | 'year'
	): boolean => {
		const now = new Date()
		const purchaseDate = new Date(date)

		// Reset time to start of day for accurate comparison
		now.setHours(0, 0, 0, 0)
		purchaseDate.setHours(0, 0, 0, 0)

		switch (period) {
			case 'day':
				return (
					purchaseDate.getDate() === now.getDate() &&
					purchaseDate.getMonth() === now.getMonth() &&
					purchaseDate.getFullYear() === now.getFullYear()
				)
			case 'week':
				// Get start of current week (Sunday)
				const startOfWeek = new Date(now)
				const dayOfWeek = now.getDay()
				startOfWeek.setDate(now.getDate() - dayOfWeek)
				startOfWeek.setHours(0, 0, 0, 0)
				return purchaseDate >= startOfWeek && purchaseDate <= now
			case 'month':
				return (
					purchaseDate.getMonth() === now.getMonth() &&
					purchaseDate.getFullYear() === now.getFullYear()
				)
			case 'year':
				return purchaseDate.getFullYear() === now.getFullYear()
			default:
				return false
		}
	}

	// Calculate statistics for selected period
	const getFilteredPurchases = (): ProductPurchase[] => {
		if (selectedPeriod === 'all') {
			return purchases
		}
		return purchases.filter(purchase =>
			isDateInPeriod(new Date(purchase.date), selectedPeriod)
		)
	}

	const filteredPurchases = getFilteredPurchases()
	const count = filteredPurchases.length
	const totalAmount = filteredPurchases.reduce(
		(sum, purchase) => sum + (purchase.price || 0),
		0
	)
	const averageAmount = count > 0 ? totalAmount / count : 0

	// Get period display info
	const getPeriodInfo = () => {
		switch (selectedPeriod) {
			case 'day':
				return {
					title: 'Today',
					icon: Calendar,
					color: 'text-blue-600',
					bgColor: 'bg-blue-50',
				}
			case 'week':
				return {
					title: 'This Week',
					icon: CalendarDays,
					color: 'text-green-600',
					bgColor: 'bg-green-50',
				}
			case 'month':
				return {
					title: 'This Month',
					icon: TrendingUp,
					color: 'text-purple-600',
					bgColor: 'bg-purple-50',
				}
			case 'year':
				return {
					title: 'This Year',
					icon: DollarSign,
					color: 'text-orange-600',
					bgColor: 'bg-orange-50',
				}
			case 'all':
				return {
					title: 'All Time',
					icon: ShoppingCart,
					color: 'text-indigo-600',
					bgColor: 'bg-indigo-50',
				}
		}
	}

	const periodInfo = getPeriodInfo()
	const IconComponent = periodInfo.icon

	if (loading) {
		return (
			<Card>
				<CardContent className='p-4 sm:p-6'>
					<div className='animate-pulse space-y-4'>
						<div className='h-10 bg-gray-200 rounded w-1/3'></div>
						<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
							{[...Array(3)].map((_, i) => (
								<div key={i} className='h-24 bg-gray-200 rounded'></div>
							))}
						</div>
					</div>
				</CardContent>
			</Card>
		)
	}

	return (
		<Card>
			<CardHeader>
				<div className='flex items-center justify-between'>
					<CardTitle className='flex items-center gap-2'>
						<ShoppingCart className='h-5 w-5' />
						Purchase Statistics
					</CardTitle>
					<Select
						value={selectedPeriod}
						onValueChange={value => setSelectedPeriod(value as TimePeriod)}
					>
						<SelectTrigger className='w-[180px]'>
							<SelectValue placeholder='Select period' />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value='day'>Today</SelectItem>
							<SelectItem value='week'>This Week</SelectItem>
							<SelectItem value='month'>This Month</SelectItem>
							<SelectItem value='year'>This Year</SelectItem>
							<SelectItem value='all'>All Time</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</CardHeader>
			<CardContent>
				<div className='grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6'>
					{/* Total Purchases Card */}
					<Card className='hover:shadow-md transition-shadow duration-200'>
						<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
							<CardTitle className='text-sm font-medium text-gray-700'>
								Total Purchases
							</CardTitle>
							<div
								className={`p-2 rounded-lg ${periodInfo.bgColor} flex-shrink-0`}
							>
								<IconComponent className={`h-4 w-4 ${periodInfo.color}`} />
							</div>
						</CardHeader>
						<CardContent className='pt-0'>
							<div className='text-2xl sm:text-3xl font-bold text-gray-900 mb-1'>
								{count}
							</div>
							<p className='text-xs text-gray-500'>{periodInfo.title}</p>
						</CardContent>
					</Card>

					{/* Total Amount Card */}
					<Card className='hover:shadow-md transition-shadow duration-200'>
						<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
							<CardTitle className='text-sm font-medium text-gray-700'>
								Total Amount
							</CardTitle>
							<div className='p-2 rounded-lg bg-green-50 flex-shrink-0'>
								<DollarSign className='h-4 w-4 text-green-600' />
							</div>
						</CardHeader>
						<CardContent className='pt-0'>
							<div className='text-2xl sm:text-3xl font-bold text-green-600 mb-1'>
								{formatKRW(totalAmount)}
							</div>
							<p className='text-xs text-gray-500'>{periodInfo.title}</p>
						</CardContent>
					</Card>

					{/* Average Value Card */}
					<Card className='hover:shadow-md transition-shadow duration-200'>
						<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
							<CardTitle className='text-sm font-medium text-gray-700'>
								Average Value
							</CardTitle>
							<div className='p-2 rounded-lg bg-purple-50 flex-shrink-0'>
								<TrendingUp className='h-4 w-4 text-purple-600' />
							</div>
						</CardHeader>
						<CardContent className='pt-0'>
							<div className='text-2xl sm:text-3xl font-bold text-purple-600 mb-1'>
								{count > 0 ? formatKRW(averageAmount) : formatKRW(0)}
							</div>
							<p className='text-xs text-gray-500'>
								{count > 0
									? `Per purchase (${periodInfo.title})`
									: 'No purchases'}
							</p>
						</CardContent>
					</Card>
				</div>
			</CardContent>
		</Card>
	)
}

export default PurchaseStatistics
