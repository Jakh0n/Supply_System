import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Order, OrderStatus } from '@/types'
import { useEffect, useState } from 'react'

interface OrderStatusDialogProps {
	isOpen: boolean
	onClose: () => void
	order: Order | null
	onUpdateStatus: (status: OrderStatus, notes: string) => Promise<void>
	isUpdating: boolean
}

const OrderStatusDialog: React.FC<OrderStatusDialogProps> = ({
	isOpen,
	onClose,
	order,
	onUpdateStatus,
	isUpdating,
}) => {
	const [newStatus, setNewStatus] = useState<OrderStatus>('pending')
	const [adminNotes, setAdminNotes] = useState('')

	useEffect(() => {
		if (order) {
			setNewStatus(order.status)
			setAdminNotes(order.adminNotes || '')
		}
	}, [order])

	const handleSubmit = async () => {
		await onUpdateStatus(newStatus, adminNotes)
	}

	const handleClose = () => {
		onClose()
		// Reset form when closing
		if (order) {
			setNewStatus(order.status)
			setAdminNotes(order.adminNotes || '')
		}
	}

	if (!order) return null

	return (
		<Dialog open={isOpen} onOpenChange={handleClose}>
			<DialogContent className='sm:max-w-[425px]'>
				<DialogHeader>
					<DialogTitle className='text-lg'>Update Order Status</DialogTitle>
					<DialogDescription>
						Update status for order {order.orderNumber}
					</DialogDescription>
				</DialogHeader>

				<div className='space-y-4 py-4'>
					<div className='space-y-2'>
						<Label htmlFor='status' className='text-sm font-medium'>
							Status
						</Label>
						<Select
							value={newStatus}
							onValueChange={(value: OrderStatus) => setNewStatus(value)}
						>
							<SelectTrigger>
								<SelectValue placeholder='Select status' />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='pending'>Pending</SelectItem>
								<SelectItem value='approved'>Approved</SelectItem>
								<SelectItem value='rejected'>Rejected</SelectItem>
								<SelectItem value='completed'>Completed</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className='space-y-2'>
						<Label htmlFor='admin-notes' className='text-sm font-medium'>
							Admin Notes
						</Label>
						<textarea
							id='admin-notes'
							value={adminNotes}
							onChange={e => setAdminNotes(e.target.value)}
							placeholder='Add notes about this status change...'
							rows={4}
							className='flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none'
						/>
					</div>
				</div>

				<div className='flex flex-col sm:flex-row justify-end gap-2'>
					<Button
						type='button'
						variant='outline'
						onClick={handleClose}
						className='w-full sm:w-auto'
						disabled={isUpdating}
					>
						Cancel
					</Button>
					<Button
						onClick={handleSubmit}
						disabled={isUpdating}
						className='w-full sm:w-auto'
					>
						{isUpdating ? 'Updating...' : 'Update Status'}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	)
}

export default OrderStatusDialog
