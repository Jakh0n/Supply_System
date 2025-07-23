import { Skeleton } from '@/components/ui/skeleton'

const QuickActionSkeleton = () => {
	return (
		<div className='grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6'>
			{/* Skeleton for Create New Order Card */}
			<div className='block'>
				<div className='cursor-pointer hover:shadow-lg transition-all duration-200 h-full border-l-4 border-l-green-500 hover:border-l-green-600'>
					<div className='p-4 sm:p-6'>
						<div className='flex items-center text-base sm:text-lg'>
							{/* Skeleton for the icon */}
							<Skeleton className='h-5 w-5 sm:h-6 sm:w-6 bg-gray-300 rounded-lg mr-3' />

							{/* Skeleton for the "Create New Order" title */}
							<Skeleton className='h-4 w-1/2 sm:w-2/3 bg-gray-300 rounded-md' />
						</div>

						{/* Skeleton for the description */}
						<Skeleton className='h-3 w-3/4 sm:w-1/2 bg-gray-300 rounded-md mt-2' />
					</div>
				</div>
			</div>

			{/* Skeleton for View My Orders Card */}
			<div className='block'>
				<div className='cursor-pointer hover:shadow-lg transition-all duration-200 h-full border-l-4 border-l-blue-500 hover:border-l-blue-600'>
					<div className='p-4 sm:p-6'>
						<div className='flex items-center text-base sm:text-lg'>
							{/* Skeleton for the icon */}
							<Skeleton className='h-5 w-5 sm:h-6 sm:w-6 bg-gray-300 rounded-lg mr-3' />

							{/* Skeleton for the "View My Orders" title */}
							<Skeleton className='h-4 w-1/2 sm:w-2/3 bg-gray-300 rounded-md' />
						</div>

						{/* Skeleton for the description */}
						<Skeleton className='h-3 w-3/4 sm:w-1/2 bg-gray-300 rounded-md mt-2' />
					</div>
				</div>
			</div>
		</div>
	)
}

export default QuickActionSkeleton
