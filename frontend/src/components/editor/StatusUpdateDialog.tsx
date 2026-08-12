import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Order } from '@/types'
import { useTranslations } from 'next-intl'
import { editorTouchSm } from './editorUi'

interface StatusUpdateDialogProps {
	order: Order | null
	open: boolean
	onOpenChange: (open: boolean) => void
	adminNotes: string
	onAdminNotesChange: (notes: string) => void
	onSubmit: () => void
	isSubmitting: boolean
}

export default function StatusUpdateDialog({
	order,
	open,
	onOpenChange,
	adminNotes,
	onAdminNotesChange,
	onSubmit,
	isSubmitting,
}: StatusUpdateDialogProps) {
	const t = useTranslations('editor.dialogs')
	const to = useTranslations('editor.orders')
	const tc = useTranslations('common')

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className='w-[calc(100%-2rem)] max-w-md max-h-[90vh] overflow-y-auto'>
				<DialogHeader>
					<DialogTitle className='text-lg'>
						{to('adminNotes')} - {order?.orderNumber}
					</DialogTitle>
				</DialogHeader>
				<div className='space-y-4'>
					<div>
						<Label htmlFor='adminNotes' className='text-sm font-medium'>
							{t('adminNotesOptional')}
						</Label>
						<textarea
							id='adminNotes'
							value={adminNotes}
							onChange={e => onAdminNotesChange(e.target.value)}
							placeholder={t('adminNotesPlaceholder')}
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
							{tc('cancel')}
						</Button>
						<Button
							onClick={onSubmit}
							disabled={isSubmitting}
							className={`${editorTouchSm} w-full sm:w-auto`}
						>
							{isSubmitting ? t('savingNotes') : t('saveNotes')}
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	)
}
