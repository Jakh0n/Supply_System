'use client'

import { Link, usePathname } from '@/i18n/navigation'
import LanguageSwitcher from '@/components/shared/LanguageSwitcher'
import { Button } from '@/components/ui/button'
import { CupSoda, LogOut, Package, ShoppingCart } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { editorTouchSm } from './editorUi'

interface EditorHeaderProps {
	username: string
	onLogout: () => void
}

const EditorHeader: React.FC<EditorHeaderProps> = ({ username, onLogout }) => {
	const t = useTranslations('editor')
	const tc = useTranslations('common')
	const pathname = usePathname()

	const navItems = [
		{
			href: '/editor' as const,
			label: t('nav.orders'),
			shortLabel: t('nav.ordersShort'),
			icon: ShoppingCart,
		},
		{
			href: '/editor/drink-orders' as const,
			label: t('nav.drinkOrders'),
			shortLabel: t('nav.drinksShort'),
			icon: CupSoda,
		},
		{
			href: '/editor/products' as const,
			label: t('nav.products'),
			shortLabel: t('nav.stockShort'),
			icon: Package,
		},
	]

	const isActive = (href: string) =>
		href === '/editor' ? pathname === href : pathname.startsWith(href)

	return (
		<>
			<header className='bg-white shadow-sm border-b sticky top-0 z-40 safe-area-inset-top'>
				<div className='max-w-7xl mx-auto px-3 sm:px-6 lg:px-8'>
					<div className='flex justify-between items-center h-14 sm:h-16 gap-2'>
						<div className='flex items-center min-w-0 flex-1 gap-2 sm:gap-3'>
							<Image
								src='/crown.png'
								alt={tc('appName')}
								width={32}
								height={32}
								className='h-8 w-8 shrink-0'
							/>
							<div className='min-w-0'>
								<h1 className='text-sm sm:text-xl font-semibold text-gray-900 truncate leading-tight'>
									{t('title')}
								</h1>
								<p className='text-xs text-gray-500 truncate max-w-[100px] sm:max-w-none'>
									{username}
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
										className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${editorTouchSm} ${
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

						<div className='flex items-center gap-1.5 shrink-0'>
							<LanguageSwitcher />
							<Button
								variant='outline'
								onClick={onLogout}
								size='sm'
								className={`${editorTouchSm} px-2.5 sm:px-3`}
								aria-label={tc('logout')}
							>
								<LogOut className='h-4 w-4' />
								<span className='hidden sm:inline ml-2'>{tc('logout')}</span>
							</Button>
						</div>
					</div>
				</div>
			</header>

			<nav
				className='md:hidden fixed bottom-0 inset-x-0 z-50 bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] pb-[env(safe-area-inset-bottom,0px)]'
				aria-label={t('title')}
			>
				<div className='grid grid-cols-3 max-w-lg mx-auto'>
					{navItems.map(item => {
						const Icon = item.icon
						const active = isActive(item.href)
						return (
							<Link
								key={item.href}
								href={item.href}
								className={`flex flex-col items-center justify-center gap-0.5 py-2.5 px-1 min-h-[3.25rem] touch-manipulation active:bg-gray-100 transition-colors ${
									active ? 'text-blue-600' : 'text-gray-500'
								}`}
							>
								<Icon
									className={`h-5 w-5 ${active ? 'stroke-[2.5px]' : ''}`}
								/>
								<span
									className={`text-[10px] font-medium leading-tight ${
										active ? 'text-blue-600' : 'text-gray-600'
									}`}
								>
									{item.shortLabel}
								</span>
							</Link>
						)
					})}
				</div>
			</nav>
		</>
	)
}

export default EditorHeader
