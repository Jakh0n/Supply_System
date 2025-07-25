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
	Zap,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface QuickActionsProps {
	actionLoading: string | null
	onQuickAction: (
		action: string,
		format?: string,
		timeframe?: string
	) => Promise<void>
}

const QuickActions: React.FC<QuickActionsProps> = ({
	actionLoading,
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
		<Card className='h-fit shadow-sm hover:shadow-md transition-shadow duration-200'>
			<CardHeader className='pb-4'>
				<div className='flex items-center justify-between'>
					<CardTitle className='text-lg flex items-center gap-2 font-semibold'>
						<Zap className='h-5 w-5 text-yellow-500' />
						Quick Actions
					</CardTitle>
					<Badge
						variant='outline'
						className='text-xs font-medium bg-yellow-50 text-yellow-700 border-yellow-200'
					>
						{selectedTimeframe}
					</Badge>
				</div>

				{/* Timeframe Selector */}
				<div className='mt-4'>
					<Select
						value={selectedTimeframe}
						onValueChange={setSelectedTimeframe}
					>
						<SelectTrigger className='w-full h-10 text-sm border-gray-200 focus:border-blue-300 focus:ring-2 focus:ring-blue-100'>
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
											className={`w-full h-auto p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${action.color} border-2`}
											disabled={actionLoading === action.action}
										>
											<div className='flex flex-col items-center gap-3 w-full'>
												<action.icon
													className={`h-6 w-6 ${action.iconColor}`}
												/>
												<div className='text-center'>
													<div className='font-semibold text-sm truncate'>
														{action.title}
													</div>
													<div className='text-xs text-gray-500 truncate mt-1'>
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
									className={`w-full h-auto p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${action.color} border-2`}
									onClick={() => handleActionClick(action.action)}
								>
									<div className='flex flex-col items-center gap-3 w-full'>
										<action.icon className={`h-6 w-6 ${action.iconColor}`} />
										<div className='text-center'>
											<div className='font-semibold text-sm truncate'>
												{action.title}
											</div>
											<div className='text-xs text-gray-500 truncate mt-1'>
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
	)
}

export default QuickActions
