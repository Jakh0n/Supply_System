import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table'
import { formatDate } from '@/lib/formatDate'
import { Order } from '@/types'

interface OrderDetailsDialogProps {
	order: Order | null
	open: boolean
	onOpenChange: (open: boolean) => void
}

export default function OrderDetailsDialog({
	order,
	open,
	onOpenChange,
}: OrderDetailsDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className='w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto mx-auto'>
				<DialogHeader>
					<DialogTitle className='text-lg sm:text-xl'>
						Order Details - {order?.orderNumber}
					</DialogTitle>
				</DialogHeader>
				{order && (
					<div className='space-y-6'>
						<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
							<div>
								<h3 className='font-semibold mb-2 text-sm sm:text-base'>
									Order Information
								</h3>
								<div className='space-y-1 text-sm'>
									<p>
										<strong>Branch:</strong> {order.branch}
									</p>
									<p>
										<strong>Requested Date:</strong>{' '}
										{formatDate(order.requestedDate)}
									</p>
									<p>
										<strong>Status:</strong>{' '}
										<span className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800'>
											{order.status}
										</span>
									</p>
								</div>
							</div>
							<div>
								<h3 className='font-semibold mb-2 text-sm sm:text-base'>
									Processing Information
								</h3>
								<div className='space-y-1 text-sm'>
									{order.processedBy && (
										<p>
											<strong>Processed By:</strong>{' '}
											{order.processedBy.username}
										</p>
									)}
									{order.processedAt && (
										<p>
											<strong>Processed At:</strong>{' '}
											{formatDate(order.processedAt)}
										</p>
									)}
								</div>
							</div>
						</div>

						<div>
							<h3 className='font-semibold mb-2 text-sm sm:text-base'>
								Order Items
							</h3>
							<div className='overflow-x-auto -mx-4 sm:mx-0'>
								<Table className='min-w-full'>
									<TableHeader>
										<TableRow>
											<TableHead className='text-xs px-2 sm:px-4'>
												Product
											</TableHead>
											<TableHead className='text-xs px-2 sm:px-4 hidden sm:table-cell'>
												Category
											</TableHead>
											<TableHead className='text-xs px-2 sm:px-4'>
												Qty
											</TableHead>
											<TableHead className='text-xs px-2 sm:px-4 hidden sm:table-cell'>
												Unit
											</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{order.items.map((item, index) => (
											<TableRow
												key={item.product?._id || `deleted-${index}`}
											>
												<TableCell className='text-sm px-2 sm:px-4'>
													{item.product?.name || 'Product Deleted'}
												</TableCell>
												<TableCell className='text-sm px-2 sm:px-4 hidden sm:table-cell'>
													{item.product?.category || '-'}
												</TableCell>
												<TableCell className='text-sm px-2 sm:px-4'>
													{item.quantity}
												</TableCell>
												<TableCell className='text-sm px-2 sm:px-4 hidden sm:table-cell'>
													{item.product?.unit || 'unit'}
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</div>
						</div>

						{order.notes && (
							<div>
								<h3 className='font-semibold mb-2 text-sm sm:text-base'>
									Order Notes
								</h3>
								<p className='text-sm text-gray-700 bg-gray-50 p-3 rounded'>
									{order.notes}
								</p>
							</div>
						)}

						{order.adminNotes && (
							<div>
								<h3 className='font-semibold mb-2 text-sm sm:text-base'>
									Admin Notes
								</h3>
								<p className='text-sm text-gray-700 bg-blue-50 p-3 rounded border border-blue-200'>
									{order.adminNotes}
								</p>
							</div>
						)}
					</div>
				)}
			</DialogContent>
		</Dialog>
	)
}
