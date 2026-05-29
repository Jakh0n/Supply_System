'use client'

import { Calendar, FileText } from 'lucide-react'
import { useTranslations } from 'next-intl'

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
	const t = useTranslations('editor.stats')

	const statsData = [
		{
			title: t('todayOrders'),
			shortTitle: t('todayShort'),
			value: stats.todayOrders,
			icon: Calendar,
			iconColor: 'text-blue-500',
			bg: 'bg-blue-50/80',
		},
		{
			title: t('completedToday'),
			shortTitle: t('doneShort'),
			value: stats.todayCompletedOrders || 0,
			icon: FileText,
			iconColor: 'text-green-500',
			bg: 'bg-green-50/80',
		},
		{
			title: t('pendingOrders'),
			shortTitle: t('pendingShort'),
			value: stats.pendingOrders,
			icon: FileText,
			iconColor: 'text-yellow-600',
			bg: 'bg-amber-50/80',
		},
		{
			title: t('allCompleted'),
			shortTitle: t('allShort'),
			value: stats.completedOrders || 0,
			icon: FileText,
			iconColor: 'text-gray-500',
			bg: 'bg-gray-50/80',
		},
	]

	return (
		<div className='grid grid-cols-4 gap-1.5 sm:gap-3 lg:gap-6 mb-3 sm:mb-8 w-full'>
			{statsData.map((stat, index) => (
				<div
					key={index}
					className={`flex flex-col items-center justify-center rounded-lg border border-gray-200 ${stat.bg} py-2 px-1 sm:py-4 sm:px-4 min-w-0 w-full`}
				>
					<stat.icon
						className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${stat.iconColor} shrink-0 mb-0.5 sm:mb-2`}
					/>
					<p className='text-[9px] sm:text-xs font-medium text-gray-500 leading-tight text-center truncate w-full'>
						<span className='sm:hidden'>{stat.shortTitle}</span>
						<span className='hidden sm:inline'>{stat.title}</span>
					</p>
					<p className='text-base sm:text-2xl font-bold text-gray-900 tabular-nums leading-tight mt-0.5'>
						{stat.value}
					</p>
				</div>
			))}
		</div>
	)
}

export default StatsCards
