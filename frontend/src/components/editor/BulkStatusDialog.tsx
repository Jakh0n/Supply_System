import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { OrderStatus } from '@/types'
import StatusSelect from './StatusSelect'
import { editorTouchSm } from './editorUi'

interface BulkStatusDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	orderCount: number
	status: OrderStatus
	onStatusChange: (status: OrderStatus) => void
	adminNotes: string
	onAdminNotesChange: (notes: string) => void
	onSubmit: () => void
	isSubmitting: boolean
}

export default function BulkStatusDialog({
	open,
	onOpenChange,
	orderCount,
	status,
	onStatusChange,
	adminNotes,
	onAdminNotesChange,
	onSubmit,
	isSubmitting,
}: BulkStatusDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className='w-[95vw] max-w-md mx-auto'>
				<DialogHeader>
					<DialogTitle className='text-lg'>Bulk Update Order Status</DialogTitle>
				</DialogHeader>
				<div className='space-y-4'>
					<div className='text-sm text-gray-600'>
						This will update all {orderCount} orders on the current page to
						the selected status.
					</div>
					<div>
						<Label htmlFor='bulkStatus' className='text-sm font-medium'>
							Status
						</Label>
						<StatusSelect
							value={status}
							onValueChange={onStatusChange}
							className={`mt-1 h-12 sm:h-10 text-base`}
						/>
					</div>
					<div>
						<Label htmlFor='bulkAdminNotes' className='text-sm font-medium'>
							Admin Notes (Optional)
						</Label>
						<textarea
							id='bulkAdminNotes'
							value={adminNotes}
							onChange={e => onAdminNotesChange(e.target.value)}
							placeholder='Add notes about this bulk update...'
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
							className={`${editorTouchSm} w-full sm:w-auto bg-blue-600 hover:bg-blue-700`}
						>
							{isSubmitting ? 'Updating...' : 'Update All Orders'}
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	)
}
