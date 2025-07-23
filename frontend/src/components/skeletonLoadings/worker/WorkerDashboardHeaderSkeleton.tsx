import { Skeleton } from '@/components/ui/skeleton'

const WorkerDashboardHeaderSkeleton = () => {
	return (
		<div className='bg-white rounded-lg shadow-sm border p-4 sm:p-6'>
			<div className='flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0'>
				<div>
					{/* Skeleton for main title */}
					<Skeleton className='h-6 w-48 sm:w-56 bg-gray-300 rounded-md mb-2' />

					{/* Skeleton for welcome message */}
					<Skeleton className='h-4 w-32 sm:w-40 bg-gray-300 rounded-md' />
				</div>

				<div className='flex flex-col sm:items-end space-y-1'>
					{/* Skeleton for branch info */}
					<Skeleton className='h-4 w-24 sm:w-28 bg-gray-300 rounded-md' />

					{/* Skeleton for date */}
					<Skeleton className='h-3 w-20 sm:w-24 bg-gray-300 rounded-md' />
				</div>
			</div>
		</div>
	)
}

export default WorkerDashboardHeaderSkeleton
