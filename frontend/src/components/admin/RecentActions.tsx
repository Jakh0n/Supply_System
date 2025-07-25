'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock } from 'lucide-react'

const RecentActions: React.FC = () => {
	const recentActivities = [
		{
			title: 'New order received',
			time: '5 minutes ago',
			type: 'order',
			color: 'bg-blue-500',
			bgColor: 'bg-blue-50',
			textColor: 'text-blue-700',
		},
		{
			title: 'User registered',
			time: '12 minutes ago',
			type: 'user',
			color: 'bg-green-500',
			bgColor: 'bg-green-50',
			textColor: 'text-green-700',
		},
		{
			title: 'Order pending review',
			time: '25 minutes ago',
			type: 'pending',
			color: 'bg-orange-500',
			bgColor: 'bg-orange-50',
			textColor: 'text-orange-700',
		},
		{
			title: 'Product updated',
			time: '1 hour ago',
			type: 'product',
			color: 'bg-purple-500',
			bgColor: 'bg-purple-50',
			textColor: 'text-purple-700',
		},
		{
			title: 'System maintenance completed',
			time: '2 hours ago',
			type: 'system',
			color: 'bg-red-500',
			bgColor: 'bg-red-50',
			textColor: 'text-red-700',
		},
		{
			title: 'Analytics report generated',
			time: '3 hours ago',
			type: 'report',
			color: 'bg-indigo-500',
			bgColor: 'bg-indigo-50',
			textColor: 'text-indigo-700',
		},
	]

	return (
		<Card className='h-fit shadow-sm hover:shadow-md transition-shadow duration-200'>
			<CardHeader className='pb-4'>
				<CardTitle className='text-lg flex items-center gap-2 font-semibold'>
					<Clock className='h-5 w-5 text-blue-500' />
					Recent Activity
				</CardTitle>
			</CardHeader>
			<CardContent className='pt-0'>
				<div className='space-y-3 max-h-72 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100'>
					{recentActivities.map((activity, idx) => (
						<div
							key={idx}
							className={`flex items-start gap-3 p-3 rounded-xl ${activity.bgColor} hover:shadow-sm transition-all duration-200 border border-gray-100`}
						>
							<div
								className={`w-3 h-3 ${activity.color} rounded-full mt-2 flex-shrink-0 shadow-sm`}
							></div>
							<div className='flex-1 min-w-0'>
								<p
									className={`text-sm font-semibold truncate ${activity.textColor}`}
								>
									{activity.title}
								</p>
								<p className='text-xs text-gray-500 mt-1'>{activity.time}</p>
							</div>
							<Badge
								variant='outline'
								className='text-xs ml-auto font-medium bg-white/80 backdrop-blur-sm'
							>
								{activity.type}
							</Badge>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	)
}

export default RecentActions
