import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { RegisterData } from '@/types'
import { Plus } from 'lucide-react'
import React from 'react'

interface UsersHeaderProps {
	isCreateDialogOpen: boolean
	setIsCreateDialogOpen: (open: boolean) => void
	formData: RegisterData
	setFormData: React.Dispatch<React.SetStateAction<RegisterData>>
	onCreateUser: (e: React.FormEvent) => void
	isSubmitting: boolean
	resetForm: () => void
	handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
	handleSelectChange: (name: string, value: string) => void
}

const UsersHeader: React.FC<UsersHeaderProps> = ({
	isCreateDialogOpen,
	setIsCreateDialogOpen,
	formData,
	onCreateUser,
	isSubmitting,
	resetForm,
	handleInputChange,
	handleSelectChange,
}) => {
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
			<Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
				<DialogTrigger asChild>
					<Button onClick={resetForm} className='w-full sm:w-auto'>
						<Plus className='h-4 w-4 mr-2' />
						Add User
					</Button>
				</DialogTrigger>
				<DialogContent className='sm:max-w-[425px] mx-4 max-h-[90vh] overflow-y-auto'>
					<DialogHeader>
						<DialogTitle className='text-lg sm:text-xl'>
							Create New User
						</DialogTitle>
						<DialogDescription>Add a new user to the system.</DialogDescription>
					</DialogHeader>
					<form onSubmit={onCreateUser} className='space-y-4'>
						<div>
							<Label htmlFor='username' className='text-sm font-medium'>
								Username
							</Label>
							<Input
								id='username'
								name='username'
								value={formData.username}
								onChange={handleInputChange}
								placeholder='Enter username'
								required
								className='mt-1'
							/>
						</div>
						<div>
							<Label htmlFor='password' className='text-sm font-medium'>
								Password
							</Label>
							<Input
								id='password'
								name='password'
								type='password'
								value={formData.password}
								onChange={handleInputChange}
								placeholder='Enter password'
								required
								className='mt-1'
							/>
						</div>
						<div>
							<Label htmlFor='position' className='text-sm font-medium'>
								Position
							</Label>
							<Select
								value={formData.position}
								onValueChange={value => handleSelectChange('position', value)}
							>
								<SelectTrigger className='mt-1'>
									<SelectValue placeholder='Select position' />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value='worker'>Worker</SelectItem>
									<SelectItem value='editor'>Editor</SelectItem>
									<SelectItem value='admin'>Admin</SelectItem>
								</SelectContent>
							</Select>
						</div>
						{formData.position === 'worker' && (
							<div>
								<Label htmlFor='branch' className='text-sm font-medium'>
									Branch
								</Label>
								<Input
									id='branch'
									name='branch'
									value={formData.branch}
									onChange={handleInputChange}
									placeholder='Enter branch name'
									required
									className='mt-1'
								/>
							</div>
						)}
						<div className='flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2'>
							<Button
								type='button'
								variant='outline'
								onClick={() => setIsCreateDialogOpen(false)}
								className='w-full sm:w-auto'
							>
								Cancel
							</Button>
							<Button
								type='submit'
								disabled={isSubmitting}
								className='w-full sm:w-auto'
							>
								{isSubmitting ? 'Creating...' : 'Create User'}
							</Button>
						</div>
					</form>
				</DialogContent>
			</Dialog>
		</div>
	)
}

export default UsersHeader
