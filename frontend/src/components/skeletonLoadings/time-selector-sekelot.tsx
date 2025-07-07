import { Card, CardContent, CardHeader } from '../ui/card'

const TimeSelectorSkeleton = () => {
	return (
		<div>
			<Card>
				<CardHeader>
					<div className='h-6 bg-gray-200 rounded w-1/3 animate-pulse'></div>
				</CardHeader>
				<CardContent>
					<div className='grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6'>
						{[...Array(2)].map((_, i) => (
							<div
								key={i}
								className='border rounded-lg p-4 sm:p-6 animate-pulse'
							>
								<div className='h-5 bg-gray-200 rounded w-1/2 mb-4'></div>
								<div className='grid grid-cols-2 gap-3 sm:gap-4 mb-4'>
									{[...Array(4)].map((_, j) => (
										<div key={j}>
											<div className='h-3 bg-gray-200 rounded w-3/4 mb-1'></div>
											<div className='h-5 bg-gray-200 rounded w-1/2'></div>
										</div>
									))}
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	)
}

export default TimeSelectorSkeleton
