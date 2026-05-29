import { formatDate } from '@/lib/formatDate'
import { Order } from '@/types'

function escapeCsvField(field: string | number): string {
	const str = String(field)
	const escaped = str.replace(/"/g, '""')
	const needsPrefix =
		/^[=+\-@]/.test(escaped) || escaped.includes(',') || escaped.includes('"')
	const safe = needsPrefix && /^[=+\-@]/.test(escaped) ? `'${escaped}` : escaped
	return `"${safe}"`
}

export function generateOrdersCsv(orders: Order[]): string {
	const headers = [
		'Order Number',
		'Branch',
		'Requested Date',
		'Status',
		'Items Count',
		'Product Names',
		'Total Quantities',
		'Processed By',
		'Processed At',
		'Order Notes',
		'Admin Notes',
	]

	const rows = orders.map(order => [
		order.orderNumber,
		order.branch,
		formatDate(order.requestedDate),
		order.status,
		order.items.length,
		order.items
			.map(item => item.product?.name || 'Product Deleted')
			.join('; '),
		order.items
			.map(item => `${item.quantity} ${item.product?.unit || 'unit'}`)
			.join('; '),
		order.processedBy?.username || 'Not processed',
		order.processedAt ? formatDate(order.processedAt) : 'Not processed',
		order.notes || '',
		order.adminNotes || '',
	])

	return [headers, ...rows].map(row => row.map(escapeCsvField).join(',')).join('\n')
}

export function downloadOrdersCsv(orders: Order[], filename?: string): void {
	const csvContent = generateOrdersCsv(orders)
	const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
	const link = document.createElement('a')
	const url = URL.createObjectURL(blob)

	link.setAttribute('href', url)
	link.setAttribute(
		'download',
		filename ?? `orders_${new Date().toISOString().split('T')[0]}.csv`
	)
	link.style.visibility = 'hidden'
	document.body.appendChild(link)
	link.click()
	document.body.removeChild(link)
	URL.revokeObjectURL(url)
}
