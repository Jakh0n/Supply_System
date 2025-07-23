import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import React from 'react'

interface PaginationProps {
	currentPage: number
	totalPages: number
	totalItems: number
	onPageChange: (page: number) => void
	loading?: boolean
	itemName?: string
}

const Pagination: React.FC<PaginationProps> = ({
	currentPage,
	totalPages,
	totalItems,
	onPageChange,
	loading = false,
	itemName = 'items',
}) => {
	if (totalPages <= 1) return null

	return (
		<div className='flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-200'>
			<div className='text-xs sm:text-sm text-gray-500 text-center sm:text-left'>
				Showing page {currentPage} of {totalPages} ({totalItems} total{' '}
				{itemName})
			</div>
			<div className='flex items-center space-x-2'>
				<Button
					variant='outline'
					size='sm'
					disabled={currentPage === 1 || loading}
					onClick={() => onPageChange(currentPage - 1)}
					className='flex items-center gap-1'
				>
					<ChevronLeft className='h-4 w-4' />
					Previous
				</Button>

				{/* Page numbers for larger screens */}
				<div className='hidden sm:flex items-center space-x-1'>
					{Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
						const pageNum = i + 1
						const isActive = pageNum === currentPage
						return (
							<Button
								key={pageNum}
								variant={isActive ? 'default' : 'outline'}
								size='sm'
								onClick={() => onPageChange(pageNum)}
								className='w-8 h-8 p-0'
								disabled={loading}
							>
								{pageNum}
							</Button>
						)
					})}
					{totalPages > 5 && (
						<>
							<span className='text-gray-400'>...</span>
							<Button
								variant={currentPage === totalPages ? 'default' : 'outline'}
								size='sm'
								onClick={() => onPageChange(totalPages)}
								className='w-8 h-8 p-0'
								disabled={loading}
							>
								{totalPages}
							</Button>
						</>
					)}
				</div>

				<Button
					variant='outline'
					size='sm'
					disabled={currentPage === totalPages || loading}
					onClick={() => onPageChange(currentPage + 1)}
					className='flex items-center gap-1'
				>
					Next
					<ChevronRight className='h-4 w-4' />
				</Button>
			</div>
		</div>
	)
}

export default Pagination
