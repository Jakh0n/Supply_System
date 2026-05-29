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
	CupSoda,
	LogOut,
	MapPin,
	Menu,
	Plus,
	Package,
	Settings,
	ShoppingCart,
	User,
	Users,
} from 'lucide-react'
import Image from 'next/image'
import { Link, usePathname, useRouter } from '@/i18n/navigation'
import React from 'react'

const Navbar: React.FC = () => {
	const { user, logout, isAdmin, isWorker, isEditor } = useAuth()
	const router = useRouter()
	const pathname = usePathname()

	const homeHref = isAdmin ? '/admin' : isEditor ? '/editor' : '/worker'

	const handleLogout = async () => {
		await logout()
		router.push('/login')
	}

	const isActiveLink = (href: string) => {
		return pathname === href
	}

	const navLinkClass = (href: string) =>
		`px-2.5 xl:px-3 py-2 rounded-md text-sm font-medium flex items-center transition-colors whitespace-nowrap ${
			isActiveLink(href)
				? 'text-blue-600 bg-blue-50'
				: 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
		}`

	const mobileNavLinkClass = (href: string) =>
		`flex items-center w-full ${
			isActiveLink(href) ? 'text-blue-600 bg-blue-50' : 'text-gray-700'
		}`

	if (!user) return null

	return (
		<nav className='bg-white shadow-sm border-b sticky top-0 z-50'>
			<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
				<div className='flex justify-between h-16'>
					{/* Logo and main navigation */}
					<div className='flex items-center'>
						<Link href={homeHref} className='flex items-center flex-shrink-0'>
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
						<div
							className={`hidden ml-4 lg:ml-6 flex-1 min-w-0 ${
								isWorker ? 'xl:flex xl:space-x-1' : 'md:flex md:space-x-2'
							}`}
						>
							{isAdmin && (
								<>
									<Link href='/admin' className={navLinkClass('/admin')}>
										<BarChart3 className='h-4 w-4 mr-2 shrink-0' />
										Dashboard
									</Link>
									<Link
										href='/admin/orders'
										className={navLinkClass('/admin/orders')}
									>
										<ShoppingCart className='h-4 w-4 mr-2 shrink-0' />
										Orders
									</Link>
									<Link
										href='/admin/products'
										className={navLinkClass('/admin/products')}
									>
										<Package className='h-4 w-4 mr-2 shrink-0' />
										Products
									</Link>
									<Link
										href='/admin/branches'
										className={navLinkClass('/admin/branches')}
									>
										<MapPin className='h-4 w-4 mr-2 shrink-0' />
										Branch Analytics
									</Link>
								</>
							)}

							{isEditor && (
								<>
									<Link href='/editor' className={navLinkClass('/editor')}>
										<ShoppingCart className='h-4 w-4 mr-2 shrink-0' />
										Orders
									</Link>
									<Link
										href='/editor/drink-orders'
										className={navLinkClass('/editor/drink-orders')}
									>
										<CupSoda className='h-4 w-4 mr-2 shrink-0' />
										Drink Orders
									</Link>
								</>
							)}

							{isWorker && (
								<>
									<Link href='/worker' className={navLinkClass('/worker')}>
										<BarChart3 className='h-4 w-4 mr-2 shrink-0' />
										Dashboard
									</Link>
									<Link
										href='/worker/orders'
										className={navLinkClass('/worker/orders')}
									>
										<ShoppingCart className='h-4 w-4 mr-2 shrink-0' />
										My Orders
									</Link>
									<Link
										href='/worker/all-orders'
										className={navLinkClass('/worker/all-orders')}
									>
										<Users className='h-4 w-4 mr-2 shrink-0' />
										Team Orders
									</Link>
									<Link
										href='/worker/new-order'
										className={navLinkClass('/worker/new-order')}
									>
										<Package className='h-4 w-4 mr-2 shrink-0' />
										New Order
									</Link>
									<Link
										href='/worker/drink-orders'
										className={navLinkClass('/worker/drink-orders')}
									>
										<CupSoda className='h-4 w-4 mr-2 shrink-0' />
										Drinks
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

						{/* Mobile / tablet menu dropdown */}
						<div className={isWorker ? 'xl:hidden' : 'md:hidden'}>
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

									{isEditor && (
										<>
											<DropdownMenuItem asChild>
												<Link href='/editor' className={mobileNavLinkClass('/editor')}>
													<ShoppingCart className='h-4 w-4 mr-3 shrink-0' />
													Orders
												</Link>
											</DropdownMenuItem>
											<DropdownMenuItem asChild>
												<Link
													href='/editor/drink-orders'
													className={mobileNavLinkClass('/editor/drink-orders')}
												>
													<CupSoda className='h-4 w-4 mr-3 shrink-0' />
													Drink Orders
												</Link>
											</DropdownMenuItem>
										</>
									)}

									{isWorker && (
										<>
											<DropdownMenuItem asChild>
												<Link href='/worker' className={mobileNavLinkClass('/worker')}>
													<BarChart3 className='h-4 w-4 mr-3 shrink-0' />
													Dashboard
												</Link>
											</DropdownMenuItem>
											<DropdownMenuItem asChild>
												<Link
													href='/worker/orders'
													className={mobileNavLinkClass('/worker/orders')}
												>
													<ShoppingCart className='h-4 w-4 mr-3 shrink-0' />
													My Orders
												</Link>
											</DropdownMenuItem>
											<DropdownMenuItem asChild>
												<Link
													href='/worker/all-orders'
													className={mobileNavLinkClass('/worker/all-orders')}
												>
													<Users className='h-4 w-4 mr-3 shrink-0' />
													All Team Orders
												</Link>
											</DropdownMenuItem>
											<DropdownMenuItem asChild>
												<Link
													href='/worker/new-order'
													className={mobileNavLinkClass('/worker/new-order')}
												>
													<Package className='h-4 w-4 mr-3 shrink-0' />
													New Order
												</Link>
											</DropdownMenuItem>
											<DropdownMenuItem asChild>
												<Link
													href='/worker/new-drink-order'
													className={mobileNavLinkClass('/worker/new-drink-order')}
												>
													<Plus className='h-4 w-4 mr-3 shrink-0' />
													New Drink Order
												</Link>
											</DropdownMenuItem>
											<DropdownMenuItem asChild>
												<Link
													href='/worker/drink-orders'
													className={mobileNavLinkClass('/worker/drink-orders')}
												>
													<CupSoda className='h-4 w-4 mr-3 shrink-0' />
													Drink Orders
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
