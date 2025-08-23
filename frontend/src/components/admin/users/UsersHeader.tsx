import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import React from 'react'

interface UsersHeaderProps {
	onAddUser: () => void
}

const UsersHeader: React.FC<UsersHeaderProps> = ({ onAddUser }) => {
	return (
		<div className='flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4'>
			<div className='flex-1'>
				<h1 className='text-xl sm:text-2xl font-bold text-gray-900'>
					User Management
				</h1>
				<p className='mt-1 sm:mt-2 text-sm sm:text-base text-gray-600'>
					Manage system users and their permissions
				</p>
			</div>
			<Button onClick={onAddUser} className='w-full sm:w-auto'>
				<Plus className='h-4 w-4 mr-2' />
				Add User
			</Button>
		</div>
	)
}

export default UsersHeader
