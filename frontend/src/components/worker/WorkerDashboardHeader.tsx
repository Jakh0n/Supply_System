import React from 'react'

interface WorkerDashboardHeaderProps {
	username?: string
}

const WorkerDashboardHeader: React.FC<WorkerDashboardHeaderProps> = ({
	username,
}) => {
	return (
		<div className='flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4'>
			<div className='min-w-0 flex-1'>
				<h1 className='text-xl sm:text-2xl md:text-[1.65rem] lg:text-3xl xl:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-blue-600 bg-clip-text text-transparent'>
					Worker Dashboard
				</h1>
				<p className='mt-1.5 sm:mt-2 md:mt-2 lg:mt-3 text-sm sm:text-base md:text-[0.9375rem] lg:text-lg text-gray-600 leading-relaxed'>
					Welcome back,{' '}
					<span className='font-semibold text-blue-600'>{username}</span>!
				</p>
			</div>
		</div>
	)
}

export default WorkerDashboardHeader
