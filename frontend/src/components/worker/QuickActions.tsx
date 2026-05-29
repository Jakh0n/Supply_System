import { Card, CardHeader } from '@/components/ui/card'
import { CupSoda, LucideIcon, Plus, ShoppingCart, Users } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

interface QuickActionItem {
	href: string
	title: string
	description: string
	icon: LucideIcon
	iconBg: string
	cardBg: string
	hoverBg: string
}

const QUICK_ACTIONS: QuickActionItem[] = [
	{
		href: '/worker/new-order',
		title: 'Create New Order',
		description: 'Submit a new supply request for your branch',
		icon: Plus,
		iconBg: 'from-green-500 to-green-600',
		cardBg: 'from-white to-green-50',
		hoverBg: 'sm:hover:from-green-50 sm:hover:to-green-100',
	},
	{
		href: '/worker/orders',
		title: 'View My Orders',
		description: 'Check the status of your submitted orders',
		icon: ShoppingCart,
		iconBg: 'from-blue-500 to-blue-600',
		cardBg: 'from-white to-blue-50',
		hoverBg: 'sm:hover:from-blue-50 sm:hover:to-blue-100',
	},
	{
		href: '/worker/all-orders',
		title: 'All Team Orders',
		description: 'View all orders from your team - perfect for coordination',
		icon: Users,
		iconBg: 'from-purple-500 to-purple-600',
		cardBg: 'from-white to-purple-50',
		hoverBg: 'sm:hover:from-purple-50 sm:hover:to-purple-100',
	},
	{
		href: '/worker/new-drink-order',
		title: 'Create Drink Order',
		description:
			'Submit a drink-only request that is separate from supply orders',
		icon: CupSoda,
		iconBg: 'from-cyan-500 to-cyan-600',
		cardBg: 'from-white to-cyan-50',
		hoverBg: 'sm:hover:from-cyan-50 sm:hover:to-cyan-100',
	},
]

const QuickActionCard: React.FC<{ action: QuickActionItem }> = ({ action }) => {
	const Icon = action.icon

	return (
		<Link href={action.href} className='block group h-full'>
			<Card
				className={`cursor-pointer transition-all duration-300 h-full border-0 bg-gradient-to-br ${action.cardBg} ${action.hoverBg} shadow-md md:shadow-lg sm:hover:shadow-xl lg:hover:scale-[1.02]`}
			>
				<CardHeader className='p-4 sm:p-5 md:p-3.5 lg:p-4 xl:p-6'>
					<div className='flex items-start gap-2.5 sm:gap-3 md:gap-2 lg:gap-2.5 xl:gap-3'>
						<div
							className={`p-2 sm:p-2.5 md:p-2 lg:p-2.5 xl:p-3 bg-gradient-to-br ${action.iconBg} rounded-lg md:rounded-xl shrink-0 shadow-md sm:group-hover:shadow-lg transition-shadow`}
						>
							<Icon className='h-4 w-4 sm:h-5 sm:w-5 md:h-4 md:w-4 lg:h-5 lg:w-5 xl:h-6 xl:w-6 text-white' />
						</div>
						<div className='min-w-0 flex-1'>
							<h3 className='font-semibold text-gray-900 leading-snug text-sm sm:text-base md:text-[13px] lg:text-sm xl:text-lg'>
								{action.title}
							</h3>
							<p className='text-xs sm:text-sm md:text-[11px] md:leading-snug lg:text-xs xl:text-sm text-gray-600 leading-relaxed mt-1.5 sm:mt-2 md:mt-1 lg:mt-1.5 xl:mt-2'>
								{action.description}
							</p>
						</div>
					</div>
				</CardHeader>
			</Card>
		</Link>
	)
}

const QuickActions: React.FC = () => {
	return (
		<div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-3 lg:gap-4 xl:gap-6'>
			{QUICK_ACTIONS.map(action => (
				<QuickActionCard key={action.href} action={action} />
			))}
		</div>
	)
}

export default QuickActions
