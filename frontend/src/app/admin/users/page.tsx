'use client'

import AdminLayout from '@/components/shared/AdminLayout'
import ProtectedRoute from '@/components/shared/ProtectedRoute'
import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import {
	AlertCircle,
	CheckCircle,
	Edit,
	Eye,
	EyeOff,
	MoreHorizontal,
	Plus,
	Search,
	Shield,
	Trash2,
	User as UserIcon,
	Users,
	XCircle,
} from 'lucide-react'
import React, { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

// Helper function to format date
const formatDate = (dateString: string): string => {
	return new Date(dateString).toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
	})
}

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
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
	const [selectedUser, setSelectedUser] = useState<User | null>(null)
	const [isSubmitting, setIsSubmitting] = useState(false)

	// Form state
	const [formData, setFormData] = useState<RegisterData>({
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

	const handleCreateUser = async (e: React.FormEvent) => {
		e.preventDefault()
		if (isSubmitting) return

		try {
			setIsSubmitting(true)
			await usersApi.createUser(formData)
			await fetchUsers()
			setIsCreateDialogOpen(false)
			resetForm()
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

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target
		setFormData(prev => ({
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
				<div className='space-y-6'>
					{/* Header */}
					<div className='flex justify-between items-center'>
						<div>
							<h1 className='text-2xl font-bold text-gray-900'>
								User Management
							</h1>
							<p className='mt-2 text-gray-600'>
								Manage system users and their permissions
							</p>
						</div>
						<Dialog
							open={isCreateDialogOpen}
							onOpenChange={setIsCreateDialogOpen}
						>
							<DialogTrigger asChild>
								<Button onClick={resetForm}>
									<Plus className='h-4 w-4 mr-2' />
									Add User
								</Button>
							</DialogTrigger>
							<DialogContent className='sm:max-w-[425px]'>
								<DialogHeader>
									<DialogTitle>Create New User</DialogTitle>
									<DialogDescription>
										Add a new user to the system.
									</DialogDescription>
								</DialogHeader>
								<form onSubmit={handleCreateUser} className='space-y-4'>
									<div>
										<Label htmlFor='username'>Username</Label>
										<Input
											id='username'
											name='username'
											value={formData.username}
											onChange={handleInputChange}
											placeholder='Enter username'
											required
										/>
									</div>
									<div>
										<Label htmlFor='password'>Password</Label>
										<Input
											id='password'
											name='password'
											type='password'
											value={formData.password}
											onChange={handleInputChange}
											placeholder='Enter password'
											required
										/>
									</div>
									<div>
										<Label htmlFor='position'>Position</Label>
										<Select
											value={formData.position}
											onValueChange={value =>
												handleSelectChange('position', value)
											}
										>
											<SelectTrigger>
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
											<Label htmlFor='branch'>Branch</Label>
											<Input
												id='branch'
												name='branch'
												value={formData.branch}
												onChange={handleInputChange}
												placeholder='Enter branch name'
												required
											/>
										</div>
									)}
									<div className='flex justify-end space-x-2'>
										<Button
											type='button'
											variant='outline'
											onClick={() => setIsCreateDialogOpen(false)}
										>
											Cancel
										</Button>
										<Button type='submit' disabled={isSubmitting}>
											{isSubmitting ? 'Creating...' : 'Create User'}
										</Button>
									</div>
								</form>
							</DialogContent>
						</Dialog>
					</div>

					{/* Error message */}
					{error && (
						<div className='bg-red-50 border border-red-200 rounded-md p-4'>
							<div className='flex'>
								<AlertCircle className='h-5 w-5 text-red-400' />
								<div className='ml-3'>
									<p className='text-sm text-red-800'>{error}</p>
								</div>
							</div>
						</div>
					)}

					{/* Filters */}
					<Card>
						<CardHeader>
							<CardTitle>Filters</CardTitle>
						</CardHeader>
						<CardContent>
							<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
								<div>
									<Label htmlFor='search' className='pb-2'>
										Search Users
									</Label>
									<div className='relative'>
										<Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
										<Input
											id='search'
											placeholder='Search by username or branch'
											value={searchTerm}
											onChange={e => setSearchTerm(e.target.value)}
											className='pl-8'
										/>
									</div>
								</div>
								<div>
									<Label htmlFor='position-filter' className='pb-2'>
										Position
									</Label>
									<Select
										value={positionFilter}
										onValueChange={(value: 'admin' | 'worker' | 'all') =>
											setPositionFilter(value)
										}
									>
										<SelectTrigger>
											<SelectValue placeholder='All positions' />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value='all'>All Positions</SelectItem>
											<SelectItem value='admin'>Admin</SelectItem>
											<SelectItem value='editor'>Editor</SelectItem>
											<SelectItem value='worker'>Worker</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div>
									<Label htmlFor='status-filter' className='pb-2'>
										Status
									</Label>
									<Select
										value={statusFilter}
										onValueChange={(value: 'true' | 'false' | 'all') =>
											setStatusFilter(value)
										}
									>
										<SelectTrigger>
											<SelectValue placeholder='All statuses' />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value='all'>All Status</SelectItem>
											<SelectItem value='true'>Active Only</SelectItem>
											<SelectItem value='false'>Inactive Only</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Users Table */}
					<Card>
						<CardHeader>
							<CardTitle>Users ({users.length})</CardTitle>
							<CardDescription>
								Manage all system users and their access
							</CardDescription>
						</CardHeader>
						<CardContent>
							{users.length === 0 ? (
								<div className='text-center py-8'>
									<Users className='h-12 w-12 text-gray-400 mx-auto mb-4' />
									<p className='text-gray-500'>No users found</p>
									<p className='text-sm text-gray-400 mt-1'>
										{searchTerm ||
										positionFilter !== 'all' ||
										statusFilter !== 'all'
											? 'Try adjusting your filters'
											: 'No users have been created yet'}
									</p>
								</div>
							) : (
								<div className='overflow-x-auto'>
									<div className='max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100'>
										<table className='w-full'>
											<thead className='bg-gray-50 sticky top-0 z-10'>
												<tr className='border-b'>
													<th className='text-left py-3 px-4 font-medium bg-gray-50'>
														Username
													</th>
													<th className='text-left py-3 px-4 font-medium bg-gray-50'>
														Position
													</th>
													<th className='text-left py-3 px-4 font-medium bg-gray-50'>
														Status
													</th>
													<th className='text-left py-3 px-4 font-medium bg-gray-50'>
														Created
													</th>
													<th className='text-right py-3 px-4 font-medium bg-gray-50'>
														Actions
													</th>
												</tr>
											</thead>
											<tbody>
												{users.map((user, index) => (
													<tr
														key={user._id || user.id || `user-${index}`}
														className='border-b hover:bg-gray-50 transition-colors'
													>
														<td className='py-3 px-4'>
															<div className='flex items-center'>
																<div className='h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center mr-3'>
																	<UserIcon className='h-4 w-4 text-gray-600' />
																</div>
																<div>
																	<p className='font-medium'>{user.username}</p>
																</div>
															</div>
														</td>
														<td className='py-3 px-4'>
															<span
																className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
																	user.position === 'admin'
																		? 'bg-purple-100 text-purple-800'
																		: user.position === 'editor'
																		? 'bg-blue-100 text-blue-800'
																		: 'bg-blue-100 text-blue-800'
																}`}
															>
																{user.position === 'admin' ? (
																	<Shield className='h-3 w-3 mr-1' />
																) : user.position === 'editor' ? (
																	<Shield className='h-3 w-3 mr-1' />
																) : (
																	<UserIcon className='h-3 w-3 mr-1' />
																)}
																{user.position === 'admin'
																	? 'Admin'
																	: user.position === 'editor'
																	? 'Editor'
																	: 'Worker'}
															</span>
														</td>
														<td className='py-3 px-4'>
															<span
																className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
																	user.isActive
																		? 'bg-green-100 text-green-800'
																		: 'bg-red-100 text-red-800'
																}`}
															>
																{user.isActive ? (
																	<CheckCircle className='h-3 w-3 mr-1' />
																) : (
																	<XCircle className='h-3 w-3 mr-1' />
																)}
																{user.isActive ? 'Active' : 'Inactive'}
															</span>
														</td>
														<td className='py-3 px-4 text-sm text-gray-600'>
															{formatDate(user.createdAt)}
														</td>
														<td className='py-3 px-4 text-right'>
															<DropdownMenu>
																<DropdownMenuTrigger asChild>
																	<Button variant='ghost' size='sm'>
																		<MoreHorizontal className='h-4 w-4' />
																	</Button>
																</DropdownMenuTrigger>
																<DropdownMenuContent align='end'>
																	<DropdownMenuLabel>Actions</DropdownMenuLabel>
																	<DropdownMenuItem
																		onClick={() => openEditDialog(user)}
																	>
																		<Edit className='h-4 w-4 mr-2' />
																		Edit
																	</DropdownMenuItem>
																	<DropdownMenuItem
																		onClick={() => handleToggleStatus(user)}
																	>
																		{user.isActive ? (
																			<>
																				<EyeOff className='h-4 w-4 mr-2' />
																				Deactivate
																			</>
																		) : (
																			<>
																				<Eye className='h-4 w-4 mr-2' />
																				Activate
																			</>
																		)}
																	</DropdownMenuItem>
																	<DropdownMenuSeparator />
																	<DropdownMenuItem
																		onClick={() => handleDeleteUser(user)}
																		className='text-red-600'
																	>
																		<Trash2 className='h-4 w-4 mr-2' />
																		Delete
																	</DropdownMenuItem>
																</DropdownMenuContent>
															</DropdownMenu>
														</td>
													</tr>
												))}
											</tbody>
										</table>
									</div>
									{users.length > 10 && (
										<div className='text-center py-2 text-sm text-gray-500 bg-gray-50 border-t'>
											Showing {users.length} users - Scroll to see more
										</div>
									)}
								</div>
							)}
						</CardContent>
					</Card>

					{/* Edit Dialog */}
					<Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
						<DialogContent className='sm:max-w-[425px]'>
							<DialogHeader>
								<DialogTitle>Edit User</DialogTitle>
								<DialogDescription>
									Update user information and permissions.
								</DialogDescription>
							</DialogHeader>
							<form onSubmit={handleUpdateUser} className='space-y-4'>
								<div>
									<Label htmlFor='edit-username'>Username</Label>
									<Input
										id='edit-username'
										name='username'
										value={formData.username}
										onChange={handleInputChange}
										placeholder='Enter username'
										required
									/>
								</div>
								<div>
									<Label htmlFor='edit-password'>Password</Label>
									<Input
										id='edit-password'
										name='password'
										type='password'
										value={formData.password}
										onChange={handleInputChange}
										placeholder='Leave blank to keep current password'
									/>
									<p className='text-xs text-gray-500 mt-1'>
										Leave blank to keep current password
									</p>
								</div>
								<div>
									<Label htmlFor='edit-position'>Position</Label>
									<Select
										value={formData.position}
										onValueChange={value =>
											handleSelectChange('position', value)
										}
									>
										<SelectTrigger>
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
										<Label htmlFor='edit-branch'>Branch</Label>
										<Input
											id='edit-branch'
											name='branch'
											value={formData.branch}
											onChange={handleInputChange}
											placeholder='Enter branch name'
											required
										/>
									</div>
								)}
								<div className='flex justify-end space-x-2'>
									<Button
										type='button'
										variant='outline'
										onClick={() => setIsEditDialogOpen(false)}
									>
										Cancel
									</Button>
									<Button type='submit' disabled={isSubmitting}>
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
