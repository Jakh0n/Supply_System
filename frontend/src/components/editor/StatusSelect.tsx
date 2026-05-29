'use client'

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { OrderStatus } from '@/types'
import { useTranslations } from 'next-intl'
import { ORDER_STATUS_OPTIONS } from './orderStatus'

interface StatusSelectProps {
	value: OrderStatus
	onValueChange: (value: OrderStatus) => void
	className?: string
}

export default function StatusSelect({
	value,
	onValueChange,
	className,
}: StatusSelectProps) {
	const t = useTranslations('editor.status')

	return (
		<Select value={value} onValueChange={onValueChange}>
			<SelectTrigger className={className}>
				<SelectValue placeholder={t('pending')} />
			</SelectTrigger>
			<SelectContent>
				{ORDER_STATUS_OPTIONS.map(option => (
					<SelectItem key={option.value} value={option.value}>
						{t(option.value)}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	)
}
