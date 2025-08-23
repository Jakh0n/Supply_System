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
	MapPin,
	Menu,
	Package,
	Settings,
	ShoppingCart,
	User,
	Users,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import React from 'react'

const Navbar: React.FC = () => {
	const { user, logout, isAdmin, isWorker } = useAuth()
	const router = useRouter()
	const pathname = usePathname()

	const handleLogout = async () => {
		await logout()
		router.push('/login')
	}

	const isActiveLink = (href: string) => {
		return pathname === href
	}

	if (!user) return null

	return (
		<nav className='bg-white shadow-sm border-b sticky top-0 z-50'>
			<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
				<div className='flex justify-between h-16'>
					{/* Logo and main navigation */}
					<div className='flex items-center'>
						<Link
							href={isAdmin ? '/admin' : '/worker'}
							className='flex items-center flex-shrink-0'
						>
							<Image
								src='/crown.png'
								alt='King Kebab Supply'
								width={32}
								height={32}
								className='h-8 w-8'
							/>
							<h1 className='text-lg sm:text-xl font-bold text-blue-500 hidden sm:block'>
								<span className='text-red-600'>King Kebab</span> Supply
							</h1>
							<h1 className='ml-2 text-md font-bold text-gray-900 sm:hidden'>
								<span className='text-red-600'>King Kebab</span> Supply
							</h1>
						</Link>

						{/* Desktop navigation links */}
						<div className='hidden md:ml-8 md:flex md:space-x-8'>
							{isAdmin && (
								<>
									<Link
										href='/admin'
										className={`px-3 py-2 rounded-md text-sm font-medium flex items-center transition-colors ${
											isActiveLink('/admin')
												? 'text-blue-600 bg-blue-50'
												: 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
										}`}
									>
										<BarChart3 className='h-4 w-4 mr-2' />
										Dashboard
									</Link>
									<Link
										href='/admin/orders'
										className={`px-3 py-2 rounded-md text-sm font-medium flex items-center transition-colors ${
											isActiveLink('/admin/orders')
												? 'text-blue-600 bg-blue-50'
												: 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
										}`}
									>
										<ShoppingCart className='h-4 w-4 mr-2' />
										Orders
									</Link>
									<Link
										href='/admin/products'
										className={`px-3 py-2 rounded-md text-sm font-medium flex items-center transition-colors ${
											isActiveLink('/admin/products')
												? 'text-blue-600 bg-blue-50'
												: 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
										}`}
									>
										<Package className='h-4 w-4 mr-2' />
										Products
									</Link>
									<Link
										href='/admin/branches'
										className={`px-3 py-2 rounded-md text-sm font-medium flex items-center transition-colors ${
											isActiveLink('/admin/branches')
												? 'text-blue-600 bg-blue-50'
												: 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
										}`}
									>
										<MapPin className='h-4 w-4 mr-2' />
										Branch Analytics
									</Link>
								</>
							)}

							{isWorker && (
								<>
									<Link
										href='/worker'
										className={`px-3 py-2 rounded-md text-sm font-medium flex items-center transition-colors ${
											isActiveLink('/worker')
												? 'text-blue-600 bg-blue-50'
												: 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
										}`}
									>
										<BarChart3 className='h-4 w-4 mr-2' />
										Dashboard
									</Link>
									<Link
										href='/worker/orders'
										className={`px-3 py-2 rounded-md text-sm font-medium flex items-center transition-colors ${
											isActiveLink('/worker/orders')
												? 'text-blue-600 bg-blue-50'
												: 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
										}`}
									>
										<ShoppingCart className='h-4 w-4 mr-2' />
										My Orders
									</Link>
									<Link
										href='/worker/all-orders'
										className={`px-3 py-2 rounded-md text-sm font-medium flex items-center transition-colors ${
											isActiveLink('/worker/all-orders')
												? 'text-blue-600 bg-blue-50'
												: 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
										}`}
									>
										<Users className='h-4 w-4 mr-2' />
										All Team Orders
									</Link>
									<Link
										href='/worker/new-order'
										className={`px-3 py-2 rounded-md text-sm font-medium flex items-center transition-colors ${
											isActiveLink('/worker/new-order')
												? 'text-blue-600 bg-blue-50'
												: 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
										}`}
									>
										<Package className='h-4 w-4 mr-2' />
										New Order
									</Link>
								</>
							)}
						</div>
					</div>

					{/* Right side - User menu and mobile menu button */}
					<div className='flex items-center space-x-2'>
						{/* User menu */}
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant='ghost'
									className='relative h-9 w-9 rounded-full hover:bg-gray-100'
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

						{/* Mobile menu dropdown */}
						<div className='md:hidden'>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										variant='ghost'
										size='sm'
										className='h-9 w-9 p-0 hover:bg-gray-100'
										aria-label='Toggle mobile menu'
									>
										<Menu className='h-5 w-5' />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent className='w-64' align='end' side='bottom'>
									<DropdownMenuLabel className='font-semibold text-gray-900'>
										Navigation
									</DropdownMenuLabel>
									<DropdownMenuSeparator />

									{isAdmin && (
										<>
											<DropdownMenuItem asChild>
												<Link
													href='/admin'
													className={`flex items-center w-full ${
														isActiveLink('/admin')
															? 'text-blue-600 bg-blue-50'
															: 'text-gray-700'
													}`}
												>
													<BarChart3 className='h-4 w-4 mr-3' />
													Dashboard
												</Link>
											</DropdownMenuItem>
											<DropdownMenuItem asChild>
												<Link
													href='/admin/orders'
													className={`flex items-center w-full ${
														isActiveLink('/admin/orders')
															? 'text-blue-600 bg-blue-50'
															: 'text-gray-700'
													}`}
												>
													<ShoppingCart className='h-4 w-4 mr-3' />
													Orders
												</Link>
											</DropdownMenuItem>
											<DropdownMenuItem asChild>
												<Link
													href='/admin/products'
													className={`flex items-center w-full ${
														isActiveLink('/admin/products')
															? 'text-blue-600 bg-blue-50'
															: 'text-gray-700'
													}`}
												>
													<Package className='h-4 w-4 mr-3' />
													Products
												</Link>
											</DropdownMenuItem>
											<DropdownMenuItem asChild>
												<Link
													href='/admin/branches'
													className={`flex items-center w-full ${
														isActiveLink('/admin/branches')
															? 'text-blue-600 bg-blue-50'
															: 'text-gray-700'
													}`}
												>
													<MapPin className='h-4 w-4 mr-3' />
													Branch Analytics
												</Link>
											</DropdownMenuItem>
										</>
									)}

									{isWorker && (
										<>
											<DropdownMenuItem asChild>
												<Link
													href='/worker'
													className={`flex items-center w-full ${
														isActiveLink('/worker')
															? 'text-blue-600 bg-blue-50'
															: 'text-gray-700'
													}`}
												>
													<BarChart3 className='h-4 w-4 mr-3' />
													Dashboard
												</Link>
											</DropdownMenuItem>
											<DropdownMenuItem asChild>
												<Link
													href='/worker/orders'
													className={`flex items-center w-full ${
														isActiveLink('/worker/orders')
															? 'text-blue-600 bg-blue-50'
															: 'text-gray-700'
													}`}
												>
													<ShoppingCart className='h-4 w-4 mr-3' />
													My Orders
												</Link>
											</DropdownMenuItem>
											<DropdownMenuItem asChild>
												<Link
													href='/worker/new-order'
													className={`flex items-center w-full ${
														isActiveLink('/worker/new-order')
															? 'text-blue-600 bg-blue-50'
															: 'text-gray-700'
													}`}
												>
													<Package className='h-4 w-4 mr-3' />
													New Order
												</Link>
											</DropdownMenuItem>
										</>
									)}

									<DropdownMenuSeparator />
									<DropdownMenuLabel className='text-xs text-gray-500'>
										Account
									</DropdownMenuLabel>
									<DropdownMenuItem>
										<Settings className='mr-3 h-4 w-4' />
										Settings
									</DropdownMenuItem>
									<DropdownMenuItem
										onClick={handleLogout}
										className='text-red-600'
									>
										<LogOut className='mr-3 h-4 w-4' />
										Log out
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					</div>
				</div>
			</div>
		</nav>
	)
}

export default Navbar
