import { Card, CardContent } from '@/components/ui/card'
import { BranchAnalytics } from '@/types'
import { BarChart3, DollarSign, MapPin, ShoppingCart } from 'lucide-react'

interface BranchAnalyticsStatsProps {
	filteredBranches: BranchAnalytics[]
	formatKRW: (amount: number) => string
	getEfficiencyScore: (branch: BranchAnalytics) => number
}

const BranchAnalyticsStats: React.FC<BranchAnalyticsStatsProps> = ({
	filteredBranches,
	formatKRW,
	getEfficiencyScore,
}) => {
	const totalOrders = filteredBranches.reduce(
		(sum, branch) => sum + branch.totalOrders,
		0
	)

	const totalSpending = filteredBranches.reduce(
		(sum, branch) => sum + branch.totalValue,
		0
	)

	const avgEfficiency =
		filteredBranches.length > 0
			? Math.round(
					filteredBranches.reduce(
						(sum, branch) => sum + getEfficiencyScore(branch),
						0
					) / filteredBranches.length
			  )
			: 0

	return (
		<div className='grid md:grid-cols-3  max-sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6'>
			<Card>
				<CardContent className='p-4 sm:p-6'>
					<div className='flex items-center justify-between'>
						<div>
							<p className='text-xs sm:text-sm font-medium text-gray-600'>
								Total Branches
							</p>
							<p className='text-xl sm:text-2xl font-bold'>
								{filteredBranches.length}
							</p>
						</div>
						<MapPin className='h-6 w-6 sm:h-8 sm:w-8 text-blue-600' />
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardContent className='p-4 sm:p-6'>
					<div className='flex items-center justify-between'>
						<div>
							<p className='text-xs sm:text-sm font-medium text-gray-600'>
								Total Orders
							</p>
							<p className='text-xl sm:text-2xl font-bold'>{totalOrders}</p>
						</div>
						<ShoppingCart className='h-6 w-6 sm:h-8 sm:w-8 text-green-600' />
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardContent className='p-4 sm:p-6'>
					<div className='flex items-center justify-between'>
						<div>
							<p className='text-xs sm:text-sm font-medium text-gray-600'>
								Total Spending
							</p>
							<p className='text-lg sm:text-2xl font-bold text-purple-600 break-all'>
								{formatKRW(totalSpending)}
							</p>
						</div>
						<DollarSign className='h-6 w-6 sm:h-8 sm:w-8 text-purple-600' />
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardContent className='p-4 sm:p-6'>
					<div className='flex items-center justify-between'>
						<div>
							<p className='text-xs sm:text-sm font-medium text-gray-600'>
								Avg Efficiency
							</p>
							<p className='text-xl sm:text-2xl font-bold text-orange-600'>
								{avgEfficiency}%
							</p>
						</div>
						<BarChart3 className='h-6 w-6 sm:h-8 sm:w-8 text-orange-600' />
					</div>
				</CardContent>
			</Card>
		</div>
	)
}

export default BranchAnalyticsStats
