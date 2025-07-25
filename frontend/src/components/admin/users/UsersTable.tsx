import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { User } from '@/types'
import {
	CheckCircle,
	Edit,
	Eye,
	EyeOff,
	MoreHorizontal,
	Shield,
	Trash2,
	User as UserIcon,
	Users,
	XCircle,
} from 'lucide-react'

// Helper function to format date
const formatDate = (dateString: string): string => {
	return new Date(dateString).toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
	})
}

interface UsersTableProps {
	users: User[]
	searchTerm: string
	positionFilter: 'admin' | 'worker' | 'all'
	statusFilter: 'true' | 'false' | 'all'
	onEditUser: (user: User) => void
	onToggleStatus: (user: User) => void
	onDeleteUser: (user: User) => void
}

const UsersTable: React.FC<UsersTableProps> = ({
	users,
	searchTerm,
	positionFilter,
	statusFilter,
	onEditUser,
	onToggleStatus,
	onDeleteUser,
}) => {
	if (users.length === 0) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className='text-base sm:text-lg'>
						Users ({users.length})
					</CardTitle>
					<CardDescription>
						Manage all system users and their access
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className='text-center py-8'>
						<Users className='h-12 w-12 text-gray-400 mx-auto mb-4' />
						<p className='text-gray-500'>No users found</p>
						<p className='text-sm text-gray-400 mt-1'>
							{searchTerm || positionFilter !== 'all' || statusFilter !== 'all'
								? 'Try adjusting your filters'
								: 'No users have been created yet'}
						</p>
					</div>
				</CardContent>
			</Card>
		)
	}

	return (
		<>
			{/* Desktop Table View */}
			<Card className='hidden lg:block'>
				<CardHeader>
					<CardTitle className='text-base sm:text-lg'>
						Users ({users.length})
					</CardTitle>
					<CardDescription>
						Manage all system users and their access
					</CardDescription>
				</CardHeader>
				<CardContent className='p-0'>
					<div className='overflow-x-auto'>
						<div className='max-h-[70vh] overflow-y-auto scroll-smooth border-t'>
							<table className='w-full'>
								<thead className='bg-gray-50 sticky top-0 z-10 shadow-sm'>
									<tr className='border-b border-gray-200'>
										<th className='text-left py-3 px-4 font-medium bg-gray-50 text-sm whitespace-nowrap'>
											Username
										</th>
										<th className='text-left py-3 px-4 font-medium bg-gray-50 text-sm whitespace-nowrap'>
											Position
										</th>
										<th className='text-left py-3 px-4 font-medium bg-gray-50 text-sm whitespace-nowrap'>
											Status
										</th>
										<th className='text-left py-3 px-4 font-medium bg-gray-50 text-sm whitespace-nowrap'>
											Created
										</th>
										<th className='text-right py-3 px-4 font-medium bg-gray-50 text-sm whitespace-nowrap'>
											Actions
										</th>
									</tr>
								</thead>
								<tbody className='bg-white'>
									{users.map((user, index) => (
										<tr
											key={user._id || user.id || `user-${index}`}
											className='border-b border-gray-100 hover:bg-gray-50 transition-colors'
										>
											<td className='py-3 px-4'>
												<div className='flex items-center'>
													<div className='h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center mr-3'>
														<UserIcon className='h-4 w-4 text-gray-600' />
													</div>
													<div>
														<p className='font-medium text-sm'>
															{user.username}
														</p>
														{user.branch && (
															<p className='text-xs text-gray-500'>
																{user.branch}
															</p>
														)}
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
														<DropdownMenuItem onClick={() => onEditUser(user)}>
															<Edit className='h-4 w-4 mr-2' />
															Edit
														</DropdownMenuItem>
														<DropdownMenuItem
															onClick={() => onToggleStatus(user)}
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
															onClick={() => onDeleteUser(user)}
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
					</div>
				</CardContent>
			</Card>

			{/* Mobile Card View */}
			<div className='lg:hidden'>
				<div className='flex items-center justify-between mb-4'>
					<h2 className='text-lg font-semibold text-gray-900'>
						Users ({users.length})
					</h2>
				</div>

				<div className='max-h-[70vh] overflow-y-auto scroll-smooth space-y-3 pr-1'>
					{users.map((user, index) => (
						<Card
							key={user._id || user.id || `user-${index}`}
							className='hover:shadow-md transition-shadow border border-gray-200'
						>
							<CardContent className='p-4'>
								<div className='flex items-start justify-between mb-3'>
									<div className='flex items-center gap-3 flex-1 min-w-0'>
										<div className='h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0'>
											<UserIcon className='h-5 w-5 text-gray-600' />
										</div>
										<div className='min-w-0 flex-1'>
											<div className='font-medium text-sm text-gray-900'>
												{user.username}
											</div>
											{user.branch && (
												<div className='text-xs text-gray-500 mt-1'>
													Branch: {user.branch}
												</div>
											)}
										</div>
									</div>
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button variant='ghost' size='sm'>
												<MoreHorizontal className='h-4 w-4' />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align='end'>
											<DropdownMenuLabel>Actions</DropdownMenuLabel>
											<DropdownMenuItem onClick={() => onEditUser(user)}>
												<Edit className='h-4 w-4 mr-2' />
												Edit
											</DropdownMenuItem>
											<DropdownMenuItem onClick={() => onToggleStatus(user)}>
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
												onClick={() => onDeleteUser(user)}
												className='text-red-600'
											>
												<Trash2 className='h-4 w-4 mr-2' />
												Delete
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</div>

								<div className='grid grid-cols-2 gap-3 mb-3'>
									<div>
										<div className='text-xs text-gray-500 mb-1'>Position</div>
										<span
											className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
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
									</div>
									<div>
										<div className='text-xs text-gray-500 mb-1'>Status</div>
										<span
											className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
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
									</div>
								</div>

								<div className='text-xs text-gray-500'>
									<span className='font-medium'>Created:</span>{' '}
									{formatDate(user.createdAt)}
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			</div>

			{/* Scroll Indicator */}
			{users.length > 10 && (
				<div className='text-center py-2 text-sm text-gray-500 bg-gray-50 border-t rounded-lg mt-4'>
					Showing {users.length} users - Scroll to see more
				</div>
			)}
		</>
	)
}

export default UsersTable
