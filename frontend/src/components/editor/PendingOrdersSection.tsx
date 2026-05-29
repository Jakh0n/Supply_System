'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Order } from '@/types'
import { AlertCircle, ArrowRight } from 'lucide-react'
import OrdersTable from './OrdersTable'
import { editorTouchSm } from './editorUi'

interface PendingOrdersSectionProps {
	orders: Order[]
	loading: boolean
	totalPending: number
	onViewOrder: (order: Order) => void
	onStatusChange: (order: Order, status: Order['status']) => void
	onPrintOrder: (order: Order) => void
	onViewAllPending: () => void
	updatingOrderId?: string | null
}

export default function PendingOrdersSection({
	orders,
	loading,
	totalPending,
	onViewOrder,
	onStatusChange,
	onPrintOrder,
	onViewAllPending,
	updatingOrderId,
}: PendingOrdersSectionProps) {
	if (!loading && totalPending === 0) {
		return null
	}

	return (
		<Card className='mb-6 border-amber-200 bg-amber-50/30'>
			<CardHeader className='pb-3'>
				<div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
					<CardTitle className='text-base sm:text-lg flex items-center gap-2 text-amber-900'>
						<AlertCircle className='h-5 w-5 text-amber-600' />
						Needs action
						{!loading && (
							<span className='text-sm font-normal text-amber-700'>
								({totalPending} pending)
							</span>
						)}
					</CardTitle>
					{totalPending > orders.length && (
						<Button
							variant='outline'
							className={`${editorTouchSm} w-full sm:w-auto border-amber-300 text-amber-800 hover:bg-amber-100`}
							onClick={onViewAllPending}
						>
							View all pending
							<ArrowRight className='h-4 w-4 ml-1' />
						</Button>
					)}
				</div>
				<p className='text-sm text-amber-800/80'>
					Review and update these orders first.
				</p>
			</CardHeader>
			<CardContent className='pt-0'>
				<OrdersTable
					orders={orders}
					loading={loading}
					compact
					inlineStatus
					updatingOrderId={updatingOrderId}
					onViewOrder={onViewOrder}
					onStatusChange={onStatusChange}
					onPrintOrder={onPrintOrder}
				/>
			</CardContent>
		</Card>
	)
}
