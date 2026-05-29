'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Order, OrderStatus } from '@/types'
import {
	Building2,
	Edit,
	Eye,
	MoreHorizontal,
	Package,
	Printer,
} from 'lucide-react'
import { getOrderRowClass, getOrderStatusBadgeClass } from './orderStatus'
import StatusSelect from './StatusSelect'

interface OrderMobileCardProps {
	order: Order
	compact?: boolean
	inlineStatus?: boolean
	isUpdating?: boolean
	onView: () => void
	onPrint: () => void
	onStatusChange?: (status: OrderStatus) => void
	onAddNotes?: () => void
}

function getStatusIconClass(status: string): string {
	switch (status) {
		case 'pending':
			return 'bg-amber-100 text-amber-700'
		case 'approved':
			return 'bg-green-100 text-green-700'
		case 'rejected':
			return 'bg-red-100 text-red-700'
		case 'completed':
			return 'bg-blue-100 text-blue-700'
		default:
			return 'bg-gray-100 text-gray-600'
	}
}

export default function OrderMobileCard({
	order,
	compact = false,
	inlineStatus = false,
	isUpdating = false,
	onView,
	onPrint,
	onStatusChange,
	onAddNotes,
}: OrderMobileCardProps) {
	return (
		<Card
			className={`overflow-hidden border shadow-none ${getOrderRowClass(order.status)}`}
		>
			<CardContent className='p-2.5'>
				<div
					className='flex items-center gap-2.5 cursor-pointer active:opacity-80'
					onClick={onView}
				>
					<div
						className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${getStatusIconClass(order.status)}`}
					>
						<Building2 className='h-4 w-4' />
					</div>

					<div className='min-w-0 flex-1'>
						<p className='text-sm font-semibold text-gray-900 truncate leading-tight'>
							{order.branch}
						</p>
						<div className='flex items-center gap-2 mt-0.5 min-w-0'>
							{!compact && (
								<p className='text-[10px] font-mono text-gray-500 truncate leading-tight'>
									{order.orderNumber}
								</p>
							)}
							{!compact && (
								<span className='text-gray-300 shrink-0 text-[10px]'>·</span>
							)}
							<span className='inline-flex items-center gap-0.5 text-[11px] text-gray-500 shrink-0 tabular-nums'>
								<Package className='h-3 w-3' />
								{order.items.length}
							</span>
						</div>
					</div>

					<div
						className='flex items-center gap-1 shrink-0'
						onClick={e => e.stopPropagation()}
					>
						{inlineStatus && onStatusChange ? (
							<StatusSelect
								value={order.status}
								onValueChange={onStatusChange}
								className={`h-8 w-[6.75rem] text-xs px-2 ${
									isUpdating ? 'opacity-50 pointer-events-none' : ''
								}`}
							/>
						) : (
							<span
								className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${getOrderStatusBadgeClass(
									order.status
								)}`}
							>
								{order.status}
							</span>
						)}

						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									type='button'
									variant='ghost'
									size='sm'
									className='h-8 w-8 p-0 shrink-0'
								>
									<MoreHorizontal className='h-4 w-4' />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align='end'>
								<DropdownMenuItem onClick={onView}>
									<Eye className='h-4 w-4 mr-2' />
									View
								</DropdownMenuItem>
								<DropdownMenuItem onClick={onPrint}>
									<Printer className='h-4 w-4 mr-2' />
									Print
								</DropdownMenuItem>
								{onAddNotes && (
									<DropdownMenuItem onClick={onAddNotes}>
										<Edit className='h-4 w-4 mr-2' />
										Admin notes
									</DropdownMenuItem>
								)}
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</div>
			</CardContent>
		</Card>
	)
}
