import React from 'react'

interface WorkerDashboardHeaderProps {
	username?: string
	branch?: string
}

const WorkerDashboardHeader: React.FC<WorkerDashboardHeaderProps> = ({
	username,
	branch,
}) => {
	return (
		<div className='flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4'>
			<div className='min-w-0 flex-1 text-center sm:text-left'>
				<h1 className='text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-blue-600 bg-clip-text text-transparent'>
					Worker Dashboard
				</h1>
				<p className='mt-2 sm:mt-3 text-sm sm:text-lg text-gray-600 leading-relaxed'>
					Welcome back,{' '}
					<span className='font-semibold text-blue-600'>{username}</span>!
					{branch && (
						<span className='block sm:inline sm:ml-1'>
							Managing orders for{' '}
							<span className='font-medium text-gray-800'>{branch}</span>
						</span>
					)}
				</p>
			</div>
		</div>
	)
}

export default WorkerDashboardHeader
