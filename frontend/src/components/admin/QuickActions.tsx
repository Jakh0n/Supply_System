'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { DashboardStats } from '@/types'
import {
	Activity,
	BarChart3,
	Calendar,
	CalendarDays,
	Clock,
	Database,
	Download,
	FileSpreadsheet,
	FileText,
	FileType,
	RefreshCw,
	Server,
	Settings,
	Shield,
	TrendingUp,
	Users,
	Zap,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface QuickActionsProps {
	actionLoading: string | null
	stats: DashboardStats | null
	onQuickAction: (
		action: string,
		format?: string,
		timeframe?: string
	) => Promise<void>
}

const QuickActions: React.FC<QuickActionsProps> = ({
	actionLoading,
	stats,
	onQuickAction,
}) => {
	const router = useRouter()
	const [selectedTimeframe, setSelectedTimeframe] = useState('daily')

	const timeframeOptions = [
		{ value: 'daily', label: 'Daily', icon: Calendar },
		{ value: 'weekly', label: 'Weekly', icon: CalendarDays },
		{ value: 'monthly', label: 'Monthly', icon: Calendar },
		{ value: '6months', label: '6 Months', icon: TrendingUp },
		{ value: 'yearly', label: 'Yearly', icon: TrendingUp },
	]

	const quickActions = [
		{
			title: 'Download Stats',
			description: `${selectedTimeframe} data`,
			icon: Download,
			action: 'download-statistics',
			hasDropdown: true,
			color: 'bg-blue-50 hover:bg-blue-100 border-blue-200',
			iconColor: 'text-blue-600',
		},
		{
			title: 'Generate Report',
			description: `${selectedTimeframe} report`,
			icon: FileText,
			action: 'generate-report',
			hasDropdown: true,
			color: 'bg-green-50 hover:bg-green-100 border-green-200',
			iconColor: 'text-green-600',
		},
		{
			title: 'View Analytics',
			description: 'Performance metrics',
			icon: BarChart3,
			action: () => router.push('/admin/branches'),
			hasDropdown: false,
			color: 'bg-purple-50 hover:bg-purple-100 border-purple-200',
			iconColor: 'text-purple-600',
		},
		{
			title: 'System Settings',
			description: 'Configure system',
			icon: Settings,
			action: () => router.push('/admin/settings'),
			hasDropdown: false,
			color: 'bg-orange-50 hover:bg-orange-100 border-orange-200',
			iconColor: 'text-orange-600',
		},
	]

	const exportFormats = [
		{ label: 'PDF Report', value: 'pdf', icon: FileText },
		{ label: 'Excel (.csv)', value: 'excel', icon: FileSpreadsheet },
		{ label: 'Word (.rtf)', value: 'doc', icon: FileType },
	]

	const systemMetrics = [
		{
			label: 'API Status',
			value: 'Online',
			status: 'success',
			icon: Server,
		},
		{
			label: 'Database',
			value: 'Connected',
			status: 'success',
			icon: Database,
		},
		{
			label: 'Security',
			value: 'Protected',
			status: 'success',
			icon: Shield,
		},
		{
			label: 'Active Users',
			value: stats?.totalUsers || 0,
			status: 'info',
			icon: Users,
		},
	]

	const recentActivities = [
		{
			title: 'New order received',
			time: '5 minutes ago',
			type: 'order',
			color: 'bg-blue-500',
		},
		{
			title: 'User registered',
			time: '12 minutes ago',
			type: 'user',
			color: 'bg-green-500',
		},
		{
			title: 'Order pending review',
			time: '25 minutes ago',
			type: 'pending',
			color: 'bg-orange-500',
		},
		{
			title: 'Product updated',
			time: '1 hour ago',
			type: 'product',
			color: 'bg-purple-500',
		},
		{
			title: 'System maintenance completed',
			time: '2 hours ago',
			type: 'system',
			color: 'bg-red-500',
		},
		{
			title: 'Analytics report generated',
			time: '3 hours ago',
			type: 'report',
			color: 'bg-indigo-500',
		},
	]

	const handleActionClick = async (
		action: string | (() => void),
		format?: string
	) => {
		if (typeof action === 'function') {
			action()
		} else {
			await onQuickAction(action, format, selectedTimeframe)
		}
	}

	const getStatusBadge = (status: string) => {
		switch (status) {
			case 'success':
				return (
					<Badge
						variant='default'
						className='bg-green-100 text-green-800 text-xs'
					>
						Online
					</Badge>
				)
			case 'info':
				return (
					<Badge variant='secondary' className='text-xs'>
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
		<div className='space-y-4 sm:space-y-6'>
			{/* Quick Actions Card */}
			<Card className='h-fit'>
				<CardHeader className='pb-4'>
					<div className='flex items-center justify-between'>
						<CardTitle className='text-base sm:text-lg flex items-center gap-2'>
							<Zap className='h-5 w-5 text-yellow-500' />
							Quick Actions
						</CardTitle>
						<Badge variant='outline' className='text-xs'>
							{selectedTimeframe}
						</Badge>
					</div>

					{/* Timeframe Selector */}
					<div className='mt-3'>
						<Select
							value={selectedTimeframe}
							onValueChange={setSelectedTimeframe}
						>
							<SelectTrigger className='w-full h-9 text-sm'>
								<SelectValue placeholder='Select timeframe' />
							</SelectTrigger>
							<SelectContent>
								{timeframeOptions.map(option => (
									<SelectItem key={option.value} value={option.value}>
										<div className='flex items-center gap-2'>
											<option.icon className='h-4 w-4' />
											{option.label}
										</div>
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</CardHeader>
				<CardContent className='pt-0'>
					{/* Action Buttons Grid */}
					<div className='grid grid-cols-2 gap-3'>
						{quickActions.map((action, idx) => (
							<div key={idx}>
								{action.hasDropdown ? (
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button
												variant='outline'
												className={`w-full h-auto p-3 cursor-pointer transition-all ${action.color}`}
												disabled={actionLoading === action.action}
											>
												<div className='flex flex-col items-center gap-2 w-full'>
													<action.icon
														className={`h-5 w-5 ${action.iconColor}`}
													/>
													<div className='text-center'>
														<div className='font-medium text-sm truncate'>
															{action.title}
														</div>
														<div className='text-xs text-gray-500 truncate'>
															{action.description}
														</div>
													</div>
												</div>
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align='start' className='w-48'>
											{exportFormats.map(format => (
												<DropdownMenuItem
													key={format.value}
													onClick={() =>
														handleActionClick(action.action, format.value)
													}
													className='flex items-center gap-2 cursor-pointer'
												>
													<format.icon className='h-4 w-4' />
													{format.label}
												</DropdownMenuItem>
											))}
										</DropdownMenuContent>
									</DropdownMenu>
								) : (
									<Button
										variant='outline'
										className={`w-full h-auto p-3 cursor-pointer transition-all ${action.color}`}
										onClick={() => handleActionClick(action.action)}
									>
										<div className='flex flex-col items-center gap-2 w-full'>
											<action.icon className={`h-5 w-5 ${action.iconColor}`} />
											<div className='text-center'>
												<div className='font-medium text-sm truncate'>
													{action.title}
												</div>
												<div className='text-xs text-gray-500 truncate'>
													{action.description}
												</div>
											</div>
										</div>
									</Button>
								)}
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			{/* System Status Card */}
			<Card className='h-fit'>
				<CardHeader className='pb-4'>
					<div className='flex items-center justify-between'>
						<CardTitle className='text-base sm:text-lg flex items-center gap-2'>
							<Activity className='h-5 w-5 text-green-500' />
							System Status
						</CardTitle>
						<Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
							<RefreshCw className='h-4 w-4' />
						</Button>
					</div>
				</CardHeader>
				<CardContent className='pt-0'>
					<div className='grid grid-cols-2 gap-3'>
						{systemMetrics.map((metric, idx) => (
							<div
								key={idx}
								className='flex flex-col items-center p-3 bg-gray-50 rounded-lg border'
							>
								<metric.icon className='h-5 w-5 text-gray-600 mb-2' />
								<span className='text-xs text-gray-600 mb-1 text-center'>
									{metric.label}
								</span>
								{getStatusBadge(metric.status)}
							</div>
						))}
					</div>

					{/* Last Backup Info */}
					<div className='mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200'>
						<div className='flex items-center gap-2'>
							<Clock className='h-4 w-4 text-blue-600' />
							<div className='flex-1'>
								<p className='text-sm font-medium text-blue-900'>Last Backup</p>
								<p className='text-xs text-blue-700'>2 hours ago</p>
							</div>
							<Badge
								variant='outline'
								className='bg-blue-100 text-blue-800 text-xs'
							>
								Auto
							</Badge>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Recent Activity Card */}
			<Card className='h-fit'>
				<CardHeader className='pb-4'>
					<CardTitle className='text-base sm:text-lg flex items-center gap-2'>
						<Clock className='h-5 w-5 text-blue-500' />
						Recent Activity
					</CardTitle>
				</CardHeader>
				<CardContent className='pt-0'>
					<div className='space-y-3 max-h-48 overflow-y-auto pr-1'>
						{recentActivities.map((activity, idx) => (
							<div
								key={idx}
								className='flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors'
							>
								<div
									className={`w-2 h-2 ${activity.color} rounded-full mt-2 flex-shrink-0`}
								></div>
								<div className='flex-1 min-w-0'>
									<p className='text-sm font-medium truncate'>
										{activity.title}
									</p>
									<p className='text-xs text-gray-500'>{activity.time}</p>
								</div>
								<Badge variant='outline' className='text-xs ml-auto'>
									{activity.type}
								</Badge>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	)
}

export default QuickActions
