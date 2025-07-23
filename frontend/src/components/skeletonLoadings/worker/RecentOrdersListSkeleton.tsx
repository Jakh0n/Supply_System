import { Skeleton } from '@/components/ui/skeleton'

const RecentOrdersListSkeleton = () => {
	return (
		<div className='bg-white rounded-lg shadow-sm border'>
			{/* Header skeleton */}
			<div className='p-4 sm:p-6 border-b border-gray-200'>
				<div className='flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0'>
					<Skeleton className='h-6 w-32 bg-gray-300 rounded-md' />
					<Skeleton className='h-4 w-24 bg-gray-300 rounded-md' />
				</div>
			</div>

			{/* Orders list skeleton */}
			<div className='divide-y divide-gray-200'>
				{Array.from({ length: 5 }).map((_, index) => (
					<div key={index} className='p-4 sm:p-6'>
						<div className='flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0'>
							<div className='flex-1 space-y-2'>
								{/* Order ID and status */}
								<div className='flex items-center space-x-3'>
									<Skeleton className='h-4 w-20 bg-gray-300 rounded-md' />
									<Skeleton className='h-6 w-16 bg-gray-300 rounded-full' />
								</div>

								{/* Customer info */}
								<div className='flex items-center space-x-2'>
									<Skeleton className='h-4 w-4 bg-gray-300 rounded-full' />
									<Skeleton className='h-4 w-32 bg-gray-300 rounded-md' />
								</div>

								{/* Date and items */}
								<div className='flex items-center space-x-4'>
									<div className='flex items-center space-x-1'>
										<Skeleton className='h-3 w-3 bg-gray-300 rounded-full' />
										<Skeleton className='h-3 w-20 bg-gray-300 rounded-md' />
									</div>
									<div className='flex items-center space-x-1'>
										<Skeleton className='h-3 w-3 bg-gray-300 rounded-full' />
										<Skeleton className='h-3 w-16 bg-gray-300 rounded-md' />
									</div>
								</div>
							</div>

							{/* Action buttons */}
							<div className='flex items-center space-x-2'>
								<Skeleton className='h-8 w-16 bg-gray-300 rounded-md' />
								<Skeleton className='h-8 w-20 bg-gray-300 rounded-md' />
							</div>
						</div>
					</div>
				))}
			</div>

			{/* Pagination skeleton */}
			<div className='p-4 sm:p-6 border-t border-gray-200'>
				<div className='flex items-center justify-between'>
					<Skeleton className='h-4 w-32 bg-gray-300 rounded-md' />
					<div className='flex items-center space-x-2'>
						<Skeleton className='h-8 w-8 bg-gray-300 rounded-md' />
						<Skeleton className='h-8 w-8 bg-gray-300 rounded-md' />
						<Skeleton className='h-8 w-8 bg-gray-300 rounded-md' />
						<Skeleton className='h-8 w-8 bg-gray-300 rounded-md' />
					</div>
				</div>
			</div>
		</div>
	)
}

export default RecentOrdersListSkeleton
