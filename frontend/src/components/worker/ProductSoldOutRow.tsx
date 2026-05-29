'use client'

import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import { ReactNode } from 'react'

interface ProductSoldOutRowProps {
	available: boolean
	children: ReactNode
	controls?: ReactNode
	className?: string
}

export function ProductSoldOutRow({
	available,
	children,
	controls,
	className,
}: ProductSoldOutRowProps) {
	const t = useTranslations('worker.products')

	return (
		<div
			className={cn(
				className,
				!available &&
					'border-red-200 bg-red-50/40 ring-1 ring-red-100'
			)}
		>
			{!available && (
				<div className='mb-2 flex justify-center sm:justify-start'>
					<span className='text-xs font-semibold text-red-800 bg-red-100 border border-red-300 rounded-md px-2.5 py-1'>
						{t('outOfStock')}
					</span>
				</div>
			)}
			<div className={cn(!available && 'opacity-70')}>{children}</div>
			{available ? controls : null}
		</div>
	)
}

export function ProductSoldOutInlineLabel() {
	const t = useTranslations('worker.products')

	return (
		<span className='text-xs font-semibold text-red-800 bg-red-100 border border-red-300 rounded-md px-2 py-1 whitespace-nowrap'>
			{t('outOfStock')}
		</span>
	)
}
