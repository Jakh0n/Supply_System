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
	Building2,
	ChevronDown,
	ChevronLeft,
	ChevronRight,
	LogOut,
	Menu,
	Package,
	Settings,
	ShoppingCart,
	User,
	Users,
	X,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import React, { useState } from 'react'

interface AdminLayoutProps {
	children: React.ReactNode
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
	const { user, logout } = useAuth()
	const router = useRouter()
	const pathname = usePathname()
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
	const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

	const handleLogout = async () => {
		await logout()
		router.push('/login')
	}

	const isActiveLink = (href: string) => {
		return pathname === href || pathname.startsWith(href + '/')
	}

	const navigationItems = [
		{
			title: 'Dashboard',
			href: '/admin',
			icon: BarChart3,
			exact: true,
		},
		{
			title: 'Orders',
			href: '/admin/orders',
			icon: ShoppingCart,
		},
		{
			title: 'Products',
			href: '/admin/products',
			icon: Package,
		},
		{
			title: 'Branch Analytics',
			href: '/admin/branches',
			icon: Building2,
		},
		{
			title: 'Users',
			href: '/admin/users',
			icon: Users,
		},
	]

	const SidebarContent = ({ collapsed = false }: { collapsed?: boolean }) => (
		<div className='flex flex-col h-full'>
			{/* Logo */}
			<div
				className={`flex items-center px-6 py-4 border-b ${
					collapsed ? 'justify-center px-4' : ''
				}`}
			>
				<Package className='h-8 w-8 text-blue-600 flex-shrink-0' />
				{!collapsed && (
					<span className='ml-2 text-xl font-bold text-gray-900'>
						RestaurantSupply
					</span>
				)}
			</div>

			{/* Navigation */}
			<nav className={`flex-1 py-6 space-y-2 ${collapsed ? 'px-2' : 'px-4'}`}>
				{navigationItems.map(item => {
					const Icon = item.icon
					const isActive = item.exact
						? pathname === item.href
						: isActiveLink(item.href)

					return (
						<Link
							key={item.href}
							href={item.href}
							onClick={() => setIsMobileMenuOpen(false)}
							className={`flex items-center rounded-lg text-sm font-medium transition-colors group ${
								collapsed ? 'px-3 py-3 justify-center' : 'px-3 py-2'
							} ${
								isActive
									? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
									: 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
							}`}
							title={collapsed ? item.title : undefined}
						>
							<Icon
								className={`h-5 w-5 flex-shrink-0 ${collapsed ? '' : 'mr-3'}`}
							/>
							{!collapsed && item.title}
						</Link>
					)
				})}
			</nav>

			{/* User info at bottom */}
			<div className={`border-t ${collapsed ? 'px-2 py-4' : 'px-4 py-4'}`}>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant='ghost'
							className={`w-full justify-start h-auto ${
								collapsed ? 'px-3 py-3' : 'px-3 py-2'
							}`}
							title={
								collapsed ? `${user?.username} (${user?.position})` : undefined
							}
						>
							<div
								className={`flex items-center ${
									collapsed ? 'justify-center' : 'w-full'
								}`}
							>
								<div className='flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 flex-shrink-0'>
									<User className='h-4 w-4 text-blue-600' />
								</div>
								{!collapsed && (
									<>
										<div className='flex-1 text-left ml-3'>
											<p className='text-sm font-medium text-gray-900'>
												{user?.username}
											</p>
											<p className='text-xs text-gray-500'>
												{user?.position} {user?.branch && `• ${user.branch}`}
											</p>
										</div>
										<ChevronDown className='h-4 w-4 text-gray-400' />
									</>
								)}
							</div>
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent className='w-56' align='end'>
						<DropdownMenuLabel>My Account</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuItem>
							<Settings className='mr-2 h-4 w-4' />
							Settings
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem onClick={handleLogout}>
							<LogOut className='mr-2 h-4 w-4' />
							Log out
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</div>
	)

	return (
		<div className='flex h-screen bg-gray-50'>
			{/* Desktop Sidebar */}
			<div
				className={`hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:bg-white lg:border-r lg:border-gray-200 transition-all duration-300 ${
					isSidebarCollapsed ? 'lg:w-16' : 'lg:w-64'
				}`}
			>
				<SidebarContent collapsed={isSidebarCollapsed} />

				{/* Sidebar Toggle Button */}
				<Button
					variant='ghost'
					size='sm'
					className='absolute -right-3 top-6 h-6 w-6 rounded-full border bg-white shadow-md hover:bg-gray-50 z-10'
					onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
				>
					{isSidebarCollapsed ? (
						<ChevronRight className='h-4 w-4' />
					) : (
						<ChevronLeft className='h-4 w-4' />
					)}
				</Button>
			</div>

			{/* Mobile Sidebar Overlay */}
			{isMobileMenuOpen && (
				<div className='fixed inset-0 z-50 lg:hidden'>
					<div
						className='fixed inset-0 bg-black opacity-50'
						onClick={() => setIsMobileMenuOpen(false)}
					/>
					<div className='fixed left-0 top-0 h-full w-64 bg-white shadow-lg'>
						<div className='flex items-center justify-between px-4 py-3 border-b'>
							<span className='text-lg font-semibold'>Menu</span>
							<Button
								variant='ghost'
								size='sm'
								onClick={() => setIsMobileMenuOpen(false)}
							>
								<X className='h-5 w-5' />
							</Button>
						</div>
						<SidebarContent />
					</div>
				</div>
			)}

			{/* Main Content */}
			<div
				className={`flex-1 transition-all duration-300 ${
					isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
				}`}
			>
				{/* Mobile Header */}
				<div className='lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200'>
					<div className='flex items-center'>
						<Button
							variant='ghost'
							size='sm'
							className='mr-2'
							onClick={() => setIsMobileMenuOpen(true)}
						>
							<Menu className='h-5 w-5' />
						</Button>
						<Package className='h-6 w-6 text-blue-600' />
						<span className='ml-2 text-lg font-bold text-gray-900'>
							Admin Panel
						</span>
					</div>
				</div>

				{/* Page Content */}
				<main className='flex-1 overflow-y-auto'>
					<div className='p-6'>{children}</div>
				</main>
			</div>
		</div>
	)
}

export default AdminLayout
