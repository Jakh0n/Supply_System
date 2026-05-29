import { escapeHtml } from '@/lib/escapeHtml'
import { formatDate } from '@/lib/formatDate'
import { Order } from '@/types'

export function buildOrderPrintHtml(order: Order): string {
	const itemsRows = order.items
		.map(
			item => `
		<tr>
			<td>${escapeHtml(item.product?.name || 'Product Deleted')}</td>
			<td>${escapeHtml(item.product?.category || '-')}</td>
			<td>${item.quantity}</td>
			<td>${escapeHtml(item.product?.unit || 'unit')}</td>
			<td>-</td>
		</tr>
	`
		)
		.join('')

	return `
		<!DOCTYPE html>
		<html>
		<head>
			<title>Order ${escapeHtml(order.orderNumber)}</title>
			<style>
				body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.4; }
				.header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
				.order-info { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
				.section { margin-bottom: 15px; }
				.section h3 { margin-bottom: 5px; color: #333; font-size: 16px; }
				table { width: 100%; border-collapse: collapse; margin-top: 10px; }
				th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
				th { background-color: #f5f5f5; font-weight: bold; }
				.status { padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 12px; }
				.status.pending { background-color: #fef3c7; color: #92400e; }
				.status.approved { background-color: #d1fae5; color: #065f46; }
				.status.rejected { background-color: #fee2e2; color: #991b1b; }
				.status.completed { background-color: #dbeafe; color: #1e40af; }
				@media print { body { margin: 0; } .no-print { display: none; } }
				.print-button { margin: 20px 0; text-align: center; }
				.print-btn {
					background-color: #007bff; color: white; border: none;
					padding: 10px 20px; border-radius: 4px; cursor: pointer; font-size: 14px;
				}
				.print-btn:hover { background-color: #0056b3; }
			</style>
		</head>
		<body>
			<div class="print-button no-print">
				<button class="print-btn" onclick="window.print()">Print This Order</button>
				<button class="print-btn" onclick="window.close()" style="margin-left: 10px; background-color: #6c757d;">Close</button>
			</div>

			<div class="header">
				<h1>Order Receipt</h1>
				<h2>Order #${escapeHtml(order.orderNumber)}</h2>
			</div>

			<div class="order-info">
				<div>
					<div class="section">
						<h3>Order Information</h3>
						<p><strong>Branch:</strong> ${escapeHtml(order.branch)}</p>
						<p><strong>Requested Date:</strong> ${escapeHtml(formatDate(order.requestedDate))}</p>
						<p><strong>Status:</strong> <span class="status ${escapeHtml(order.status)}">${escapeHtml(order.status.toUpperCase())}</span></p>
					</div>
				</div>
				<div>
					<div class="section">
						<h3>Processing Information</h3>
						${
							order.processedBy
								? `<p><strong>Processed By:</strong> ${escapeHtml(order.processedBy.username)}</p>`
								: '<p>Not yet processed</p>'
						}
						${
							order.processedAt
								? `<p><strong>Processed At:</strong> ${escapeHtml(formatDate(order.processedAt))}</p>`
								: ''
						}
					</div>
				</div>
			</div>

			<div class="section">
				<h3>Order Items</h3>
				<table>
					<thead>
						<tr>
							<th>Product</th>
							<th>Category</th>
							<th>Quantity</th>
							<th>Unit</th>
							<th>Notes</th>
						</tr>
					</thead>
					<tbody>${itemsRows}</tbody>
				</table>
			</div>

			${
				order.notes
					? `<div class="section"><h3>Order Notes</h3><p style="background-color: #f9f9f9; padding: 10px; border-radius: 4px;">${escapeHtml(order.notes)}</p></div>`
					: ''
			}

			${
				order.adminNotes
					? `<div class="section"><h3>Admin Notes</h3><p style="background-color: #eff6ff; padding: 10px; border-radius: 4px;">${escapeHtml(order.adminNotes)}</p></div>`
					: ''
			}

			<div style="margin-top: 40px; text-align: center; color: #666; font-size: 12px;">
				<p>Printed on ${escapeHtml(new Date().toLocaleString())}</p>
			</div>
		</body>
		</html>
	`
}

export function openOrderPrintWindow(order: Order): boolean {
	const printWindow = window.open('', '_blank', 'width=800,height=600')
	if (!printWindow) {
		return false
	}

	printWindow.document.write(buildOrderPrintHtml(order))
	printWindow.document.close()
	setTimeout(() => printWindow.focus(), 100)
	return true
}
