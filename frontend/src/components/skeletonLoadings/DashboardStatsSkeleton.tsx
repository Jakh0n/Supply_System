import { Card, CardContent, CardHeader } from '../ui/card'
import { Skeleton } from '../ui/skeleton'

const DashboardStatsSkeleton = () => {
	return (
		<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6'>
			{[...Array(4)].map((_, i) => (
				<Card key={i} className='animate-pulse'>
					<CardHeader className='pb-2'>
						<Skeleton className='h-4 bg-gray-200 rounded w-3/4'></Skeleton>
					</CardHeader>
					<CardContent>
						<Skeleton className='h-8 bg-gray-200 rounded w-1/2 mb-2'></Skeleton>
						<Skeleton className='h-3 bg-gray-200 rounded w-full'></Skeleton>
					</CardContent>
				</Card>
			))}
		</div>
	)
}

export default DashboardStatsSkeleton
