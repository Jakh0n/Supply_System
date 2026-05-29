import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { OrderStatus } from '@/types'
import { ORDER_STATUS_OPTIONS } from './constants'

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
	return (
		<Select value={value} onValueChange={onValueChange}>
			<SelectTrigger className={className}>
				<SelectValue placeholder='Select status' />
			</SelectTrigger>
			<SelectContent>
				{ORDER_STATUS_OPTIONS.map(option => (
					<SelectItem key={option.value} value={option.value}>
						{option.label}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	)
}
