'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DashboardStats } from '@/types'
import {
	Activity,
	Clock,
	Database,
	RefreshCw,
	Server,
	Shield,
	Users,
} from 'lucide-react'

interface SystemStatusProps {
	stats: DashboardStats | null
}

const SystemStatus: React.FC<SystemStatusProps> = ({ stats }) => {
	const systemMetrics = [
		{
			label: 'API Status',
			value: 'Online',
			status: 'success',
			icon: Server,
			bgColor: 'bg-green-50',
			iconColor: 'text-green-600',
			borderColor: 'border-green-200',
		},
		{
			label: 'Database',
			value: 'Connected',
			status: 'success',
			icon: Database,
			bgColor: 'bg-blue-50',
			iconColor: 'text-blue-600',
			borderColor: 'border-blue-200',
		},
		{
			label: 'Security',
			value: 'Protected',
			status: 'success',
			icon: Shield,
			bgColor: 'bg-purple-50',
			iconColor: 'text-purple-600',
			borderColor: 'border-purple-200',
		},
		{
			label: 'Active Users',
			value: stats?.totalUsers || 0,
			status: 'info',
			icon: Users,
			bgColor: 'bg-orange-50',
			iconColor: 'text-orange-600',
			borderColor: 'border-orange-200',
		},
	]

	const getStatusBadge = (status: string) => {
		switch (status) {
			case 'success':
				return (
					<Badge
						variant='default'
						className='bg-green-100 text-green-800 text-xs font-medium'
					>
						Online
					</Badge>
				)
			case 'info':
				return (
					<Badge variant='secondary' className='text-xs font-medium'>
						{stats?.totalUsers || 0}
					</Badge>
				)
			default:
				return (
					<Badge variant='outline' className='text-xs'>
						Unknown
					</Badge>
				)
		}
	}

	return (
		<Card className='h-fit shadow-sm hover:shadow-md transition-shadow duration-200'>
			<CardHeader className='pb-4'>
				<div className='flex items-center justify-between'>
					<CardTitle className='text-lg flex items-center gap-2 font-semibold'>
						<Activity className='h-5 w-5 text-green-500' />
						System Status
					</CardTitle>
					<Button
						variant='ghost'
						size='sm'
						className='h-8 w-8 p-0 hover:bg-gray-100 rounded-full'
					>
						<RefreshCw className='h-4 w-4' />
					</Button>
				</div>
			</CardHeader>
			<CardContent className='pt-0'>
				<div className='grid grid-cols-2 gap-3'>
					{systemMetrics.map((metric, idx) => (
						<div
							key={idx}
							className={`flex flex-col items-center p-3 ${metric.bgColor} rounded-xl border ${metric.borderColor} hover:shadow-sm transition-all duration-200`}
						>
							<metric.icon className={`h-5 w-5 ${metric.iconColor} mb-2`} />
							<span className='text-xs text-gray-600 mb-2 text-center font-medium'>
								{metric.label}
							</span>
							{getStatusBadge(metric.status)}
						</div>
					))}
				</div>

				{/* Last Backup Info - Compact */}
				<div className='mt-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200'>
					<div className='flex items-center gap-2'>
						<div className='p-1.5 bg-blue-100 rounded-lg'>
							<Clock className='h-3 w-3 text-blue-600' />
						</div>
						<div className='flex-1'>
							<p className='text-xs font-semibold text-blue-900'>Last Backup</p>
							<p className='text-xs text-blue-700'>2 hours ago</p>
						</div>
						<Badge
							variant='outline'
							className='bg-blue-100 text-blue-800 text-xs font-medium border-blue-300'
						>
							Auto
						</Badge>
					</div>
				</div>
			</CardContent>
		</Card>
	)
}

export default SystemStatus
