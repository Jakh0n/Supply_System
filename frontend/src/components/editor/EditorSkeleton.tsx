import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

const EditorSkeleton: React.FC = () => {
	return (
		<div className='space-y-4 sm:space-y-6 p-4 sm:p-6 lg:p-8 animate-pulse'>
			{/* Stats Cards Skeleton */}
			<div className='grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8'>
				{[...Array(4)].map((_, i) => (
					<Card key={i}>
						<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
							<Skeleton className='h-3 sm:h-4 w-16 sm:w-20' />
							<Skeleton className='h-3 w-3 sm:h-4 sm:w-4 rounded' />
						</CardHeader>
						<CardContent className='pt-0'>
							<Skeleton className='h-6 sm:h-8 w-8 sm:w-12' />
						</CardContent>
					</Card>
				))}
			</div>

			{/* Orders Card Skeleton */}
			<Card>
				<CardHeader className='pb-4'>
					<Skeleton className='h-5 sm:h-6 w-32 sm:w-40 mb-4' />

					{/* Filters Skeleton */}
					<div className='space-y-4'>
						<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3'>
							<Skeleton className='h-9 w-full' />
							<Skeleton className='h-9 w-full' />
							<Skeleton className='h-9 w-full' />
						</div>
						<div className='flex flex-col sm:flex-row gap-2 sm:gap-3'>
							<Skeleton className='h-8 w-full sm:w-24' />
							<Skeleton className='h-8 w-full sm:w-24' />
						</div>
					</div>
				</CardHeader>

				<CardContent className='pt-0'>
					{/* Desktop Table Skeleton */}
					<div className='hidden lg:block overflow-x-auto'>
						<div className='w-full'>
							{/* Table Header */}
							<div className='grid grid-cols-7 gap-4 py-3 px-4 bg-gray-50 border-b'>
								{[...Array(7)].map((_, i) => (
									<Skeleton key={i} className='h-4 w-full' />
								))}
							</div>

							{/* Table Rows */}
							{[...Array(5)].map((_, rowIndex) => (
								<div
									key={rowIndex}
									className='grid grid-cols-7 gap-4 py-3 px-4 border-b'
								>
									<Skeleton className='h-4 w-full' />
									<Skeleton className='h-4 w-full' />
									<Skeleton className='h-4 w-full' />
									<Skeleton className='h-4 w-full' />
									<Skeleton className='h-6 w-16 rounded-full' />
									<Skeleton className='h-4 w-full' />
									<div className='flex gap-1'>
										<Skeleton className='h-7 w-12' />
										<Skeleton className='h-7 w-12' />
										<Skeleton className='h-7 w-7' />
									</div>
								</div>
							))}
						</div>
					</div>

					{/* Mobile Cards Skeleton */}
					<div className='lg:hidden space-y-3'>
						{[...Array(3)].map((_, i) => (
							<Card key={i}>
								<CardContent className='p-4'>
									<div className='flex items-start justify-between mb-3'>
										<div className='flex-1 min-w-0'>
											<Skeleton className='h-4 w-24 mb-1' />
											<Skeleton className='h-3 w-20' />
										</div>
										<Skeleton className='h-8 w-8 rounded' />
									</div>

									<div className='grid grid-cols-2 gap-3 mb-3'>
										<div>
											<Skeleton className='h-3 w-10 mb-1' />
											<Skeleton className='h-4 w-16' />
										</div>
										<div>
											<Skeleton className='h-3 w-10 mb-1' />
											<Skeleton className='h-5 w-14 rounded-full' />
										</div>
									</div>

									<div className='grid grid-cols-2 gap-3'>
										<Skeleton className='h-4 w-20' />
										<Skeleton className='h-4 w-18' />
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	)
}

export default EditorSkeleton
