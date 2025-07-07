'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DashboardStats } from '@/types'
import {
	BarChart3,
	Download,
	FileSpreadsheet,
	FileText,
	FileType,
	Settings,
} from 'lucide-react'
import { useRouter } from 'next/navigation'

interface QuickActionsProps {
	actionLoading: string | null
	stats: DashboardStats | null
	onQuickAction: (action: string, format?: string) => Promise<void>
}

const QuickActions: React.FC<QuickActionsProps> = ({
	actionLoading,
	stats,
	onQuickAction,
}) => {
	const router = useRouter()

	const quickActions = [
		{
			title: 'Generate Report',
			description: 'Create comprehensive analytics report',
			icon: FileText,
			action: 'generate-report',
			hasDropdown: true,
		},
		{
			title: 'Export Orders',
			description: 'Download order data for analysis',
			icon: Download,
			action: 'export-orders',
			hasDropdown: true,
		},
		{
			title: 'View Analytics',
			description: 'Detailed performance metrics',
			icon: BarChart3,
			action: () => router.push('/admin/analytics'),
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
		{ label: 'Excel (.csv)', value: 'excel', icon: FileSpreadsheet },
		{ label: 'PDF (.html)', value: 'pdf', icon: FileText },
		{ label: 'Word (.rtf)', value: 'doc', icon: FileType },
	]

	const handleActionClick = async (
		action: string | (() => void),
		format?: string
	) => {
		if (typeof action === 'function') {
			action()
		} else {
			await onQuickAction(action, format)
		}
	}

	return (
		<div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6'>
			<Card>
				<CardHeader className='pb-4'>
					<CardTitle className='text-base sm:text-lg'>Quick Actions</CardTitle>
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
												className='w-full justify-start h-auto p-3'
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
													className='flex items-center gap-2'
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
										className='w-full justify-start h-auto p-3'
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
