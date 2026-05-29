'use client'

import EditorProductAvailability from '@/components/editor/EditorProductAvailability'
import EditorShell from '@/components/editor/EditorShell'
import {
	editorHorizontalScroll,
	editorSnapItem,
	editorTouchSm,
} from '@/components/editor/editorUi'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { useDrinkOrdersList, useOrdersList } from '@/hooks/queries'
import { Order } from '@/types'
import { Package } from 'lucide-react'
import { useState } from 'react'

type ProductTab = 'all' | 'drinks'

export default function EditorProductsPage() {
	const { user, logout } = useAuth()
	const [tab, setTab] = useState<ProductTab>('all')

	const { data: pendingOrdersData } = useOrdersList({
		status: 'pending',
		limit: 500,
		page: 1,
	})

	const { data: pendingDrinkOrdersData } = useDrinkOrdersList(
		{
			status: 'pending',
			limit: 500,
			page: 1,
			viewAll: 'true',
		},
		{ enabled: tab === 'drinks' }
	)

	const pendingOrders = pendingOrdersData?.orders ?? []
	const pendingDrinkOrders =
		(pendingDrinkOrdersData?.drinkOrders as unknown as Order[]) ?? []

	const ordersForPanel = tab === 'drinks' ? pendingDrinkOrders : pendingOrders

	if (!user) {
		return null
	}

	return (
		<EditorShell username={user.username} onLogout={logout}>
			<div className='space-y-6'>
				<div>
					<h2 className='text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2'>
						<Package className='h-6 w-6 text-amber-600 shrink-0' />
						Product Availability
					</h2>
					<p className='text-sm text-gray-500 mt-1'>
						Mark sold out products so workers cannot order unavailable stock
					</p>
				</div>

				<div className={editorHorizontalScroll}>
					<Button
						variant={tab === 'all' ? 'default' : 'outline'}
						onClick={() => setTab('all')}
						className={`${editorSnapItem} ${editorTouchSm} px-6`}
					>
						All products
					</Button>
					<Button
						variant={tab === 'drinks' ? 'default' : 'outline'}
						onClick={() => setTab('drinks')}
						className={`${editorSnapItem} ${editorTouchSm} px-6`}
					>
						Drinks only
					</Button>
				</div>

				<EditorProductAvailability
					orders={ordersForPanel}
					drinkOnly={tab === 'drinks'}
				/>
			</div>
		</EditorShell>
	)
}
