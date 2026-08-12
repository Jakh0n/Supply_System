'use client'

import { Button } from '@/components/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
	useAddProductStock,
	useProductsList,
	useToggleProductStatus,
} from '@/hooks/queries'
import { Product } from '@/types'
import { Ban, CheckCircle2, MoreHorizontal, Package, Plus, Search } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useMemo, useState } from 'react'

function isWorkerOrderProduct(product: Product): boolean {
	return !product.supplier || product.supplier.trim() === ''
}

/** Short readable unit next to quantities (boxes → box, packets → packet) */
function formatUnitLabel(unit: string): string {
	const labels: Record<string, string> = {
		kg: 'kg',
		g: 'g',
		l: 'L',
		ml: 'ml',
		pieces: 'pcs',
		boxes: 'box',
		bottles: 'bottle',
		cans: 'can',
		packets: 'packet',
	}
	return labels[unit] || unit
}

export default function EditorStockList() {
	const t = useTranslations('editor.stock')
	const tp = useTranslations('editor.products')
	const [search, setSearch] = useState('')
	const [qtyById, setQtyById] = useState<Record<string, string>>({})
	const [addingId, setAddingId] = useState<string | null>(null)
	const [togglingId, setTogglingId] = useState<string | null>(null)

	const { data, isLoading } = useProductsList({ active: 'all' })
	const addStockMutation = useAddProductStock()
	const toggleStatusMutation = useToggleProductStatus()

	const allProducts = useMemo(
		() => (data?.products ?? []).filter(isWorkerOrderProduct),
		[data?.products],
	)

	const query = search.trim().toLowerCase()
	const isSearching = query.length > 0

	const searchResults = useMemo(() => {
		if (!isSearching) return []
		return allProducts.filter(
			product =>
				product.name.toLowerCase().includes(query) ||
				product.category.toLowerCase().includes(query),
		)
	}, [allProducts, isSearching, query])

	const stockStats = useMemo(() => {
		return allProducts
			.filter(product => (product.amount ?? 0) > 0 || !product.isActive)
			.sort((a, b) => {
				const aSold = a.isActive ? 1 : 0
				const bSold = b.isActive ? 1 : 0
				if (aSold !== bSold) return aSold - bSold
				return (
					(b.amount ?? 0) - (a.amount ?? 0) || a.name.localeCompare(b.name)
				)
			})
	}, [allProducts])

	const handleAdd = (product: Product) => {
		const raw = qtyById[product._id] ?? ''
		const quantity = Number(raw)
		if (!Number.isFinite(quantity) || quantity <= 0) return

		setAddingId(product._id)
		addStockMutation.mutate(
			{ id: product._id, quantity },
			{
				onSettled: () => {
					setAddingId(null)
					setQtyById(prev => ({ ...prev, [product._id]: '' }))
				},
			},
		)
	}

	const handleToggleSoldOut = (product: Product) => {
		setTogglingId(product._id)
		toggleStatusMutation.mutate(product._id, {
			onSettled: () => setTogglingId(null),
		})
	}

	const productMenu = (product: Product) => (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					type="button"
					variant="ghost"
					size="sm"
					className="h-7 w-7 p-0 shrink-0"
					disabled={togglingId === product._id}
					aria-label={t('options')}
				>
					<MoreHorizontal className="h-4 w-4" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				{product.isActive ? (
					<DropdownMenuItem
						onClick={() => handleToggleSoldOut(product)}
						className="text-amber-800"
					>
						<Ban className="h-4 w-4 mr-2" />
						{t('markSoldOut')}
					</DropdownMenuItem>
				) : (
					<DropdownMenuItem
						onClick={() => handleToggleSoldOut(product)}
						className="text-green-800"
					>
						<CheckCircle2 className="h-4 w-4 mr-2" />
						{t('markAvailable')}
					</DropdownMenuItem>
				)}
			</DropdownMenuContent>
		</DropdownMenu>
	)

	return (
		<div className="space-y-4 sm:space-y-6">
			<section className="space-y-2 sm:space-y-3">
				<div className="relative">
					<Search className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400 pointer-events-none" />
					<Input
						value={search}
						onChange={e => setSearch(e.target.value)}
						placeholder={t('searchPlaceholder')}
						className="h-10 sm:h-12 pl-9 sm:pl-11 text-sm sm:text-base"
						autoComplete="off"
						autoFocus
					/>
				</div>

				{!isSearching && (
					<p className="text-xs sm:text-sm text-gray-500 text-center px-2">
						{t('searchHint')}
					</p>
				)}

				{isSearching && isLoading && (
					<p className="text-xs sm:text-sm text-gray-500 py-4 text-center">
						{t('loading')}
					</p>
				)}

				{isSearching && !isLoading && searchResults.length === 0 && (
					<p className="text-xs sm:text-sm text-gray-500 py-4 text-center">
						{t('noProducts')}
					</p>
				)}

				{isSearching && !isLoading && searchResults.length > 0 && (
					<ul className="space-y-2 sm:space-y-3">
						{searchResults.map(product => {
							const stock = product.amount ?? 0
							const qtyValue = qtyById[product._id] ?? ''
							const canAdd =
								Number(qtyValue) > 0 &&
								addingId !== product._id &&
								!addStockMutation.isPending

							return (
								<li
									key={product._id}
									className={`rounded-lg border bg-white p-2.5 sm:p-3.5 space-y-2 sm:space-y-3 ${
										product.isActive
											? 'border-gray-200'
											: 'border-amber-200 bg-amber-50/40'
									}`}
								>
									<div className="flex items-start justify-between gap-2">
										<div className="min-w-0 flex-1">
											<div className="flex items-center gap-1.5 flex-wrap">
												<p className="text-sm sm:text-base font-semibold text-gray-900 leading-snug break-words">
													{product.name}
												</p>
												{!product.isActive && (
													<span className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium bg-amber-100 text-amber-800">
														{tp('soldOut')}
													</span>
												)}
											</div>
										</div>
										<div className="flex items-start gap-0.5 shrink-0">
											<div className="text-right">
												<p className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wide">
													{t('inStock')}
												</p>
												<p
													className={`text-base sm:text-lg font-bold tabular-nums leading-tight ${
														stock <= 0 ? 'text-amber-700' : 'text-gray-900'
													}`}
												>
													{stock}{' '}
													<span className="text-xs sm:text-sm font-semibold text-gray-500">
														{formatUnitLabel(product.unit)}
													</span>
												</p>
											</div>
											{productMenu(product)}
										</div>
									</div>

									<div className="flex gap-1.5 sm:gap-2 items-center">
										<div className="relative flex-1 min-w-0">
											<Input
												type="number"
												inputMode="decimal"
												min={0}
												step="any"
												value={qtyValue}
												onChange={e =>
													setQtyById(prev => ({
														...prev,
														[product._id]: e.target.value,
													}))
												}
												placeholder={t('qtyPlaceholder')}
												className="h-9 sm:h-10 text-sm pr-14"
												onKeyDown={e => {
													if (e.key === 'Enter') {
														e.preventDefault()
														handleAdd(product)
													}
												}}
											/>
											<span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-500">
												{formatUnitLabel(product.unit)}
											</span>
										</div>
										<Button
											type="button"
											onClick={() => handleAdd(product)}
											disabled={!canAdd}
											className="h-9 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm bg-blue-600 hover:bg-blue-700 text-white shrink-0"
										>
											{addingId === product._id ? (
												t('adding')
											) : (
												<>
													<Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-0.5 sm:mr-1" />
													{t('add')}
												</>
											)}
										</Button>
									</div>
								</li>
							)
						})}
					</ul>
				)}
			</section>

			<section className="space-y-2 sm:space-y-3">
				<div className="flex items-center justify-between gap-2">
					<h3 className="text-sm sm:text-base font-semibold text-gray-900 flex items-center gap-1.5">
						<Package className="h-4 w-4 text-amber-600" />
						{t('statsTitle')}
					</h3>
					{!isLoading && (
						<span className="text-xs sm:text-sm font-medium text-gray-600 tabular-nums">
							{t('statsWithStock', { count: stockStats.length })}
						</span>
					)}
				</div>

				{isLoading ? (
					<p className="text-xs sm:text-sm text-gray-500 py-3 text-center">
						{t('loading')}
					</p>
				) : stockStats.length === 0 ? (
					<div className="rounded-lg border border-dashed border-gray-200 bg-gray-50/80 px-3 py-5 text-center">
						<p className="text-xs sm:text-sm text-gray-600">{t('statsEmpty')}</p>
					</div>
				) : (
					<ul className="rounded-lg border border-gray-200 bg-white divide-y divide-gray-100 overflow-hidden">
						{stockStats.map(product => (
							<li
								key={product._id}
								className={`flex items-center justify-between gap-2 px-3 py-2 sm:px-4 sm:py-3 ${
									!product.isActive ? 'bg-amber-50/50' : ''
								}`}
							>
								<div className="min-w-0 flex-1">
									<div className="flex items-center gap-1.5 min-w-0">
										<p className="text-sm font-medium text-gray-900 truncate">
											{product.name}
										</p>
										{!product.isActive && (
											<span className="shrink-0 inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium bg-amber-100 text-amber-800">
												{tp('soldOut')}
											</span>
										)}
									</div>
								</div>
								<div className="flex items-center gap-0.5 shrink-0">
									<p className="text-sm sm:text-base font-bold tabular-nums text-gray-900">
										{product.amount ?? 0}{' '}
										<span className="text-xs font-semibold text-gray-500">
											{formatUnitLabel(product.unit)}
										</span>
									</p>
									{productMenu(product)}
								</div>
							</li>
						))}
					</ul>
				)}
			</section>
		</div>
	)
}
