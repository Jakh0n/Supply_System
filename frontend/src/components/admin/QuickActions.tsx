'use client'

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
	BarChart3,
	Calendar,
	CalendarDays,
	Download,
	FileSpreadsheet,
	FileText,
	FileType,
	Settings,
	TrendingUp,
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
			title: 'Download Statistics',
			description: `Download ${selectedTimeframe} performance data`,
			icon: Download,
			action: 'download-statistics',
			hasDropdown: true,
		},
		{
			title: 'Generate Report',
			description: `Create ${selectedTimeframe} analytics report`,
			icon: FileText,
			action: 'generate-report',
			hasDropdown: true,
		},
		{
			title: 'View Analytics',
			description: 'Detailed performance metrics',
			icon: BarChart3,
			action: () => router.push('/admin/branches'),
			hasDropdown: false,
		},
		{
			title: 'System Settings',
			description: 'Configure system parameters',
			icon: Settings,
			action: () => router.push('/admin/settings'),
			hasDropdown: false,
		},
	]

	const exportFormats = [
		{ label: 'PDF Report', value: 'pdf', icon: FileText },
		{ label: 'Excel (.csv)', value: 'excel', icon: FileSpreadsheet },
		{ label: 'Word (.rtf)', value: 'doc', icon: FileType },
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

	return (
		<div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6'>
			<Card>
				<CardHeader className='pb-4'>
					<div className='flex flex-col space-y-3'>
						<CardTitle className='text-base sm:text-lg'>
							Quick Actions
						</CardTitle>

						{/* Timeframe Selector */}
						<div className='flex flex-col space-y-2'>
							<label className='text-xs font-medium text-gray-600'>
								Statistics Period:
							</label>
							<Select
								value={selectedTimeframe}
								onValueChange={setSelectedTimeframe}
							>
								<SelectTrigger className='w-full h-8 text-xs'>
									<SelectValue placeholder='Select timeframe' />
								</SelectTrigger>
								<SelectContent>
									{timeframeOptions.map(option => (
										<SelectItem key={option.value} value={option.value}>
											<div className='flex items-center gap-2'>
												<option.icon className='h-3 w-3' />
												{option.label}
											</div>
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>
				</CardHeader>
				<CardContent className='pt-0'>
					<div className='space-y-3'>
						{quickActions.map((action, idx) => (
							<div key={idx}>
								{action.hasDropdown ? (
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button
												variant='outline'
												className='w-full justify-start h-auto p-3 cursor-pointer'
												disabled={actionLoading === action.action}
											>
												<div className='flex items-center gap-3'>
													<action.icon className='h-4 w-4' />
													<div className='text-left'>
														<div className='font-medium text-sm'>
															{action.title}
														</div>
														<div className='text-xs text-gray-500'>
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
										className='w-full justify-start h-auto p-3 cursor-pointer'
										onClick={() => handleActionClick(action.action)}
									>
										<div className='flex items-center gap-3'>
											<action.icon className='h-4 w-4' />
											<div className='text-left'>
												<div className='font-medium text-sm'>
													{action.title}
												</div>
												<div className='text-xs text-gray-500'>
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

			{/* System Status */}
			<Card>
				<CardHeader className='pb-4'>
					<CardTitle className='text-base sm:text-lg'>System Status</CardTitle>
				</CardHeader>
				<CardContent className='pt-0'>
					<div className='space-y-3'>
						<div className='flex justify-between items-center'>
							<span className='text-sm text-gray-600'>API Status</span>
							<div className='flex items-center gap-2'>
								<div className='w-2 h-2 bg-green-500 rounded-full'></div>
								<span className='text-sm font-medium'>Online</span>
							</div>
						</div>
						<div className='flex justify-between items-center'>
							<span className='text-sm text-gray-600'>Database</span>
							<div className='flex items-center gap-2'>
								<div className='w-2 h-2 bg-green-500 rounded-full'></div>
								<span className='text-sm font-medium'>Connected</span>
							</div>
						</div>
						<div className='flex justify-between items-center'>
							<span className='text-sm text-gray-600'>Last Backup</span>
							<span className='text-sm text-gray-500'>2 hours ago</span>
						</div>
						<div className='flex justify-between items-center'>
							<span className='text-sm text-gray-600'>Active Users</span>
							<span className='text-sm font-medium'>
								{stats?.totalUsers || 0}
							</span>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Recent Activity */}
			<Card>
				<CardHeader className='pb-4'>
					<CardTitle className='text-base sm:text-lg'>
						Recent Activity
					</CardTitle>
				</CardHeader>
				<CardContent className='pt-0'>
					<div className='space-y-3'>
						<div className='flex items-start gap-3'>
							<div className='w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0'></div>
							<div className='flex-1 min-w-0'>
								<p className='text-sm font-medium'>New order received</p>
								<p className='text-xs text-gray-500'>5 minutes ago</p>
							</div>
						</div>
						<div className='flex items-start gap-3'>
							<div className='w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0'></div>
							<div className='flex-1 min-w-0'>
								<p className='text-sm font-medium'>User registered</p>
								<p className='text-xs text-gray-500'>12 minutes ago</p>
							</div>
						</div>
						<div className='flex items-start gap-3'>
							<div className='w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0'></div>
							<div className='flex-1 min-w-0'>
								<p className='text-sm font-medium'>Order pending review</p>
								<p className='text-xs text-gray-500'>25 minutes ago</p>
							</div>
						</div>
						<div className='flex items-start gap-3'>
							<div className='w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0'></div>
							<div className='flex-1 min-w-0'>
								<p className='text-sm font-medium'>Product updated</p>
								<p className='text-xs text-gray-500'>1 hour ago</p>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}

export default QuickActions
