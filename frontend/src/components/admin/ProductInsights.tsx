'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ProductInsights as ProductInsightsType } from '@/types'
import { Activity, Package, TrendingDown, TrendingUp } from 'lucide-react'

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
	const getTrendIcon = (trend: string | number) => {
		if (typeof trend === 'number') {
			return trend > 0 ? (
				<TrendingUp className='h-4 w-4 text-green-500' />
			) : (
				<TrendingDown className='h-4 w-4 text-red-500' />
			)
		}
		return trend === 'up' ? (
			<TrendingUp className='h-4 w-4 text-green-500' />
		) : trend === 'down' ? (
			<TrendingDown className='h-4 w-4 text-red-500' />
		) : (
			<Activity className='h-4 w-4 text-gray-500' />
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
				<CardTitle className='flex items-center gap-2 text-lg sm:text-xl'>
					<Package className='h-5 w-5 flex-shrink-0' />
					<span className='truncate'>Product Performance Insights</span>
				</CardTitle>
			</CardHeader>
			<CardContent className='pt-0'>
				{productInsights.length === 0 ? (
					<div className='text-center text-gray-500 py-6 sm:py-8 text-sm'>
						No product data available for the selected timeframe
					</div>
				) : (
					<div
						className={`${
							productInsights.length > 5 ? 'max-h-96 overflow-y-auto pr-2' : ''
						}`}
					>
						{/* Mobile Card Layout */}
						<div className='block sm:hidden space-y-4'>
							{productInsights.map((product, idx) => (
								<div
									key={idx}
									className='border rounded-lg p-4 bg-gray-50 hover:shadow-sm transition-shadow'
								>
									<div className='flex justify-between items-start mb-3'>
										<h4
											className='font-medium text-sm truncate mr-2 flex-1'
											title={product.name}
										>
											{product.name}
										</h4>
										<div className='flex items-center gap-1 flex-shrink-0'>
											{getTrendIcon(product.trend)}
										</div>
									</div>
									<div className='grid grid-cols-2 gap-3 text-xs mb-3'>
										<div className='bg-white p-2 rounded'>
											<p className='text-gray-600 mb-1'>Total Ordered</p>
											<p className='font-semibold'>{product.totalOrdered}</p>
										</div>
										<div className='bg-white p-2 rounded'>
											<p className='text-gray-600 mb-1'>Total Value</p>
											<p
												className='font-semibold truncate'
												title={formatKRW(product.totalValue)}
											>
												{formatKRW(product.totalValue)}
											</p>
										</div>
										<div className='bg-white p-2 rounded'>
											<p className='text-gray-600 mb-1'>Frequency</p>
											<Badge variant='secondary' className='text-xs'>
												{product.frequency}%
											</Badge>
										</div>
										<div className='bg-white p-2 rounded'>
											<p className='text-gray-600 mb-1'>Avg Price</p>
											<p
												className='font-semibold truncate'
												title={formatKRW(product.avgPrice)}
											>
												{formatKRW(product.avgPrice)}
											</p>
										</div>
									</div>
									<Badge
										variant={getTrendBadgeVariant(product.trend)}
										className='text-xs'
									>
										{getTrendText(product.trend)}
									</Badge>
								</div>
							))}
						</div>

						{/* Desktop Table Layout */}
						<div className='hidden sm:block overflow-x-auto'>
							<table className='w-full'>
								<thead>
									<tr className='border-b'>
										<th className='text-left p-3 text-sm font-medium text-gray-700'>
											Product
										</th>
										<th className='text-left p-3 text-sm font-medium text-gray-700'>
											Total Ordered
										</th>
										<th className='text-left p-3 text-sm font-medium text-gray-700'>
											Total Value
										</th>
										<th className='text-left p-3 text-sm font-medium text-gray-700'>
											Frequency
										</th>
										<th className='text-left p-3 text-sm font-medium text-gray-700'>
											Avg Price
										</th>
										<th className='text-left p-3 text-sm font-medium text-gray-700'>
											Trend
										</th>
									</tr>
								</thead>
								<tbody>
									{productInsights.map((product, idx) => (
										<tr
											key={idx}
											className='border-b hover:bg-gray-50 transition-colors'
										>
											<td className='p-3 font-medium text-sm max-w-48'>
												<div className='truncate' title={product.name}>
													{product.name}
												</div>
											</td>
											<td className='p-3 text-sm'>{product.totalOrdered}</td>
											<td className='p-3 text-sm font-medium max-w-32'>
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
											<td className='p-3 text-sm font-medium max-w-32'>
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
									))}
								</tbody>
							</table>
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	)
}

export default ProductInsights
