import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, FileText } from 'lucide-react'

interface DashboardStats {
	todayOrders: number
	todayCompletedOrders: number
	pendingOrders: number
	completedOrders?: number
}

interface StatsCardsProps {
	stats: DashboardStats
}

const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
	const statsData = [
		{
			title: "Today's Orders",
			value: stats.todayOrders,
			icon: Calendar,
			iconColor: 'text-blue-500',
		},
		{
			title: 'Completed Today',
			value: stats.todayCompletedOrders || 0,
			icon: FileText,
			iconColor: 'text-green-500',
		},
		{
			title: 'Pending Orders',
			value: stats.pendingOrders,
			icon: FileText,
			iconColor: 'text-yellow-500',
		},
		{
			title: 'All Completed',
			value: stats.completedOrders || 0,
			icon: FileText,
			iconColor: 'text-gray-500',
		},
	]

	return (
		<div className='grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8'>
			{statsData.map((stat, index) => (
				<Card key={index} className='hover:shadow-md transition-shadow'>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
						<CardTitle className='text-xs sm:text-sm font-medium text-gray-600 leading-tight'>
							{stat.title}
						</CardTitle>
						<stat.icon
							className={`h-3 w-3 sm:h-4 sm:w-4 ${stat.iconColor} flex-shrink-0`}
						/>
					</CardHeader>
					<CardContent className='pt-0'>
						<div className='text-lg sm:text-2xl font-bold text-gray-900'>
							{stat.value}
						</div>
					</CardContent>
				</Card>
			))}
		</div>
	)
}

export default StatsCards
