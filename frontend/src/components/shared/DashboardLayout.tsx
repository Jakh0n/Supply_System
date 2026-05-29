'use client'

import React from 'react'
import Navbar from './Navbar'

interface DashboardLayoutProps {
	children: React.ReactNode
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
	return (
		<div className='min-h-screen bg-gray-50'>
			<Navbar />
			<main className='max-w-7xl mx-auto w-full px-3 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8'>
				{children}
			</main>
		</div>
	)
}

export default DashboardLayout
