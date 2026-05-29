'use client'

import UsersFilters from '@/components/admin/users/UsersFilters'
import UsersHeader from '@/components/admin/users/UsersHeader'
import UsersTable from '@/components/admin/users/UsersTable'
import AdminLayout from '@/components/shared/AdminLayout'
import ProtectedRoute from '@/components/shared/ProtectedRoute'
import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
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
import { usersApi } from '@/lib/api'
import { RegisterData, User } from '@/types'
import { AlertCircle } from 'lucide-react'
import React, { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

const UsersManagement = () => {
	const [users, setUsers] = useState<User[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')
	const [searchTerm, setSearchTerm] = useState('')
	const [positionFilter, setPositionFilter] = useState<
		'admin' | 'worker' | 'all'
	>('all')
	const [statusFilter, setStatusFilter] = useState<'true' | 'false' | 'all'>(
		'all'
	)
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
	const [selectedUser, setSelectedUser] = useState<User | null>(null)
	const [isSubmitting, setIsSubmitting] = useState(false)

	// Form state for editing users
	const [formData, setFormData] = useState<RegisterData>({
		username: '',
		password: '',
		position: 'worker',
		branch: '',
	})

	// Form state for creating users
	const [createFormData, setCreateFormData] = useState<RegisterData>({
		username: '',
		password: '',
		position: 'worker',
		branch: '',
	})

	// Fetch users
	const fetchUsers = useCallback(async () => {
		try {
			setLoading(true)
			const response = await usersApi.getUsers({
				position: positionFilter !== 'all' ? positionFilter : undefined,
				active: statusFilter !== 'all' ? statusFilter : undefined,
				search: searchTerm || undefined,
			})
			setUsers(response.users)
		} catch (err) {
			setError('Failed to load users')
			console.error('Users fetch error:', err)
		} finally {
			setLoading(false)
		}
	}, [searchTerm, positionFilter, statusFilter])

	useEffect(() => {
		fetchUsers()
	}, [fetchUsers])

	const resetForm = () => {
		setFormData({
			username: '',
			password: '',
			position: 'worker',
			branch: '',
		})
		setSelectedUser(null)
	}

	const resetCreateForm = () => {
		setCreateFormData({
			username: '',
			password: '',
			position: 'worker',
			branch: '',
		})
	}

	const handleCreateUser = async (e: React.FormEvent) => {
		e.preventDefault()
		if (isSubmitting) return

		try {
			setIsSubmitting(true)
			const createData: RegisterData = {
				username: createFormData.username,
				password: createFormData.password,
				position: createFormData.position,
			}

			// Include branch for workers
			if (createFormData.position === 'worker') {
				createData.branch = createFormData.branch
			}

			await usersApi.createUser(createData)
			await fetchUsers()
			setIsCreateDialogOpen(false)
			resetCreateForm()
			toast.success('User created successfully')
		} catch (err: unknown) {
			const error = err as { response?: { data?: { message?: string } } }
			toast.error(error.response?.data?.message || 'Failed to create user')
		} finally {
			setIsSubmitting(false)
		}
	}

	const handleUpdateUser = async (e: React.FormEvent) => {
		e.preventDefault()
		if (isSubmitting || !selectedUser) return

		try {
			setIsSubmitting(true)
			const updateData: Partial<RegisterData> = {
				username: formData.username,
				position: formData.position,
			}

			// Only include password if it's not empty
			if (formData.password) {
				updateData.password = formData.password
			}

			// Include branch for workers
			if (formData.position === 'worker') {
				updateData.branch = formData.branch
			}

			const userId = selectedUser._id || selectedUser.id
			await usersApi.updateUser(userId!, updateData)
			await fetchUsers()
			setIsEditDialogOpen(false)
			resetForm()
			toast.success('User updated successfully')
		} catch (err: unknown) {
			const error = err as { response?: { data?: { message?: string } } }
			toast.error(error.response?.data?.message || 'Failed to update user')
		} finally {
			setIsSubmitting(false)
		}
	}

	const handleToggleStatus = async (user: User) => {
		try {
			const userId = user._id || user.id
			await usersApi.toggleUserStatus(userId!)
			await fetchUsers()
			toast.success(
				`User ${user.isActive ? 'deactivated' : 'activated'} successfully`
			)
		} catch (err: unknown) {
			const error = err as { response?: { data?: { message?: string } } }
			toast.error(
				error.response?.data?.message || 'Failed to update user status'
			)
		}
	}

	const handleDeleteUser = async (user: User) => {
		if (!confirm(`Are you sure you want to delete user "${user.username}"?`)) {
			return
		}

		try {
			const userId = user._id || user.id
			await usersApi.deleteUser(userId!)
			await fetchUsers()
			toast.success('User deleted successfully')
		} catch (err: unknown) {
			const error = err as { response?: { data?: { message?: string } } }
			toast.error(error.response?.data?.message || 'Failed to delete user')
		}
	}

	const openEditDialog = (user: User) => {
		setSelectedUser(user)
		setFormData({
			username: user.username,
			password: '', // Don't populate password for security
			position: user.position,
			branch: user.branch || '',
		})
		setIsEditDialogOpen(true)
	}

	const openCreateDialog = () => {
		resetCreateForm()
		setIsCreateDialogOpen(true)
	}

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target
		setFormData(prev => ({
			...prev,
			[name]: value,
		}))
	}

	const handleCreateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target
		setCreateFormData(prev => ({
			...prev,
			[name]: value,
		}))
	}

	const handleSelectChange = (name: string, value: string) => {
		setFormData(prev => ({
			...prev,
			[name]: value,
		}))

		// Clear branch if position is admin
		if (name === 'position' && value === 'admin') {
			setFormData(prev => ({
				...prev,
				branch: '',
			}))
		}
	}

	const handleCreateSelectChange = (name: string, value: string) => {
		setCreateFormData(prev => ({
			...prev,
			[name]: value,
		}))

		// Clear branch if position is admin
		if (name === 'position' && value === 'admin') {
			setCreateFormData(prev => ({
				...prev,
				branch: '',
			}))
		}
	}

	if (loading && users.length === 0) {
		return (
			<ProtectedRoute requiredRole='admin'>
				<AdminLayout>
					<div className='flex items-center justify-center h-64'>
						<div className='text-center'>
							<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto'></div>
							<p className='mt-4 text-gray-600'>Loading users...</p>
						</div>
					</div>
				</AdminLayout>
			</ProtectedRoute>
		)
	}

	return (
		<ProtectedRoute requiredRole='admin'>
			<AdminLayout>
				<div className='space-y-4 sm:space-y-6 p-4 sm:p-6'>
					{/* Header */}
					<UsersHeader onAddUser={openCreateDialog} />

					{/* Error message */}
					{error && (
						<div className='bg-red-50 border border-red-200 rounded-md p-4'>
							<div className='flex'>
								<AlertCircle className='h-5 w-5 text-red-400 flex-shrink-0' />
								<div className='ml-3'>
									<p className='text-sm text-red-800'>{error}</p>
								</div>
							</div>
						</div>
					)}

					{/* Filters */}
					<UsersFilters
						searchTerm={searchTerm}
						positionFilter={positionFilter}
						statusFilter={statusFilter}
						onSearchChange={setSearchTerm}
						onPositionChange={setPositionFilter}
						onStatusChange={setStatusFilter}
					/>

					{/* Users Table */}
					<UsersTable
						users={users}
						searchTerm={searchTerm}
						positionFilter={positionFilter}
						statusFilter={statusFilter}
						onEditUser={openEditDialog}
						onToggleStatus={handleToggleStatus}
						onDeleteUser={handleDeleteUser}
					/>

					{/* Create User Dialog */}
					<Dialog
						open={isCreateDialogOpen}
						onOpenChange={setIsCreateDialogOpen}
					>
						<DialogContent className='sm:max-w-[425px] mx-4 max-h-[90vh] overflow-y-auto'>
							<DialogHeader>
								<DialogTitle className='text-lg sm:text-xl'>
									Create New User
								</DialogTitle>
								<DialogDescription>
									Add a new user to the system with appropriate permissions.
								</DialogDescription>
							</DialogHeader>
							<form onSubmit={handleCreateUser} className='space-y-4'>
								<div>
									<Label
										htmlFor='create-username'
										className='text-sm font-medium'
									>
										Username
									</Label>
									<Input
										id='create-username'
										name='username'
										value={createFormData.username}
										onChange={handleCreateInputChange}
										placeholder='Enter username'
										required
										className='mt-1'
									/>
								</div>
								<div>
									<Label
										htmlFor='create-password'
										className='text-sm font-medium'
									>
										Password
									</Label>
									<Input
										id='create-password'
										name='password'
										type='password'
										value={createFormData.password}
										onChange={handleCreateInputChange}
										placeholder='Enter password'
										required
										className='mt-1'
									/>
								</div>
								<div>
									<Label
										htmlFor='create-position'
										className='text-sm font-medium'
									>
										Position
									</Label>
									<Select
										value={createFormData.position}
										onValueChange={value =>
											handleCreateSelectChange('position', value)
										}
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

								{createFormData.position === 'worker' && (
									<div>
										<Label
											htmlFor='create-branch'
											className='text-sm font-medium'
										>
											Branch
										</Label>
										<Input
											id='create-branch'
											name='branch'
											value={createFormData.branch || ''}
											onChange={handleCreateInputChange}
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

					{/* Edit Dialog */}
					<Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
						<DialogContent className='sm:max-w-[425px] mx-4 max-h-[90vh] overflow-y-auto'>
							<DialogHeader>
								<DialogTitle className='text-lg sm:text-xl'>
									Edit User
								</DialogTitle>
								<DialogDescription>
									Update user information and permissions.
								</DialogDescription>
							</DialogHeader>
							<form onSubmit={handleUpdateUser} className='space-y-4'>
								<div>
									<Label
										htmlFor='edit-username'
										className='text-sm font-medium'
									>
										Username
									</Label>
									<Input
										id='edit-username'
										name='username'
										value={formData.username}
										onChange={handleInputChange}
										placeholder='Enter username'
										required
										className='mt-1'
									/>
								</div>
								<div>
									<Label
										htmlFor='edit-password'
										className='text-sm font-medium'
									>
										Password
									</Label>
									<Input
										id='edit-password'
										name='password'
										type='password'
										value={formData.password}
										onChange={handleInputChange}
										placeholder='Leave blank to keep current password'
										className='mt-1'
									/>
									<p className='text-xs text-gray-500 mt-1'>
										Leave blank to keep current password
									</p>
								</div>
								<div>
									<Label
										htmlFor='edit-position'
										className='text-sm font-medium'
									>
										Position
									</Label>
									<Select
										value={formData.position}
										onValueChange={value =>
											handleSelectChange('position', value)
										}
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
										<Label
											htmlFor='edit-branch'
											className='text-sm font-medium'
										>
											Branch
										</Label>
										<Input
											id='edit-branch'
											name='branch'
											value={formData.branch || ''}
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
										onClick={() => setIsEditDialogOpen(false)}
										className='w-full sm:w-auto'
									>
										Cancel
									</Button>
									<Button
										type='submit'
										disabled={isSubmitting}
										className='w-full sm:w-auto'
									>
										{isSubmitting ? 'Updating...' : 'Update User'}
									</Button>
								</div>
							</form>
						</DialogContent>
					</Dialog>
				</div>
			</AdminLayout>
		</ProtectedRoute>
	)
}

export default UsersManagement
