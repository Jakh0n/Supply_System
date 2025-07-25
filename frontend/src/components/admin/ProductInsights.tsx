'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ProductInsights as ProductInsightsType } from '@/types'
import {
	AlertTriangle,
	ArrowDownRight,
	ArrowUpRight,
	Award,
	BarChart3,
	Crown,
	Eye,
	Flame,
	Minus,
	Package,
	Star,
	Target,
} from 'lucide-react'
import { useState } from 'react'

interface ProductInsightsProps {
	productInsights: ProductInsightsType[]
	loading: boolean
	formatKRW: (amount: number) => string
}

const ProductInsights: React.FC<ProductInsightsProps> = ({
	productInsights,
	formatKRW,
	loading,
}) => {
	const [filterCategory, setFilterCategory] = useState<
		'all' | 'top' | 'trending' | 'declining'
	>('all')

	const getTrendIcon = (trend: string | number) => {
		if (typeof trend === 'number') {
			return trend > 0 ? (
				<ArrowUpRight className='h-4 w-4 text-green-500' />
			) : (
				<ArrowDownRight className='h-4 w-4 text-red-500' />
			)
		}
		return trend === 'up' ? (
			<ArrowUpRight className='h-4 w-4 text-green-500' />
		) : trend === 'down' ? (
			<ArrowDownRight className='h-4 w-4 text-red-500' />
		) : (
			<Minus className='h-4 w-4 text-gray-500' />
		)
	}

	const getTrendBadgeVariant = (trend: string) => {
		switch (trend) {
			case 'up':
				return 'default'
			case 'down':
				return 'destructive'
			default:
				return 'secondary'
		}
	}

	const getTrendText = (trend: string) => {
		switch (trend) {
			case 'up':
				return 'Trending Up'
			case 'down':
				return 'Declining'
			default:
				return 'Stable'
		}
	}

	const getPerformanceScore = (product: ProductInsightsType) => {
		// Calculate performance score based on frequency and trend
		let score = product.frequency
		if (product.trend === 'up') score += 20
		else if (product.trend === 'down') score -= 10
		return Math.min(Math.max(score, 0), 100)
	}

	const getPerformanceLevel = (score: number) => {
		if (score >= 80)
			return {
				label: 'Excellent',
				color: 'text-green-600',
				bg: 'bg-green-50',
				icon: Crown,
			}
		if (score >= 60)
			return {
				label: 'Good',
				color: 'text-blue-600',
				bg: 'bg-blue-50',
				icon: Star,
			}
		if (score >= 40)
			return {
				label: 'Average',
				color: 'text-yellow-600',
				bg: 'bg-yellow-50',
				icon: Target,
			}
		return {
			label: 'Needs Attention',
			color: 'text-red-600',
			bg: 'bg-red-50',
			icon: AlertTriangle,
		}
	}

	const getCategoryIcon = (product: ProductInsightsType) => {
		const score = getPerformanceScore(product)
		if (score >= 80) return <Crown className='h-4 w-4 text-yellow-500' />
		if (product.trend === 'up')
			return <Flame className='h-4 w-4 text-orange-500' />
		if (product.trend === 'down')
			return <AlertTriangle className='h-4 w-4 text-red-500' />
		return <Package className='h-4 w-4 text-gray-500' />
	}

	const filteredProducts = productInsights.filter(product => {
		if (filterCategory === 'all') return true
		if (filterCategory === 'top') return getPerformanceScore(product) >= 70
		if (filterCategory === 'trending') return product.trend === 'up'
		if (filterCategory === 'declining') return product.trend === 'down'
		return true
	})

	const topPerformers = productInsights
		.sort((a, b) => getPerformanceScore(b) - getPerformanceScore(a))
		.slice(0, 3)

	if (loading) {
		return (
			<Card className='h-fit'>
				<CardHeader>
					<div className='h-6 bg-gray-200 rounded w-1/3 animate-pulse'></div>
				</CardHeader>
				<CardContent>
					<div className='space-y-4'>
						{[...Array(5)].map((_, i) => (
							<div
								key={i}
								className='border rounded-lg p-4 bg-gray-50 animate-pulse'
							>
								<div className='h-4 bg-gray-200 rounded w-1/2 mb-2'></div>
								<div className='grid grid-cols-2 gap-3'>
									{[...Array(4)].map((_, j) => (
										<div key={j}>
											<div className='h-3 bg-gray-200 rounded w-3/4 mb-1'></div>
											<div className='h-4 bg-gray-200 rounded w-1/2'></div>
										</div>
									))}
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		)
	}

	return (
		<Card className='h-fit'>
			<CardHeader className='pb-4'>
				<div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3'>
					<CardTitle className='flex items-center gap-2 text-lg sm:text-xl'>
						<Package className='h-5 w-5 flex-shrink-0 text-blue-600' />
						<span className='truncate'>Product Performance Insights</span>
					</CardTitle>

					{/* Controls */}
					<div className='flex items-center gap-2'>
						{/* Filter Buttons */}
						<div className='flex gap-1'>
							{[
								{ key: 'all', label: 'All', icon: Eye },
								{ key: 'top', label: 'Top', icon: Crown },
								{ key: 'trending', label: 'Hot', icon: Flame },
								{ key: 'declining', label: 'Low', icon: AlertTriangle },
							].map(filter => (
								<Button
									key={filter.key}
									variant={
										filterCategory === filter.key ? 'default' : 'outline'
									}
									size='sm'
									onClick={() =>
										setFilterCategory(
											filter.key as 'all' | 'top' | 'trending' | 'declining'
										)
									}
									className='h-8 px-2 sm:px-3'
								>
									<filter.icon className='h-3 w-3 sm:h-4 sm:w-4 sm:mr-1' />
									<span className='hidden sm:inline text-xs'>
										{filter.label}
									</span>
								</Button>
							))}
						</div>
					</div>
				</div>

				{/* Top Performers Summary */}
				{productInsights.length > 0 && (
					<div className='mt-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200'>
						<div className='flex items-center gap-2 mb-2'>
							<Award className='h-4 w-4 text-blue-600' />
							<span className='text-sm font-medium text-blue-900'>
								Top Performers
							</span>
						</div>
						<div className='flex gap-2 overflow-x-auto'>
							{topPerformers.map((product, idx) => (
								<div
									key={idx}
									className='flex items-center gap-2 bg-white rounded-md px-2 py-1 whitespace-nowrap'
								>
									<div className='flex items-center gap-1'>
										{idx === 0 && <Crown className='h-3 w-3 text-yellow-500' />}
										{idx === 1 && <Star className='h-3 w-3 text-gray-400' />}
										{idx === 2 && (
											<Target className='h-3 w-3 text-orange-500' />
										)}
									</div>
									<span
										className='text-xs font-medium truncate max-w-20'
										title={product.name}
									>
										{product.name}
									</span>
									<Badge variant='secondary' className='text-xs'>
										{getPerformanceScore(product)}%
									</Badge>
								</div>
							))}
						</div>
					</div>
				)}
			</CardHeader>
			<CardContent className='pt-0'>
				{filteredProducts.length === 0 ? (
					<div className='text-center text-gray-500 py-6 sm:py-8 text-sm'>
						{filterCategory === 'all'
							? 'No product data available for the selected timeframe'
							: `No ${filterCategory} products found`}
					</div>
				) : (
					<div
						className={`${
							filteredProducts.length > 5 ? 'max-h-96 overflow-y-auto pr-2' : ''
						}`}
					>
						{/* Enhanced Mobile Card Layout */}
						<div
							className={`block sm:hidden space-y-4 ${
								filteredProducts.length > 2
									? 'max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400 pr-2'
									: ''
							}`}
						>
							{filteredProducts.map((product, idx) => {
								const score = getPerformanceScore(product)
								const level = getPerformanceLevel(score)
								return (
									<div
										key={idx}
										className='border rounded-lg p-4 bg-gradient-to-br from-white to-gray-50 hover:shadow-md transition-all'
									>
										{/* Header */}
										<div className='flex justify-between items-start mb-3'>
											<div className='flex items-center gap-2 flex-1'>
												{getCategoryIcon(product)}
												<h4
													className='font-medium text-sm truncate mr-2 flex-1'
													title={product.name}
												>
													{product.name}
												</h4>
											</div>
											<div className='flex items-center gap-1 flex-shrink-0'>
												{getTrendIcon(product.trend)}
											</div>
										</div>

										{/* Performance Score */}
										<div className={`mb-3 p-2 rounded-lg ${level.bg}`}>
											<div className='flex items-center justify-between mb-1'>
												<span className='text-xs font-medium text-gray-600'>
													Performance Score
												</span>
												<div className='flex items-center gap-1'>
													<level.icon className={`h-3 w-3 ${level.color}`} />
													<span className={`text-xs font-bold ${level.color}`}>
														{score}%
													</span>
												</div>
											</div>
											<div className='w-full bg-gray-200 rounded-full h-2'>
												<div
													className={`h-2 rounded-full transition-all duration-300 ${
														score >= 80
															? 'bg-green-500'
															: score >= 60
															? 'bg-blue-500'
															: score >= 40
															? 'bg-yellow-500'
															: 'bg-red-500'
													}`}
													style={{ width: `${score}%` }}
												></div>
											</div>
											<span className={`text-xs ${level.color} font-medium`}>
												{level.label}
											</span>
										</div>

										{/* Metrics Grid */}
										<div className='grid grid-cols-2 gap-3 text-xs mb-3'>
											<div className='bg-white p-2 rounded border'>
												<p className='text-gray-600 mb-1'>Orders</p>
												<p className='font-semibold text-blue-600'>
													{product.totalOrdered}
												</p>
											</div>
											<div className='bg-white p-2 rounded border'>
												<p className='text-gray-600 mb-1'>Revenue</p>
												<p
													className='font-semibold text-green-600 truncate'
													title={formatKRW(product.totalValue)}
												>
													{formatKRW(product.totalValue)}
												</p>
											</div>
											<div className='bg-white p-2 rounded border'>
												<p className='text-gray-600 mb-1'>Frequency</p>
												<Badge variant='secondary' className='text-xs'>
													{product.frequency}%
												</Badge>
											</div>
											<div className='bg-white p-2 rounded border'>
												<p className='text-gray-600 mb-1'>Avg Price</p>
												<p
													className='font-semibold text-purple-600 truncate'
													title={formatKRW(product.avgPrice)}
												>
													{formatKRW(product.avgPrice)}
												</p>
											</div>
										</div>

										{/* Status Badge */}
										<div className='flex items-center justify-between'>
											<Badge
												variant={getTrendBadgeVariant(product.trend)}
												className='text-xs'
											>
												{getTrendText(product.trend)}
											</Badge>
											<div className='flex items-center gap-1 text-xs text-gray-500'>
												<BarChart3 className='h-3 w-3' />
												Rank #{idx + 1}
											</div>
										</div>
									</div>
								)
							})}
						</div>

						{/* Enhanced Desktop Table Layout */}
						<div className='hidden sm:block overflow-x-auto'>
							<table className='w-full'>
								<thead>
									<tr className='border-b bg-gray-50'>
										<th className='text-left p-3 text-sm font-medium text-gray-700'>
											Product
										</th>
										<th className='text-left p-3 text-sm font-medium text-gray-700'>
											Performance
										</th>
										<th className='text-left p-3 text-sm font-medium text-gray-700'>
											Orders
										</th>
										<th className='text-left p-3 text-sm font-medium text-gray-700'>
											Revenue
										</th>
										<th className='text-left p-3 text-sm font-medium text-gray-700'>
											Frequency
										</th>
										<th className='text-left p-3 text-sm font-medium text-gray-700'>
											Avg Price
										</th>
										<th className='text-left p-3 text-sm font-medium text-gray-700'>
											Status
										</th>
									</tr>
								</thead>
								<tbody>
									{filteredProducts.map((product, idx) => {
										const score = getPerformanceScore(product)
										const level = getPerformanceLevel(score)
										return (
											<tr
												key={idx}
												className='border-b hover:bg-gray-50 transition-colors'
											>
												<td className='p-3 font-medium text-sm max-w-48'>
													<div className='flex items-center gap-2'>
														{getCategoryIcon(product)}
														<div className='truncate' title={product.name}>
															{product.name}
														</div>
													</div>
												</td>
												<td className='p-3'>
													<div className='flex items-center gap-2'>
														<div
															className={`w-2 h-2 rounded-full ${
																score >= 80
																	? 'bg-green-500'
																	: score >= 60
																	? 'bg-blue-500'
																	: score >= 40
																	? 'bg-yellow-500'
																	: 'bg-red-500'
															}`}
														></div>
														<span className='text-sm font-medium'>
															{score}%
														</span>
														<level.icon className={`h-3 w-3 ${level.color}`} />
													</div>
												</td>
												<td className='p-3 text-sm font-medium text-blue-600'>
													{product.totalOrdered}
												</td>
												<td className='p-3 text-sm font-medium max-w-32 text-green-600'>
													<div
														className='truncate'
														title={formatKRW(product.totalValue)}
													>
														{formatKRW(product.totalValue)}
													</div>
												</td>
												<td className='p-3'>
													<Badge variant='secondary' className='text-xs'>
														{product.frequency}%
													</Badge>
												</td>
												<td className='p-3 text-sm font-medium max-w-32 text-purple-600'>
													<div
														className='truncate'
														title={formatKRW(product.avgPrice)}
													>
														{formatKRW(product.avgPrice)}
													</div>
												</td>
												<td className='p-3'>
													<div className='flex items-center gap-2'>
														{getTrendIcon(product.trend)}
														<Badge
															variant={getTrendBadgeVariant(product.trend)}
															className='text-xs'
														>
															{getTrendText(product.trend)}
														</Badge>
													</div>
												</td>
											</tr>
										)
									})}
								</tbody>
							</table>
						</div>
					</div>
				)}
			</CardContent>

			{/* Custom Scrollbar Styles */}
			<style jsx>{`
				.scrollbar-thin::-webkit-scrollbar {
					width: 4px;
					height: 4px;
				}

				.scrollbar-thin::-webkit-scrollbar-track {
					background: #f1f5f9;
					border-radius: 2px;
				}

				.scrollbar-thin::-webkit-scrollbar-thumb {
					background: #cbd5e1;
					border-radius: 2px;
					transition: background 0.2s ease;
				}

				.scrollbar-thin::-webkit-scrollbar-thumb:hover {
					background: #94a3b8;
				}

				.scrollbar-thumb-gray-300::-webkit-scrollbar-thumb {
					background: #d1d5db;
				}

				.scrollbar-thumb-gray-400::-webkit-scrollbar-thumb:hover {
					background: #9ca3af;
				}

				.scrollbar-track-gray-100::-webkit-scrollbar-track {
					background: #f3f4f6;
				}

				/* Mobile optimized scrollbar */
				@media (max-width: 640px) {
					.scrollbar-thin::-webkit-scrollbar {
						width: 3px;
					}

					.scrollbar-thin::-webkit-scrollbar-thumb {
						background: #9ca3af;
						border-radius: 2px;
					}

					.scrollbar-thin::-webkit-scrollbar-thumb:hover {
						background: #6b7280;
					}
				}
			`}</style>
		</Card>
	)
}

export default ProductInsights
