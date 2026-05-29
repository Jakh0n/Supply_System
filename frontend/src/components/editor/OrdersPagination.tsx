import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { editorTouchCompact } from './editorUi'

interface OrdersPaginationProps {
	currentPage: number
	totalPages: number
	totalCount: number
	loading?: boolean
	onPageChange: (page: number) => void
	itemLabel?: string
}

export default function OrdersPagination({
	currentPage,
	totalPages,
	totalCount,
	loading = false,
	onPageChange,
	itemLabel = 'orders',
}: OrdersPaginationProps) {
	if (totalCount === 0) return null

	return (
		<div className='flex items-center justify-between gap-2 pt-2 mt-2 sm:pt-4 sm:mt-4 border-t'>
			<Button
				variant='outline'
				disabled={currentPage <= 1 || loading}
				onClick={() => onPageChange(currentPage - 1)}
				className={`${editorTouchCompact} h-8 w-8 sm:w-auto sm:px-3 p-0 shrink-0`}
				aria-label='Previous page'
			>
				<ChevronLeft className='h-4 w-4 sm:mr-1' />
				<span className='hidden sm:inline'>Previous</span>
			</Button>

			<p className='text-xs sm:text-sm text-gray-600 text-center min-w-0 truncate px-1'>
				<span className='font-semibold text-gray-900 tabular-nums'>
					{currentPage}/{totalPages}
				</span>
				<span className='text-gray-400 mx-1'>·</span>
				<span className='tabular-nums'>{totalCount}</span>
				<span className='hidden sm:inline'> {itemLabel}</span>
			</p>

			<Button
				variant='outline'
				disabled={currentPage >= totalPages || loading}
				onClick={() => onPageChange(currentPage + 1)}
				className={`${editorTouchCompact} h-8 w-8 sm:w-auto sm:px-3 p-0 shrink-0`}
				aria-label='Next page'
			>
				<span className='hidden sm:inline'>Next</span>
				<ChevronRight className='h-4 w-4 sm:ml-1' />
			</Button>
		</div>
	)
}
