'use client'

import { Input } from '@/components/ui/input'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import {
	useProductsList,
	useToggleProductStatus,
} from '@/hooks/queries'
import { getCategoryDisplayName } from '@/lib/orderCategories'
import { Product } from '@/types'
import { Search } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'

function isWorkerOrderProduct(product: Product): boolean {
	return !product.supplier || product.supplier.trim() === ''
}

export default function EditorProductAvailability() {
	const t = useTranslations('editor.products')
	const [search, setSearch] = useState('')
	const [updatingId, setUpdatingId] = useState<string | null>(null)

	const { data, isLoading } = useProductsList({ active: 'all' })
	const toggleMutation = useToggleProductStatus()

	const products = useMemo(() => {
		const list = (data?.products ?? []).filter(isWorkerOrderProduct)
		const q = search.trim().toLowerCase()
		if (!q) return list
		return list.filter(
			product =>
				product.name.toLowerCase().includes(q) ||
				product.category.toLowerCase().includes(q) ||
				getCategoryDisplayName(product.category).toLowerCase().includes(q),
		)
	}, [data?.products, search])

	const availableCount = products.filter(p => p.isActive).length
	const soldOutCount = products.length - availableCount

	const handleStatusChange = (product: Product, value: string) => {
		const shouldBeActive = value === 'available'
		if (product.isActive === shouldBeActive) return

		setUpdatingId(product._id)
		toggleMutation.mutate(product._id, {
			onSettled: () => setUpdatingId(null),
		})
	}

	return (
		<div className='space-y-3 sm:space-y-4'>
			<div className='relative'>
				<Search className='absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none' />
				<Input
					value={search}
					onChange={e => setSearch(e.target.value)}
					placeholder={t('searchPlaceholder')}
					className='h-10 sm:h-11 pl-9 text-sm sm:text-base'
					autoComplete='off'
				/>
			</div>

			<div className='flex gap-2 text-xs sm:text-sm'>
				<span className='rounded-md bg-green-50 text-green-800 border border-green-100 px-2 py-1 tabular-nums'>
					{t('availableCount', { count: availableCount })}
				</span>
				<span className='rounded-md bg-amber-50 text-amber-800 border border-amber-100 px-2 py-1 tabular-nums'>
					{t('soldOutCount', { count: soldOutCount })}
				</span>
			</div>

			{isLoading ? (
				<p className='text-xs sm:text-sm text-gray-500 py-6 text-center'>
					{t('loading')}
				</p>
			) : products.length === 0 ? (
				<p className='text-xs sm:text-sm text-gray-500 py-6 text-center'>
					{t('noProducts')}
				</p>
			) : (
				<ul className='rounded-lg border border-gray-200 bg-white divide-y divide-gray-100 overflow-hidden'>
					{products.map(product => {
						const isUpdating = updatingId === product._id
						const status = product.isActive ? 'available' : 'sold-out'

						return (
							<li
								key={product._id}
								className={`flex items-center gap-2 px-3 py-2.5 sm:px-4 sm:py-3 ${
									product.isActive ? '' : 'bg-amber-50/40'
								}`}
							>
								<div className='min-w-0 flex-1'>
									<p className='text-sm font-medium text-gray-900 truncate'>
										{product.name}
									</p>
									<p className='text-[11px] sm:text-xs text-gray-500 truncate'>
										{getCategoryDisplayName(product.category)}
										{product.unit ? ` · ${product.unit}` : ''}
									</p>
								</div>

								<Select
									value={status}
									onValueChange={value => handleStatusChange(product, value)}
									disabled={isUpdating || toggleMutation.isPending}
								>
									<SelectTrigger
										className={`h-9 w-[7.5rem] sm:w-[8.5rem] text-xs sm:text-sm shrink-0 ${
											product.isActive
												? 'border-green-200 bg-green-50 text-green-800'
												: 'border-amber-200 bg-amber-50 text-amber-900'
										} ${isUpdating ? 'opacity-50' : ''}`}
									>
										<SelectValue placeholder={t('selectStatus')} />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value='available'>{t('available')}</SelectItem>
										<SelectItem value='sold-out'>{t('soldOut')}</SelectItem>
									</SelectContent>
								</Select>
							</li>
						)
					})}
				</ul>
			)}
		</div>
	)
}
