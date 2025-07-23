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
			<div className='min-w-0 flex-1'>
				<h1 className='text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900'>
					Worker Dashboard
				</h1>
				<p className='mt-1 sm:mt-2 text-sm sm:text-base text-gray-600'>
					Welcome back, {username}!{branch && ` Managing orders for ${branch}`}
				</p>
			</div>
		</div>
	)
}

export default WorkerDashboardHeader
