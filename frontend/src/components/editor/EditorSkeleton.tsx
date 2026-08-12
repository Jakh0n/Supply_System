import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

const EditorSkeleton: React.FC = () => {
	return (
		<div className='animate-pulse'>
			<Card className='shadow-sm border-gray-200'>
				<CardHeader className='px-3 py-3 sm:px-6 sm:py-5 space-y-3 sm:space-y-4'>
					<div className='flex items-center justify-between gap-3'>
						<div className='flex items-center gap-2'>
							<Skeleton className='h-6 w-40' />
							<Skeleton className='h-5 w-8 rounded-md' />
						</div>
						<Skeleton className='h-9 w-36' />
					</div>

					<div className='flex gap-1.5 overflow-hidden'>
						{[...Array(5)].map((_, i) => (
							<Skeleton key={i} className='h-9 w-20 shrink-0 rounded-md' />
						))}
					</div>

					<div className='border-t border-gray-100 pt-3 sm:pt-4 space-y-3'>
						<div className='flex gap-1.5'>
							{[...Array(3)].map((_, i) => (
								<Skeleton key={i} className='h-9 w-20 shrink-0 rounded-md' />
							))}
						</div>
						<div className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
							<Skeleton className='h-10 w-full' />
							<Skeleton className='h-10 w-full' />
						</div>
					</div>
				</CardHeader>

				<CardContent className='px-3 sm:px-6 pt-0 pb-3 sm:pb-6 space-y-2'>
					{[...Array(5)].map((_, i) => (
						<Skeleton key={i} className='h-12 w-full rounded-lg' />
					))}
				</CardContent>
			</Card>
		</div>
	)
}

export default EditorSkeleton
