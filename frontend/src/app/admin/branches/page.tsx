'use client'

import DashboardLayout from '@/components/shared/DashboardLayout'
import ProtectedRoute from '@/components/shared/ProtectedRoute'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import { branchesApi } from '@/lib/api'
import { Branch, BranchDetails, BranchFormData } from '@/types'
import {
	Building2,
	Clock,
	Edit,
	Eye,
	Plus,
	ShoppingCart,
	Trash2,
	Users,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

const BranchesManagement: React.FC = () => {
	const [branches, setBranches] = useState<Branch[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
	const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
	const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null)
	const [branchDetails, setBranchDetails] = useState<BranchDetails | null>(null)
	const [formData, setFormData] = useState<BranchFormData>({ name: '' })
	const [isSubmitting, setIsSubmitting] = useState(false)

	// Fetch branches
	const fetchBranches = useCallback(async () => {
		try {
			setLoading(true)
			const response = await branchesApi.getBranches()
			setBranches(response.branches)
		} catch (err) {
			setError('Failed to load branches')
			console.error('Branches fetch error:', err)
		} finally {
			setLoading(false)
		}
	}, [])

	// Fetch branch details
	const fetchBranchDetails = useCallback(async (branchName: string) => {
		try {
			const response = await branchesApi.getBranch(branchName)
			setBranchDetails(response.branch)
		} catch (err) {
			console.error('Branch details fetch error:', err)
		}
	}, [])

	useEffect(() => {
		fetchBranches()
	}, [fetchBranches])

	// Handle form input changes
	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target
		setFormData(prev => ({ ...prev, [name]: value }))
	}

	// Handle create branch
	const handleCreateBranch = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!formData.name.trim()) return

		setIsSubmitting(true)
		try {
			await branchesApi.createBranch({ name: formData.name.trim() })
			await fetchBranches()
			setIsCreateDialogOpen(false)
			setFormData({ name: '' })
		} catch (err) {
			console.error('Create branch error:', err)
			setError('Failed to create branch')
		} finally {
			setIsSubmitting(false)
		}
	}

	// Handle edit branch
	const handleEditBranch = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!selectedBranch || !formData.name.trim()) return

		setIsSubmitting(true)
		try {
			await branchesApi.updateBranch(selectedBranch.name, {
				name: formData.name.trim(),
			})
			await fetchBranches()
			setIsEditDialogOpen(false)
			setSelectedBranch(null)
			setFormData({ name: '' })
		} catch (err) {
			console.error('Update branch error:', err)
			setError('Failed to update branch')
		} finally {
			setIsSubmitting(false)
		}
	}

	// Handle delete branch
	const handleDeleteBranch = async () => {
		if (!selectedBranch) return

		setIsSubmitting(true)
		try {
			await branchesApi.deleteBranch(selectedBranch.name)
			await fetchBranches()
			setIsDeleteDialogOpen(false)
			setSelectedBranch(null)
		} catch (err) {
			console.error('Delete branch error:', err)
			setError('Failed to delete branch')
		} finally {
			setIsSubmitting(false)
		}
	}

	// Open edit dialog
	const openEditDialog = (branch: Branch) => {
		setSelectedBranch(branch)
		setFormData({ name: branch.name })
		setIsEditDialogOpen(true)
	}

	// Open delete dialog
	const openDeleteDialog = (branch: Branch) => {
		setSelectedBranch(branch)
		setIsDeleteDialogOpen(true)
	}

	// Open details dialog
	const openDetailsDialog = async (branch: Branch) => {
		setSelectedBranch(branch)
		setIsDetailsDialogOpen(true)
		await fetchBranchDetails(branch.name)
	}

	if (loading) {
		return (
			<ProtectedRoute requiredRole='admin'>
				<DashboardLayout>
					<div className='min-h-screen flex items-center justify-center'>
						<div className='text-center'>
							<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto'></div>
							<p className='mt-2 text-gray-600'>Loading branches...</p>
						</div>
					</div>
				</DashboardLayout>
			</ProtectedRoute>
		)
	}

	return (
		<ProtectedRoute requiredRole='admin'>
			<DashboardLayout>
				<div className='space-y-6'>
					<div className='flex justify-between items-center'>
						<div>
							<h1 className='text-3xl font-bold text-gray-900'>
								Branch Management
							</h1>
							<p className='mt-2 text-gray-600'>
								Manage branch locations and their information
							</p>
						</div>
						<Dialog
							open={isCreateDialogOpen}
							onOpenChange={setIsCreateDialogOpen}
						>
							<DialogTrigger asChild>
								<Button>
									<Plus className='h-4 w-4 mr-2' />
									Add Branch
								</Button>
							</DialogTrigger>
							<DialogContent>
								<DialogHeader>
									<DialogTitle>Create New Branch</DialogTitle>
									<DialogDescription>
										Add a new branch location to the system.
									</DialogDescription>
								</DialogHeader>
								<form onSubmit={handleCreateBranch} className='space-y-4'>
									<div>
										<Label htmlFor='name'>Branch Name</Label>
										<Input
											id='name'
											name='name'
											value={formData.name}
											onChange={handleInputChange}
											placeholder='Enter branch name'
											required
										/>
									</div>
									<div className='flex justify-end space-x-2'>
										<Button
											type='button'
											variant='outline'
											onClick={() => setIsCreateDialogOpen(false)}
										>
											Cancel
										</Button>
										<Button type='submit' disabled={isSubmitting}>
											{isSubmitting ? 'Creating...' : 'Create Branch'}
										</Button>
									</div>
								</form>
							</DialogContent>
						</Dialog>
					</div>

					{error && (
						<Card className='border-red-200 bg-red-50'>
							<CardContent className='pt-6'>
								<p className='text-red-800'>{error}</p>
							</CardContent>
						</Card>
					)}

					<Card>
						<CardHeader>
							<CardTitle className='flex items-center'>
								<Building2 className='h-5 w-5 mr-2' />
								Branches ({branches.length})
							</CardTitle>
							<CardDescription>
								Overview of all branch locations and their statistics
							</CardDescription>
						</CardHeader>
						<CardContent>
							{branches.length === 0 ? (
								<div className='text-center py-8'>
									<Building2 className='h-12 w-12 text-gray-400 mx-auto mb-4' />
									<p className='text-gray-500 mb-4'>No branches found</p>
									<Button onClick={() => setIsCreateDialogOpen(true)}>
										<Plus className='h-4 w-4 mr-2' />
										Add Your First Branch
									</Button>
								</div>
							) : (
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Branch Name</TableHead>
											<TableHead>Active Workers</TableHead>
											<TableHead>Total Orders</TableHead>
											<TableHead>Pending Orders</TableHead>
											<TableHead>Actions</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{branches.map((branch, index) => (
											<TableRow key={branch.name || `branch-${index}`}>
												<TableCell className='font-medium'>
													{branch.name}
												</TableCell>
												<TableCell>
													<div className='flex items-center'>
														<Users className='h-4 w-4 mr-1 text-blue-500' />
														{branch.activeWorkers}
													</div>
												</TableCell>
												<TableCell>
													<div className='flex items-center'>
														<ShoppingCart className='h-4 w-4 mr-1 text-green-500' />
														{branch.totalOrders}
													</div>
												</TableCell>
												<TableCell>
													<div className='flex items-center'>
														<Clock className='h-4 w-4 mr-1 text-orange-500' />
														{branch.pendingOrders}
													</div>
												</TableCell>
												<TableCell>
													<div className='flex space-x-2'>
														<Button
															size='sm'
															variant='outline'
															onClick={() => openDetailsDialog(branch)}
														>
															<Eye className='h-4 w-4' />
														</Button>
														<Button
															size='sm'
															variant='outline'
															onClick={() => openEditDialog(branch)}
														>
															<Edit className='h-4 w-4' />
														</Button>
														<Button
															size='sm'
															variant='outline'
															onClick={() => openDeleteDialog(branch)}
															className='text-red-600 hover:text-red-700'
														>
															<Trash2 className='h-4 w-4' />
														</Button>
													</div>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							)}
						</CardContent>
					</Card>

					{/* Edit Dialog */}
					<Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Edit Branch</DialogTitle>
								<DialogDescription>
									Update the branch information.
								</DialogDescription>
							</DialogHeader>
							<form onSubmit={handleEditBranch} className='space-y-4'>
								<div>
									<Label htmlFor='edit-name'>Branch Name</Label>
									<Input
										id='edit-name'
										name='name'
										value={formData.name}
										onChange={handleInputChange}
										placeholder='Enter branch name'
										required
									/>
								</div>
								<div className='flex justify-end space-x-2'>
									<Button
										type='button'
										variant='outline'
										onClick={() => setIsEditDialogOpen(false)}
									>
										Cancel
									</Button>
									<Button type='submit' disabled={isSubmitting}>
										{isSubmitting ? 'Updating...' : 'Update Branch'}
									</Button>
								</div>
							</form>
						</DialogContent>
					</Dialog>

					{/* Delete Dialog */}
					<AlertDialog
						open={isDeleteDialogOpen}
						onOpenChange={setIsDeleteDialogOpen}
					>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>Delete Branch</AlertDialogTitle>
								<AlertDialogDescription>
									Are you sure you want to delete &quot;{selectedBranch?.name}
									&quot;? This action cannot be undone and will only work if the
									branch has no active workers or orders.
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter>
								<AlertDialogCancel>Cancel</AlertDialogCancel>
								<AlertDialogAction
									onClick={handleDeleteBranch}
									disabled={isSubmitting}
									className='bg-red-600 hover:bg-red-700'
								>
									{isSubmitting ? 'Deleting...' : 'Delete'}
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>

					{/* Details Dialog */}
					<Dialog
						open={isDetailsDialogOpen}
						onOpenChange={setIsDetailsDialogOpen}
					>
						<DialogContent className='max-w-2xl'>
							<DialogHeader>
								<DialogTitle className='flex items-center'>
									<Building2 className='h-5 w-5 mr-2' />
									{selectedBranch?.name} Details
								</DialogTitle>
								<DialogDescription>
									Detailed information about this branch location.
								</DialogDescription>
							</DialogHeader>
							{branchDetails ? (
								<div className='space-y-6'>
									<div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
										<div className='text-center p-4 bg-blue-50 rounded-lg'>
											<Users className='h-8 w-8 text-blue-600 mx-auto mb-2' />
											<div className='text-2xl font-bold text-blue-900'>
												{branchDetails.activeWorkers}
											</div>
											<div className='text-sm text-blue-600'>
												Active Workers
											</div>
										</div>
										<div className='text-center p-4 bg-gray-50 rounded-lg'>
											<Users className='h-8 w-8 text-gray-600 mx-auto mb-2' />
											<div className='text-2xl font-bold text-gray-900'>
												{branchDetails.totalWorkers}
											</div>
											<div className='text-sm text-gray-600'>Total Workers</div>
										</div>
										<div className='text-center p-4 bg-green-50 rounded-lg'>
											<ShoppingCart className='h-8 w-8 text-green-600 mx-auto mb-2' />
											<div className='text-2xl font-bold text-green-900'>
												{branchDetails.totalOrders}
											</div>
											<div className='text-sm text-green-600'>Total Orders</div>
										</div>
										<div className='text-center p-4 bg-orange-50 rounded-lg'>
											<Clock className='h-8 w-8 text-orange-600 mx-auto mb-2' />
											<div className='text-2xl font-bold text-orange-900'>
												{branchDetails.pendingOrders}
											</div>
											<div className='text-sm text-orange-600'>
												Pending Orders
											</div>
										</div>
									</div>

									{branchDetails.workers.length > 0 && (
										<div>
											<h4 className='font-semibold mb-3'>Workers</h4>
											<div className='space-y-2 max-h-40 overflow-y-auto'>
												{branchDetails.workers.map((worker, index) => (
													<div
														key={worker.id || `worker-${index}`}
														className='flex items-center justify-between p-2 bg-gray-50 rounded'
													>
														<span className='font-medium'>
															{worker.username}
														</span>
														<span
															className={`px-2 py-1 rounded-full text-xs ${
																worker.isActive
																	? 'bg-green-100 text-green-800'
																	: 'bg-red-100 text-red-800'
															}`}
														>
															{worker.isActive ? 'Active' : 'Inactive'}
														</span>
													</div>
												))}
											</div>
										</div>
									)}
								</div>
							) : (
								<div className='flex items-center justify-center py-8'>
									<div className='animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600'></div>
									<span className='ml-2 text-gray-600'>Loading details...</span>
								</div>
							)}
						</DialogContent>
					</Dialog>
				</div>
			</DashboardLayout>
		</ProtectedRoute>
	)
}

export default BranchesManagement
