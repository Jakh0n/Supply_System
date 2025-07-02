'use client'

import { Button } from '@/components/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/contexts/AuthContext'
import {
	BarChart3,
	LogOut,
	Package,
	Settings,
	ShoppingCart,
	User,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React from 'react'

const Navbar: React.FC = () => {
	const { user, logout, isAdmin, isWorker } = useAuth()
	const router = useRouter()

	const handleLogout = async () => {
		await logout()
		router.push('/login')
	}

	if (!user) return null

	return (
		<nav className='bg-white shadow-sm border-b'>
			<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
				<div className='flex justify-between h-16'>
					{/* Logo and main navigation */}
					<div className='flex items-center'>
						<Link
							href={isAdmin ? '/admin' : '/worker'}
							className='flex items-center'
						>
							<Package className='h-8 w-8 text-blue-600' />
							<span className='ml-2 text-xl font-bold text-gray-900'>
								RestaurantSupply
							</span>
						</Link>

						{/* Navigation links */}
						<div className='hidden md:ml-8 md:flex md:space-x-8'>
							{isAdmin && (
								<>
									<Link
										href='/admin'
										className='text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium flex items-center'
									>
										<BarChart3 className='h-4 w-4 mr-2' />
										Dashboard
									</Link>
									<Link
										href='/admin/orders'
										className='text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium flex items-center'
									>
										<ShoppingCart className='h-4 w-4 mr-2' />
										Orders
									</Link>
									<Link
										href='/admin/products'
										className='text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium flex items-center'
									>
										<Package className='h-4 w-4 mr-2' />
										Products
									</Link>
								</>
							)}

							{isWorker && (
								<>
									<Link
										href='/worker'
										className='text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium flex items-center'
									>
										<BarChart3 className='h-4 w-4 mr-2' />
										Dashboard
									</Link>
									<Link
										href='/worker/orders'
										className='text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium flex items-center'
									>
										<ShoppingCart className='h-4 w-4 mr-2' />
										My Orders
									</Link>
									<Link
										href='/worker/new-order'
										className='text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium flex items-center'
									>
										<Package className='h-4 w-4 mr-2' />
										New Order
									</Link>
								</>
							)}
						</div>
					</div>

					{/* User menu */}
					<div className='flex items-center'>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant='ghost'
									className='relative h-8 w-8 rounded-full'
								>
									<User className='h-4 w-4' />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent className='w-56' align='end' forceMount>
								<DropdownMenuLabel className='font-normal'>
									<div className='flex flex-col space-y-1'>
										<p className='text-sm font-medium leading-none'>
											{user.username}
										</p>
										<p className='text-xs leading-none text-muted-foreground'>
											{user.position} {user.branch && `• ${user.branch}`}
										</p>
									</div>
								</DropdownMenuLabel>
								<DropdownMenuSeparator />
								<DropdownMenuItem>
									<Settings className='mr-2 h-4 w-4' />
									<span>Settings</span>
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem onClick={handleLogout}>
									<LogOut className='mr-2 h-4 w-4' />
									<span>Log out</span>
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</div>
			</div>

			{/* Mobile navigation */}
			<div className='md:hidden'>
				<div className='px-2 pt-2 pb-3 space-y-1 sm:px-3'>
					{isAdmin && (
						<>
							<Link
								href='/admin'
								className='text-gray-900 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium'
							>
								Dashboard
							</Link>
							<Link
								href='/admin/orders'
								className='text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium'
							>
								Orders
							</Link>
							<Link
								href='/admin/products'
								className='text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium'
							>
								Products
							</Link>
						</>
					)}

					{isWorker && (
						<>
							<Link
								href='/worker'
								className='text-gray-900 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium'
							>
								Dashboard
							</Link>
							<Link
								href='/worker/orders'
								className='text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium'
							>
								My Orders
							</Link>
							<Link
								href='/worker/new-order'
								className='text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium'
							>
								New Order
							</Link>
						</>
					)}
				</div>
			</div>
		</nav>
	)
}

export default Navbar
