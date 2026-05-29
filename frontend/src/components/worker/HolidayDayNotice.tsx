'use client'

import { Button } from '@/components/ui/button'
import { useOrderDayContext } from '@/hooks/queries'
import { CalendarDays, Loader2, PartyPopper, Sparkles, TrendingUp } from 'lucide-react'
import React from 'react'

interface HolidayDayNoticeProps {
	requestedDate: string
}

const trafficStyles: Record<
	string,
	{ border: string; bg: string; icon: React.ReactNode }
> = {
	higher: {
		border: 'border-amber-200',
		bg: 'bg-amber-50',
		icon: <TrendingUp className='h-4 w-4 text-amber-600 shrink-0' />,
	},
	lower: {
		border: 'border-blue-200',
		bg: 'bg-blue-50',
		icon: <CalendarDays className='h-4 w-4 text-blue-600 shrink-0' />,
	},
	closed: {
		border: 'border-red-200',
		bg: 'bg-red-50',
		icon: <PartyPopper className='h-4 w-4 text-red-600 shrink-0' />,
	},
	normal: {
		border: 'border-emerald-200',
		bg: 'bg-emerald-50',
		icon: <Sparkles className='h-4 w-4 text-emerald-600 shrink-0' />,
	},
}

const HolidayDayNotice: React.FC<HolidayDayNoticeProps> = ({ requestedDate }) => {
	const { data, isLoading, isError, refetch } = useOrderDayContext(requestedDate)

	if (!requestedDate) {
		return null
	}

	if (isLoading) {
		return (
			<div className='rounded-lg border border-gray-200 bg-gray-50 p-3 flex items-center gap-2 text-sm text-gray-500'>
				<Loader2 className='h-4 w-4 animate-spin' />
				Checking calendar...
			</div>
		)
	}

	if (isError) {
		return (
			<div className='rounded-lg border border-red-200 bg-red-50 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2'>
				<p className='text-sm text-red-700'>Could not load holiday information.</p>
				<Button variant='outline' size='sm' onClick={() => refetch()}>
					Retry
				</Button>
			</div>
		)
	}

	const dayContext = data?.dayContext
	if (!dayContext) {
		return null
	}

	const traffic = dayContext.trafficHint ?? 'normal'
	const style = trafficStyles[traffic] ?? trafficStyles.normal

	const showNotice =
		dayContext.isHoliday ||
		dayContext.isWeekend ||
		dayContext.trafficHint === 'higher' ||
		dayContext.messages.length > 0

	if (!showNotice && dayContext.trafficHint === 'normal') {
		return null
	}

	return (
		<div
			className={`rounded-lg border p-3 sm:p-4 flex gap-3 ${style.border} ${style.bg}`}
			role='note'
		>
			{style.icon}
			<div className='min-w-0 flex-1 space-y-1'>
				<p className='text-sm font-semibold text-gray-900'>
					{dayContext.date} · {dayContext.dayOfWeekEn}
					{dayContext.isHoliday && dayContext.holidayNameEn && (
						<span className='ml-1 text-red-700'>· {dayContext.holidayNameEn}</span>
					)}
				</p>
				<p className='text-xs sm:text-sm text-gray-700 leading-relaxed'>
					{dayContext.summary ?? dayContext.messages.join(' ')}
				</p>
			</div>
		</div>
	)
}

export default HolidayDayNotice
