import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Order, OrderStatus } from '@/types'
import StatusSelect from './StatusSelect'
import { editorTouchSm } from './editorUi'

interface StatusUpdateDialogProps {
	order: Order | null
	open: boolean
	onOpenChange: (open: boolean) => void
	status: OrderStatus
	onStatusChange: (status: OrderStatus) => void
	adminNotes: string
	onAdminNotesChange: (notes: string) => void
	onSubmit: () => void
	isSubmitting: boolean
}

export default function StatusUpdateDialog({
	order,
	open,
	onOpenChange,
	status,
	onStatusChange,
	adminNotes,
	onAdminNotesChange,
	onSubmit,
	isSubmitting,
}: StatusUpdateDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className='w-[calc(100%-2rem)] max-w-md max-h-[90vh] overflow-y-auto'>
				<DialogHeader>
					<DialogTitle className='text-lg'>
						Update Order Status - {order?.orderNumber}
					</DialogTitle>
				</DialogHeader>
				<div className='space-y-4'>
					<div>
						<Label htmlFor='status' className='text-sm font-medium'>
							Status
						</Label>
						<StatusSelect
							value={status}
							onValueChange={onStatusChange}
							className='mt-1 h-12 sm:h-10 text-base'
						/>
					</div>
					<div>
						<Label htmlFor='adminNotes' className='text-sm font-medium'>
							Admin Notes (Optional)
						</Label>
						<textarea
							id='adminNotes'
							value={adminNotes}
							onChange={e => onAdminNotesChange(e.target.value)}
							placeholder='Add notes about this status update...'
							className='w-full p-2 border rounded-md min-h-[80px] resize-none mt-1 text-sm'
						/>
					</div>
					<div className='flex flex-col sm:flex-row justify-end gap-2'>
						<Button
							variant='outline'
							onClick={() => onOpenChange(false)}
							disabled={isSubmitting}
							className={`${editorTouchSm} w-full sm:w-auto`}
						>
							Cancel
						</Button>
						<Button
							onClick={onSubmit}
							disabled={isSubmitting}
							className={`${editorTouchSm} w-full sm:w-auto`}
						>
							{isSubmitting ? 'Updating...' : 'Update Status'}
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	)
}
