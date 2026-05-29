'use client'

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { CheckCheck } from 'lucide-react'
import { useState } from 'react'
import { editorTouchCompact, editorTouchSm } from './editorUi'

export type MarkAllScope = 'all' | 'filtered'

interface MarkAllCompletedDialogProps {
	loading?: boolean
	hasDateOrBranchFilter?: boolean
	onConfirm: (scope: MarkAllScope, includeDrinkOrders: boolean) => void
}

export default function MarkAllCompletedDialog({
	loading = false,
	hasDateOrBranchFilter = false,
	onConfirm,
}: MarkAllCompletedDialogProps) {
	const [scope, setScope] = useState<MarkAllScope>(
		hasDateOrBranchFilter ? 'filtered' : 'all'
	)
	const [includeDrinkOrders, setIncludeDrinkOrders] = useState(true)
	const [open, setOpen] = useState(false)

	const handleConfirm = () => {
		onConfirm(scope, includeDrinkOrders)
		setOpen(false)
	}

	return (
		<AlertDialog open={open} onOpenChange={setOpen}>
			<AlertDialogTrigger asChild>
				<Button
					variant='outline'
					disabled={loading}
					className={`${editorTouchCompact} border-green-300 text-green-800 hover:bg-green-50 w-full sm:w-auto`}
				>
					<CheckCheck className='h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 shrink-0' />
					<span className='truncate sm:hidden'>Mark all</span>
					<span className='truncate hidden sm:inline'>Mark all completed</span>
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent className='w-[calc(100%-2rem)] max-w-lg max-h-[90vh] overflow-y-auto'>
				<AlertDialogHeader>
					<AlertDialogTitle>Mark all orders as completed?</AlertDialogTitle>
					<AlertDialogDescription asChild>
						<div className='space-y-4 text-sm text-muted-foreground'>
							<p>
								This updates order status in the database. This action cannot
								be undone easily.
							</p>

							<div className='space-y-2'>
								<Label className='text-foreground font-medium'>Scope</Label>
								<div className='flex flex-col gap-2'>
									<label className='flex items-center gap-2 cursor-pointer'>
										<input
											type='radio'
											name='mark-all-scope'
											checked={scope === 'all'}
											onChange={() => setScope('all')}
											className='accent-blue-600'
										/>
										<span>All orders in the system</span>
									</label>
									<label
										className={`flex items-center gap-2 ${
											hasDateOrBranchFilter
												? 'cursor-pointer'
												: 'cursor-not-allowed opacity-50'
										}`}
									>
										<input
											type='radio'
											name='mark-all-scope'
											checked={scope === 'filtered'}
											disabled={!hasDateOrBranchFilter}
											onChange={() => setScope('filtered')}
											className='accent-blue-600'
										/>
										<span>
											Only orders matching current date/branch filters
										</span>
									</label>
								</div>
							</div>

							<label className='flex items-center gap-2 cursor-pointer'>
								<input
									type='checkbox'
									checked={includeDrinkOrders}
									onChange={e => setIncludeDrinkOrders(e.target.checked)}
									className='accent-blue-600 rounded'
								/>
								<span>Also mark drink orders as completed</span>
							</label>
						</div>
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter className='flex-col-reverse sm:flex-row gap-2'>
					<AlertDialogCancel className={editorTouchSm}>Cancel</AlertDialogCancel>
					<AlertDialogAction
						onClick={handleConfirm}
						className={`${editorTouchSm} bg-green-600 hover:bg-green-700 w-full sm:w-auto`}
					>
						{loading ? 'Updating...' : 'Yes, mark completed'}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	)
}
