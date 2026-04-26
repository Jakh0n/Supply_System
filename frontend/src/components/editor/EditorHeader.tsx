import { Button } from '@/components/ui/button'
import { CupSoda, LogOut, ShoppingCart } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface EditorHeaderProps {
	username: string
	onLogout: () => void
}

const EditorHeader: React.FC<EditorHeaderProps> = ({ username, onLogout }) => {
	const pathname = usePathname()

	const navItems = [
		{
			href: '/editor',
			label: 'Orders',
			icon: ShoppingCart,
		},
		{
			href: '/editor/drink-orders',
			label: 'Drink Orders',
			icon: CupSoda,
		},
	]

	const isActive = (href: string) =>
		href === '/editor' ? pathname === href : pathname.startsWith(href)

	return (
		<header className='bg-white shadow-sm border-b sticky top-0 z-30'>
			<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
				<div className='flex justify-between items-center h-14 sm:h-16 gap-3'>
					<div className='flex items-center min-w-0 flex-1'>
						<Image
							src='/crown.png'
							alt='King Kebab Supply'
							width={32}
							height={32}
							className='h-6 w-6 sm:h-8 sm:w-8 mr-2 sm:mr-3 flex-shrink-0'
						/>
						<div className='min-w-0 flex-1'>
							<h1 className='text-base sm:text-xl font-semibold text-gray-900 truncate'>
								Editor Dashboard
							</h1>
							<p className='text-xs sm:text-sm text-gray-500 truncate'>
								Welcome back, {username}
							</p>
						</div>
					</div>

					<nav className='hidden md:flex items-center gap-1'>
						{navItems.map(item => {
							const Icon = item.icon
							const active = isActive(item.href)
							return (
								<Link
									key={item.href}
									href={item.href}
									className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
										active
											? 'bg-blue-50 text-blue-700'
											: 'text-gray-700 hover:bg-gray-100'
									}`}
								>
									<Icon className='h-4 w-4' />
									{item.label}
								</Link>
							)
						})}
					</nav>

					<Button
						variant='outline'
						onClick={onLogout}
						size='sm'
						className='flex items-center gap-1 sm:gap-2 flex-shrink-0'
					>
						<LogOut className='h-3 w-3 sm:h-4 sm:w-4' />
						<span className='hidden sm:inline'>Logout</span>
					</Button>
				</div>

				<nav className='md:hidden flex items-center gap-1 pb-2 -mt-1 overflow-x-auto'>
					{navItems.map(item => {
						const Icon = item.icon
						const active = isActive(item.href)
						return (
							<Link
								key={item.href}
								href={item.href}
								className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
									active
										? 'bg-blue-50 text-blue-700'
										: 'text-gray-600 hover:bg-gray-100'
								}`}
							>
								<Icon className='h-3.5 w-3.5' />
								{item.label}
							</Link>
						)
					})}
				</nav>
			</div>
		</header>
	)
}

export default EditorHeader
