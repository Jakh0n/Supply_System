import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Order, OrderStatus } from '@/types'
import { CheckCircle, Clock, Package, Truck, XCircle } from 'lucide-react'

// Helper function to format date
const formatDate = (dateString: string): string => {
	return new Date(dateString).toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
	})
}

// Helper function to format Korean Won
const formatKRW = (price: number): string => {
	return new Intl.NumberFormat('ko-KR', {
		style: 'currency',
		currency: 'KRW',
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(price)
}

// Helper function to get status color and icon
const getStatusDisplay = (status: OrderStatus) => {
	switch (status) {
		case 'pending':
			return {
				color: 'bg-yellow-100 text-yellow-800',
				icon: <Clock className='h-4 w-4' />,
				label: 'Pending',
			}
		case 'approved':
			return {
				color: 'bg-blue-100 text-blue-800',
				icon: <CheckCircle className='h-4 w-4' />,
				label: 'Approved',
			}
		case 'rejected':
			return {
				color: 'bg-red-100 text-red-800',
				icon: <XCircle className='h-4 w-4' />,
				label: 'Rejected',
			}
		case 'completed':
			return {
				color: 'bg-green-100 text-green-800',
				icon: <Truck className='h-4 w-4' />,
				label: 'Completed',
			}
		default:
			return {
				color: 'bg-gray-100 text-gray-800',
				icon: <Package className='h-4 w-4' />,
				label: status,
			}
	}
}

interface OrderDetailDialogProps {
	isOpen: boolean
	onClose: () => void
	order: Order | null
}

const OrderDetailDialog: React.FC<OrderDetailDialogProps> = ({
	isOpen,
	onClose,
	order,
}) => {
	if (!order) return null

	const getTotalValue = (order: Order): number => {
		return order.items.reduce(
			(total, item) => total + item.quantity * item.product.price,
			0
		)
	}

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className='sm:max-w-[600px] max-h-[90vh] overflow-y-auto'>
				<DialogHeader>
					<DialogTitle className='text-lg sm:text-xl'>
						Order Details
					</DialogTitle>
					<DialogDescription>Order {order.orderNumber}</DialogDescription>
				</DialogHeader>

				<div className='space-y-6'>
					{/* Order Info */}
					<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
						<div className='space-y-2'>
							<Label className='text-sm font-medium text-gray-500'>
								Worker
							</Label>
							<p className='text-sm font-medium'>{order.worker.username}</p>
						</div>
						<div className='space-y-2'>
							<Label className='text-sm font-medium text-gray-500'>
								Branch
							</Label>
							<p className='text-sm font-medium'>{order.branch}</p>
						</div>
						<div className='space-y-2'>
							<Label className='text-sm font-medium text-gray-500'>
								Requested Date
							</Label>
							<p className='text-sm'>{formatDate(order.requestedDate)}</p>
						</div>
						<div className='space-y-2'>
							<Label className='text-sm font-medium text-gray-500'>
								Status
							</Label>
							<span
								className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
									getStatusDisplay(order.status).color
								}`}
							>
								{getStatusDisplay(order.status).icon}
								<span className='ml-1'>
									{getStatusDisplay(order.status).label}
								</span>
							</span>
						</div>
					</div>

					{/* Order Items */}
					<div className='space-y-3'>
						<Label className='text-sm font-medium text-gray-500'>
							Items ({order.items.length})
						</Label>
						<div className='space-y-3 max-h-60 overflow-y-auto'>
							{order.items.map(item => (
								<div
									key={item.product._id}
									className='flex flex-col sm:flex-row sm:justify-between sm:items-start p-3 bg-gray-50 rounded-lg space-y-2 sm:space-y-0'
								>
									<div className='flex-1'>
										<p className='font-medium text-sm'>{item.product.name}</p>
										<p className='text-sm text-gray-500'>
											{item.quantity} {item.product.unit} ×{' '}
											{formatKRW(item.product.price)}
										</p>
										{item.notes && (
											<p className='text-sm text-gray-400 italic mt-1'>
												Note: {item.notes}
											</p>
										)}
									</div>
									<div className='text-left sm:text-right'>
										<p className='font-medium text-sm'>
											{formatKRW(item.quantity * item.product.price)}
										</p>
									</div>
								</div>
							))}
						</div>
						<div className='mt-4 pt-3 border-t'>
							<div className='flex justify-between items-center font-medium'>
								<span>Total Value:</span>
								<span className='text-lg'>
									{formatKRW(getTotalValue(order))}
								</span>
							</div>
						</div>
					</div>

					{/* Notes */}
					{order.notes && (
						<div className='space-y-2'>
							<Label className='text-sm font-medium text-gray-500'>
								Worker Notes
							</Label>
							<div className='text-sm p-3 bg-gray-50 rounded-lg'>
								{order.notes}
							</div>
						</div>
					)}

					{/* Admin Notes */}
					{order.adminNotes && (
						<div className='space-y-2'>
							<Label className='text-sm font-medium text-gray-500'>
								Admin Notes
							</Label>
							<div className='text-sm p-3 bg-blue-50 rounded-lg border border-blue-200'>
								{order.adminNotes}
							</div>
						</div>
					)}

					{/* Processing Info */}
					{order.processedBy && (
						<div className='grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t'>
							<div className='space-y-2'>
								<Label className='text-sm font-medium text-gray-500'>
									Processed By
								</Label>
								<p className='text-sm'>{order.processedBy.username}</p>
							</div>
							<div className='space-y-2'>
								<Label className='text-sm font-medium text-gray-500'>
									Processed At
								</Label>
								<p className='text-sm'>
									{order.processedAt && formatDate(order.processedAt)}
								</p>
							</div>
						</div>
					)}
				</div>
			</DialogContent>
		</Dialog>
	)
}

export default OrderDetailDialog
