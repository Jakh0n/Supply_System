import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'

interface OrdersHeaderProps {
	onDownloadPDF: () => void
	selectedDate: string
}

const OrdersHeader: React.FC<OrdersHeaderProps> = ({
	onDownloadPDF,
	selectedDate,
}) => {
	return (
		<div className='flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4'>
			<div>
				<h1 className='text-xl sm:text-2xl font-bold text-gray-900'>
					Orders Management
				</h1>
				<p className='mt-1 sm:mt-2 text-sm sm:text-base text-gray-600'>
					Manage and track all restaurant supply orders
				</p>
			</div>
			<Button
				onClick={onDownloadPDF}
				disabled={!selectedDate}
				variant='outline'
				size='sm'
				className='w-full sm:w-auto'
			>
				<Download className='h-4 w-4 mr-2' />
				Download PDF
			</Button>
		</div>
	)
}

export default OrdersHeader
