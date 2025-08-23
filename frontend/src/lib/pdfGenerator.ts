import { Order } from '@/types'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

export interface PDFOptions {
	title?: string
	orientation?: 'portrait' | 'landscape'
	format?: 'a4' | 'letter'
	margin?: number
	hasOrders?: boolean
	orderCount?: number
}

export interface BranchReportData {
	branch: string
	totalOrders: number
	totalValue: number
	avgOrderValue: number
	pendingOrders: number
	weeklyTrend: number
}

type OrderItem = {
	product: {
		_id: string
		name: string
		category: string // Allow both legacy and new categories
		unit: string
		price: number
	}
	quantity: number
	notes?: string
}

export class PDFGenerator {
	private static formatDate(dateString: string): string {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		})
	}

	private static formatKRW(amount: number): string {
		return new Intl.NumberFormat('ko-KR', {
			style: 'currency',
			currency: 'KRW',
			minimumFractionDigits: 0,
		}).format(amount)
	}

	private static getCategoryDisplayName(category: string): string {
		// Handle both new and legacy categories
		const categoryMap: Record<string, string> = {
			// New categories
			'frozen-products': 'Frozen Products',
			'main-products': 'Main Products',
			'desserts-drinks': 'Desserts and Drinks',
			'packaging-materials': 'Packaging Materials',
			'cleaning-materials': 'Cleaning Materials',

			// Legacy categories mapping to new ones
			food: 'Main Products',
			beverages: 'Desserts and Drinks',
			cleaning: 'Cleaning Materials',
			equipment: 'Packaging Materials',
			packaging: 'Packaging Materials',
			other: 'Main Products',
		}
		return categoryMap[category] || 'Main Products'
	}

	private static getCategorySortOrder(category: string): number {
		// Map categories to display names first, then get sort order
		const displayName = this.getCategoryDisplayName(category)
		const sortOrder: Record<string, number> = {
			'Frozen Products': 1,
			'Main Products': 2,
			'Desserts and Drinks': 3,
			'Packaging Materials': 4,
			'Cleaning Materials': 5,
		}
		return sortOrder[displayName] || 6
	}

	private static groupItemsByCategory(
		items: OrderItem[]
	): Record<string, OrderItem[]> {
		const grouped = items.reduce((acc, item) => {
			const category = item.product.category
			const categoryName = this.getCategoryDisplayName(category)
			if (!acc[categoryName]) {
				acc[categoryName] = []
			}
			acc[categoryName].push(item)
			return acc
		}, {} as Record<string, OrderItem[]>)

		// Sort categories by predefined order
		const sortedGroups: Record<string, OrderItem[]> = {}

		// Find the original category key for each display name and sort by order
		const categoryEntries = Object.entries(grouped)
			.map(([categoryName, items]) => {
				// Get sort order based on the display name
				const sortOrder = this.getCategorySortOrder(categoryName)
				return {
					categoryName,
					items: items.sort((a, b) =>
						a.product.name.localeCompare(b.product.name)
					),
					sortOrder,
				}
			})
			.sort((a, b) => a.sortOrder - b.sortOrder)

		// Build the sorted groups object
		categoryEntries.forEach(({ categoryName, items }) => {
			sortedGroups[categoryName] = items
		})

		return sortedGroups
	}

	private static calculateProductsSummary(orders: Order[]) {
		const productMap = new Map<
			string,
			{
				name: string
				unit: string
				category: string
				totalQuantity: number
				totalValue: number
			}
		>()

		const categoryMap = new Map<
			string,
			{
				quantity: number
				value: number
			}
		>()

		let totalQuantity = 0
		let totalValue = 0

		// Process all orders and their items
		orders.forEach(order => {
			order.items.forEach(item => {
				const productId = item.product._id
				const quantity = item.quantity
				const value = quantity * item.product.price
				const categoryDisplayName = this.getCategoryDisplayName(
					item.product.category
				)

				totalQuantity += quantity
				totalValue += value

				// Update product summary
				if (productMap.has(productId)) {
					const existing = productMap.get(productId)!
					existing.totalQuantity += quantity
					existing.totalValue += value
				} else {
					productMap.set(productId, {
						name: item.product.name,
						unit: item.product.unit,
						category: categoryDisplayName,
						totalQuantity: quantity,
						totalValue: value,
					})
				}

				// Update category summary
				if (categoryMap.has(categoryDisplayName)) {
					const existing = categoryMap.get(categoryDisplayName)!
					existing.quantity += quantity
					existing.value += value
				} else {
					categoryMap.set(categoryDisplayName, {
						quantity: quantity,
						value: value,
					})
				}
			})
		})

		// Convert maps to arrays and sort
		const topProducts = Array.from(productMap.values()).sort(
			(a, b) => b.totalQuantity - a.totalQuantity
		)

		const byCategory = Object.fromEntries(categoryMap)

		// Calculate average order value
		const averageOrderValue = orders.length > 0 ? totalValue / orders.length : 0

		return {
			totalQuantity,
			totalValue,
			averageOrderValue,
			byCategory,
			topProducts,
		}
	}

	private static calculateSingleOrderSummary(order: Order) {
		const categoryMap = new Map<
			string,
			{
				quantity: number
				value: number
			}
		>()

		let totalQuantity = 0
		let totalValue = 0

		// Process order items
		order.items.forEach(item => {
			const quantity = item.quantity
			const value = quantity * item.product.price
			const categoryDisplayName = this.getCategoryDisplayName(
				item.product.category
			)

			totalQuantity += quantity
			totalValue += value

			// Update category summary
			if (categoryMap.has(categoryDisplayName)) {
				const existing = categoryMap.get(categoryDisplayName)!
				existing.quantity += quantity
				existing.value += value
			} else {
				categoryMap.set(categoryDisplayName, {
					quantity: quantity,
					value: value,
				})
			}
		})

		const byCategory = Object.fromEntries(categoryMap)

		return {
			totalQuantity,
			totalValue,
			byCategory,
		}
	}

	static async generateOrdersPDF(
		orders: Order[],
		options: PDFOptions = {}
	): Promise<void> {
		const {
			title = 'Orders Report',
			orientation = 'portrait',
			format = 'a4',
			margin = 20,
		} = options

		// Create PDF instance
		const pdf = new jsPDF({
			orientation,
			unit: 'mm',
			format,
		})

		const pageHeight = pdf.internal.pageSize.getHeight()
		let yPosition = margin

		// Helper function to check if we need a new page
		const checkNewPage = (requiredHeight: number) => {
			if (yPosition + requiredHeight > pageHeight - margin) {
				pdf.addPage()
				yPosition = margin
				return true
			}
			return false
		}

		// Header
		pdf.setFontSize(20)
		pdf.setFont('helvetica', 'bold')
		pdf.text(title, margin, yPosition)
		yPosition += 15

		pdf.setFontSize(12)
		pdf.setFont('helvetica', 'normal')
		pdf.text(`Generated: ${new Date().toLocaleDateString()}`, margin, yPosition)
		yPosition += 10

		pdf.text(`Total Orders: ${orders.length}`, margin, yPosition)
		yPosition += 15

		// Orders summary by status
		const statusSummary = orders.reduce((acc, order) => {
			acc[order.status] = (acc[order.status] || 0) + 1
			return acc
		}, {} as Record<string, number>)

		pdf.setFont('helvetica', 'bold')
		pdf.text('Status Summary:', margin, yPosition)
		yPosition += 8

		pdf.setFont('helvetica', 'normal')
		Object.entries(statusSummary).forEach(([status, count]) => {
			pdf.text(`${status.toUpperCase()}: ${count}`, margin + 10, yPosition)
			yPosition += 6
		})
		yPosition += 10

		// Products summary
		const productsSummary = this.calculateProductsSummary(orders)

		checkNewPage(80) // Ensure enough space for products summary

		pdf.setFont('helvetica', 'bold')
		pdf.text('Products Summary:', margin, yPosition)
		yPosition += 10

		// Total quantities and values
		pdf.setFont('helvetica', 'normal')
		pdf.text(
			`Total Products Ordered: ${productsSummary.totalQuantity} items`,
			margin + 10,
			yPosition
		)
		yPosition += 6
		pdf.text(
			`Total Order Value: ${this.formatKRW(productsSummary.totalValue)}`,
			margin + 10,
			yPosition
		)
		yPosition += 6
		pdf.text(
			`Average Order Value: ${this.formatKRW(
				productsSummary.averageOrderValue
			)}`,
			margin + 10,
			yPosition
		)
		yPosition += 10

		// Summary by category
		pdf.setFont('helvetica', 'bold')
		pdf.text('By Category:', margin + 10, yPosition)
		yPosition += 8

		pdf.setFont('helvetica', 'normal')
		Object.entries(productsSummary.byCategory).forEach(
			([category, summary]) => {
				checkNewPage(6)
				pdf.text(
					`• ${category}: ${summary.quantity} items (${this.formatKRW(
						summary.value
					)})`,
					margin + 20,
					yPosition
				)
				yPosition += 6
			}
		)
		yPosition += 5

		// Top 10 most ordered products
		if (productsSummary.topProducts.length > 0) {
			checkNewPage(60) // Ensure space for top products

			pdf.setFont('helvetica', 'bold')
			pdf.text('Top Products (Most Ordered):', margin + 10, yPosition)
			yPosition += 8

			pdf.setFont('helvetica', 'normal')
			productsSummary.topProducts.slice(0, 10).forEach((product, index) => {
				checkNewPage(6)
				pdf.text(
					`${index + 1}. ${product.name}: ${product.totalQuantity} ${
						product.unit
					} (${this.formatKRW(product.totalValue)})`,
					margin + 20,
					yPosition
				)
				yPosition += 6
			})
			yPosition += 10
		}

		// Orders by branch
		const branchSummary = orders.reduce((acc, order) => {
			if (!acc[order.branch]) {
				acc[order.branch] = []
			}
			acc[order.branch].push(order)
			return acc
		}, {} as Record<string, Order[]>)

		pdf.setFont('helvetica', 'bold')
		pdf.text('Orders by Branch:', margin, yPosition)
		yPosition += 10

		Object.entries(branchSummary).forEach(([branch, branchOrders]) => {
			checkNewPage(20)

			pdf.setFont('helvetica', 'bold')
			pdf.setFontSize(14)
			pdf.text(
				`${branch} Branch (${branchOrders.length} orders)`,
				margin,
				yPosition
			)
			yPosition += 10

			pdf.setFontSize(10)
			pdf.setFont('helvetica', 'normal')

			branchOrders.forEach(order => {
				checkNewPage(15)

				// Order header
				pdf.text(`Order: ${order.orderNumber}`, margin + 5, yPosition)
				pdf.text(`Worker: ${order.worker.username}`, margin + 80, yPosition)
				pdf.text(
					`Status: ${order.status.toUpperCase()}`,
					margin + 130,
					yPosition
				)
				yPosition += 6

				pdf.text(
					`Date: ${this.formatDate(order.requestedDate)}`,
					margin + 5,
					yPosition
				)
				pdf.text(`Items: ${order.items.length}`, margin + 80, yPosition)
				yPosition += 8

				// Group items by category and display them organized
				const groupedItems = this.groupItemsByCategory(order.items)
				Object.entries(groupedItems).forEach(([categoryName, items]) => {
					checkNewPage(10)

					// Category header
					pdf.setFont('helvetica', 'bold')
					pdf.text(`${categoryName}:`, margin + 10, yPosition)
					yPosition += 5

					pdf.setFont('helvetica', 'normal')
					// Items in this category
					items.forEach(item => {
						checkNewPage(5)
						pdf.text(
							`  • ${item.product.name} - ${item.quantity} ${item.product.unit}`,
							margin + 15,
							yPosition
						)
						yPosition += 4
					})
					yPosition += 2
				})

				yPosition += 5
			})

			yPosition += 5
		})

		// Save the PDF
		const fileName = `orders-report-${new Date().getTime()}.pdf`
		pdf.save(fileName)
	}

	static async generateOrderDetailPDF(order: Order): Promise<void> {
		const pdf = new jsPDF({
			orientation: 'portrait',
			unit: 'mm',
			format: 'a4',
		})

		const margin = 20
		let yPosition = margin

		// Header
		pdf.setFontSize(18)
		pdf.setFont('helvetica', 'bold')
		pdf.text('Order Details', margin, yPosition)
		yPosition += 15

		// Order info
		pdf.setFontSize(12)
		pdf.setFont('helvetica', 'bold')
		pdf.text(`Order Number: ${order.orderNumber}`, margin, yPosition)
		yPosition += 8

		pdf.setFont('helvetica', 'normal')
		pdf.text(`Worker: ${order.worker.username}`, margin, yPosition)
		yPosition += 6
		pdf.text(`Branch: ${order.branch}`, margin, yPosition)
		yPosition += 6
		pdf.text(
			`Requested Date: ${this.formatDate(order.requestedDate)}`,
			margin,
			yPosition
		)
		yPosition += 6
		pdf.text(`Status: ${order.status.toUpperCase()}`, margin, yPosition)
		yPosition += 6
		pdf.text(`Created: ${this.formatDate(order.createdAt)}`, margin, yPosition)
		yPosition += 15

		// Items header
		pdf.setFont('helvetica', 'bold')
		pdf.text('Order Items (Organized by Category):', margin, yPosition)
		yPosition += 10

		// Group items by category
		const groupedItems = this.groupItemsByCategory(order.items)

		// Display items organized by category
		Object.entries(groupedItems).forEach(([categoryName, items]) => {
			if (yPosition > 240) {
				pdf.addPage()
				yPosition = margin
			}

			// Category header
			pdf.setFont('helvetica', 'bold')
			pdf.setFontSize(12)
			pdf.text(`${categoryName}`, margin, yPosition)
			yPosition += 8

			// Items table headers for this category
			pdf.setFontSize(10)
			pdf.text('Product', margin + 5, yPosition)
			pdf.text('Quantity', margin + 100, yPosition)
			pdf.text('Unit', margin + 130, yPosition)
			yPosition += 2

			// Draw line under headers
			pdf.line(margin, yPosition, margin + 160, yPosition)
			yPosition += 6

			// Items in this category
			pdf.setFont('helvetica', 'normal')
			items.forEach(item => {
				if (yPosition > 250) {
					pdf.addPage()
					yPosition = margin
				}

				pdf.text(item.product.name.substring(0, 30), margin + 5, yPosition)
				pdf.text(item.quantity.toString(), margin + 100, yPosition)
				pdf.text(item.product.unit, margin + 130, yPosition)
				yPosition += 6

				if (item.notes) {
					pdf.setFont('helvetica', 'italic')
					pdf.text(`Note: ${item.notes}`, margin + 10, yPosition)
					pdf.setFont('helvetica', 'normal')
					yPosition += 6
				}
			})
			yPosition += 8 // Space between categories
		})

		yPosition += 10

		// Notes
		if (order.notes) {
			pdf.setFont('helvetica', 'bold')
			pdf.text('Order Notes:', margin, yPosition)
			yPosition += 6
			pdf.setFont('helvetica', 'normal')
			const notes = pdf.splitTextToSize(order.notes, 160)
			pdf.text(notes, margin, yPosition)
			yPosition += notes.length * 5 + 5
		}

		if (order.adminNotes) {
			pdf.setFont('helvetica', 'bold')
			pdf.text('Admin Notes:', margin, yPosition)
			yPosition += 6
			pdf.setFont('helvetica', 'normal')
			const adminNotes = pdf.splitTextToSize(order.adminNotes, 160)
			pdf.text(adminNotes, margin, yPosition)
			yPosition += adminNotes.length * 5
		}

		// Order Summary
		yPosition += 10
		if (yPosition > 240) {
			pdf.addPage()
			yPosition = 20
		}

		const orderSummary = this.calculateSingleOrderSummary(order)

		pdf.setFont('helvetica', 'bold')
		pdf.setFontSize(12)
		pdf.text('Order Summary:', margin, yPosition)
		yPosition += 10

		pdf.setFont('helvetica', 'normal')
		pdf.setFontSize(10)
		pdf.text(
			`Total Items: ${orderSummary.totalQuantity} products`,
			margin + 5,
			yPosition
		)
		yPosition += 6
		pdf.text(
			`Total Value: ${this.formatKRW(orderSummary.totalValue)}`,
			margin + 5,
			yPosition
		)
		yPosition += 10

		// Category breakdown
		pdf.setFont('helvetica', 'bold')
		pdf.text('By Category:', margin + 5, yPosition)
		yPosition += 6

		pdf.setFont('helvetica', 'normal')
		Object.entries(orderSummary.byCategory).forEach(([category, data]) => {
			if (yPosition > 270) {
				pdf.addPage()
				yPosition = 20
			}
			pdf.text(
				`• ${category}: ${data.quantity} items (${this.formatKRW(data.value)})`,
				margin + 10,
				yPosition
			)
			yPosition += 5
		})

		// Save the PDF
		const fileName = `order-${order.orderNumber}-${new Date().getTime()}.pdf`
		pdf.save(fileName)
	}

	static async generateBranchReportPDF(
		branchData: BranchReportData[],
		options: PDFOptions = {}
	): Promise<void> {
		const {
			title = 'Branch Performance Report',
			orientation = 'landscape',
			format = 'a4',
			margin = 20,
			hasOrders = true,
			orderCount = 0,
		} = options

		const pdf = new jsPDF({
			orientation,
			unit: 'mm',
			format,
		})

		const pageHeight = pdf.internal.pageSize.getHeight()
		const pageWidth = pdf.internal.pageSize.getWidth()
		let yPosition = margin

		// Helper function to check if we need a new page
		const checkNewPage = (requiredHeight: number) => {
			if (yPosition + requiredHeight > pageHeight - margin) {
				pdf.addPage()
				yPosition = margin
				return true
			}
			return false
		}

		// Header
		pdf.setFontSize(16)
		pdf.setFont('helvetica', 'bold')
		pdf.text(title, margin, yPosition)
		yPosition += 12

		pdf.setFontSize(10)
		pdf.setFont('helvetica', 'normal')
		pdf.text(`Generated: ${new Date().toLocaleDateString()}`, margin, yPosition)
		yPosition += 8

		// Order status message
		if (!hasOrders || orderCount === 0) {
			pdf.setFont('helvetica', 'bold')
			pdf.setFontSize(12)
			pdf.setTextColor(255, 140, 0) // Orange color for warning
			pdf.text('⚠ No orders found for this period', margin, yPosition)
			yPosition += 10

			pdf.setFont('helvetica', 'normal')
			pdf.setFontSize(10)
			pdf.setTextColor(0, 0, 0) // Reset to black
			pdf.text(
				'This report shows current branch analytics data, but no specific',
				margin,
				yPosition
			)
			yPosition += 6
			pdf.text(
				'orders were found for the selected timeframe.',
				margin,
				yPosition
			)
			yPosition += 15
		} else {
			pdf.text(`Total Orders in Period: ${orderCount}`, margin, yPosition)
			yPosition += 15
		}

		// Branch Performance Table
		pdf.setFont('helvetica', 'bold')
		pdf.setFontSize(12)
		pdf.text('Branch Performance Summary', margin, yPosition)
		yPosition += 10

		if (branchData.length === 0) {
			pdf.setFont('helvetica', 'normal')
			pdf.setFontSize(10)
			pdf.text('No branch data available.', margin, yPosition)
			yPosition += 10
		} else {
			// Table headers
			pdf.setFontSize(9)
			pdf.setFont('helvetica', 'bold')
			const headers = [
				'Branch',
				'Orders',
				'Total Value',
				'Avg Order',
				'Pending',
				'Trend',
			]
			const columnWidths = [40, 20, 30, 30, 20, 20]
			let xPosition = margin

			headers.forEach((header, index) => {
				pdf.text(header, xPosition, yPosition)
				xPosition += columnWidths[index]
			})
			yPosition += 2

			// Header underline
			pdf.line(margin, yPosition, pageWidth - margin, yPosition)
			yPosition += 8

			// Table data
			pdf.setFont('helvetica', 'normal')
			branchData.forEach(branch => {
				checkNewPage(8)
				xPosition = margin

				const rowData = [
					branch.branch,
					branch.totalOrders.toString(),
					this.formatKRW(branch.totalValue),
					this.formatKRW(branch.avgOrderValue),
					branch.pendingOrders.toString(),
					`${branch.weeklyTrend}%`,
				]

				rowData.forEach((data, index) => {
					pdf.text(data, xPosition, yPosition)
					xPosition += columnWidths[index]
				})
				yPosition += 6
			})
		}

		// Summary statistics
		if (branchData.length > 0) {
			yPosition += 10
			checkNewPage(30)

			pdf.setFont('helvetica', 'bold')
			pdf.setFontSize(12)
			pdf.text('Summary Statistics', margin, yPosition)
			yPosition += 10

			pdf.setFont('helvetica', 'normal')
			pdf.setFontSize(10)

			const totalBranches = branchData.length
			const totalOrders = branchData.reduce((sum, b) => sum + b.totalOrders, 0)
			const totalValue = branchData.reduce((sum, b) => sum + b.totalValue, 0)
			const avgOrderValue = totalOrders > 0 ? totalValue / totalOrders : 0
			const totalPending = branchData.reduce(
				(sum, b) => sum + b.pendingOrders,
				0
			)

			pdf.text(`Total Branches: ${totalBranches}`, margin, yPosition)
			yPosition += 6
			pdf.text(`Total Orders: ${totalOrders}`, margin, yPosition)
			yPosition += 6
			pdf.text(`Total Value: ${this.formatKRW(totalValue)}`, margin, yPosition)
			yPosition += 6
			pdf.text(
				`Average Order Value: ${this.formatKRW(avgOrderValue)}`,
				margin,
				yPosition
			)
			yPosition += 6
			pdf.text(`Total Pending Orders: ${totalPending}`, margin, yPosition)
		}

		// Footer note for empty data
		if (!hasOrders || orderCount === 0) {
			checkNewPage(20)
			yPosition += 10
			pdf.setFontSize(8)
			pdf.setTextColor(128, 128, 128) // Gray color
			pdf.text(
				'Note: Branch analytics data reflects overall performance metrics.',
				margin,
				yPosition
			)
			yPosition += 5
			pdf.text(
				'For period-specific data, please select a timeframe with existing orders.',
				margin,
				yPosition
			)
		}

		// Save the PDF
		const fileName = `branch-report-${new Date().getTime()}.pdf`
		pdf.save(fileName)
	}

	static async generateFromHTML(
		element: HTMLElement,
		options: PDFOptions = {}
	): Promise<void> {
		const {
			title = 'Report',
			orientation = 'portrait',
			format = 'a4',
		} = options

		try {
			const canvas = await html2canvas(element, {
				scale: 2,
				useCORS: true,
				allowTaint: true,
			})

			const imgData = canvas.toDataURL('image/png')
			const pdf = new jsPDF({
				orientation,
				unit: 'mm',
				format,
			})

			const pdfWidth = pdf.internal.pageSize.getWidth()
			const pdfHeight = pdf.internal.pageSize.getHeight()
			const imgWidth = canvas.width
			const imgHeight = canvas.height
			const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight)
			const imgX = (pdfWidth - imgWidth * ratio) / 2
			const imgY = 30

			pdf.addImage(
				imgData,
				'PNG',
				imgX,
				imgY,
				imgWidth * ratio,
				imgHeight * ratio
			)

			const fileName = `${title
				.toLowerCase()
				.replace(/\s+/g, '-')}-${new Date().getTime()}.pdf`
			pdf.save(fileName)
		} catch (error) {
			console.error('Error generating PDF from HTML:', error)
			throw new Error('Failed to generate PDF from HTML')
		}
	}

	static async generateWeeklyStatisticsPDF(
		weeklyData: {
			orders: Order[]
			branchStats: BranchReportData[]
			dateRange: { start: string; end: string }
		},
		options: PDFOptions = {}
	): Promise<void> {
		const {
			title = 'Weekly Statistics Report',
			orientation = 'portrait',
			format = 'a4',
			margin = 20,
		} = options

		const pdf = new jsPDF({
			orientation,
			unit: 'mm',
			format,
		})

		const pageHeight = pdf.internal.pageSize.getHeight()
		let yPosition = margin

		// Helper function to check if we need a new page
		const checkNewPage = (requiredHeight: number) => {
			if (yPosition + requiredHeight > pageHeight - margin) {
				pdf.addPage()
				yPosition = margin
				return true
			}
			return false
		}

		// Header
		pdf.setFontSize(18)
		pdf.setFont('helvetica', 'bold')
		pdf.text(title, margin, yPosition)
		yPosition += 15

		pdf.setFontSize(12)
		pdf.setFont('helvetica', 'normal')
		pdf.text(`Generated: ${new Date().toLocaleDateString()}`, margin, yPosition)
		yPosition += 8
		pdf.text(
			`Period: ${weeklyData.dateRange.start} to ${weeklyData.dateRange.end}`,
			margin,
			yPosition
		)
		yPosition += 15

		// Weekly Summary
		pdf.setFont('helvetica', 'bold')
		pdf.setFontSize(14)
		pdf.text('Weekly Summary', margin, yPosition)
		yPosition += 10

		pdf.setFont('helvetica', 'normal')
		pdf.setFontSize(11)

		const totalOrders = weeklyData.orders.length
		const totalValue = weeklyData.orders.reduce(
			(sum, order) =>
				sum +
				order.items.reduce(
					(itemSum, item) => itemSum + item.quantity * item.product.price,
					0
				),
			0
		)
		const avgOrderValue = totalOrders > 0 ? totalValue / totalOrders : 0

		pdf.text(`Total Orders: ${totalOrders}`, margin, yPosition)
		yPosition += 6
		pdf.text(`Total Value: ${this.formatKRW(totalValue)}`, margin, yPosition)
		yPosition += 6
		pdf.text(
			`Average Order Value: ${this.formatKRW(avgOrderValue)}`,
			margin,
			yPosition
		)
		yPosition += 15

		// Orders by Status
		checkNewPage(30)
		const statusSummary = weeklyData.orders.reduce((acc, order) => {
			acc[order.status] = (acc[order.status] || 0) + 1
			return acc
		}, {} as Record<string, number>)

		pdf.setFont('helvetica', 'bold')
		pdf.text('Orders by Status:', margin, yPosition)
		yPosition += 8

		pdf.setFont('helvetica', 'normal')
		Object.entries(statusSummary).forEach(([status, count]) => {
			pdf.text(
				`${status.toUpperCase()}: ${count} orders`,
				margin + 10,
				yPosition
			)
			yPosition += 6
		})
		yPosition += 10

		// Branch Performance
		if (weeklyData.branchStats.length > 0) {
			checkNewPage(40)
			pdf.setFont('helvetica', 'bold')
			pdf.text('Branch Performance:', margin, yPosition)
			yPosition += 10

			pdf.setFontSize(9)
			pdf.text('Branch', margin, yPosition)
			pdf.text('Orders', margin + 50, yPosition)
			pdf.text('Value', margin + 80, yPosition)
			pdf.text('Avg Order', margin + 120, yPosition)
			pdf.text('Trend', margin + 160, yPosition)
			yPosition += 2

			pdf.line(margin, yPosition, margin + 180, yPosition)
			yPosition += 8

			pdf.setFont('helvetica', 'normal')
			weeklyData.branchStats.forEach(branch => {
				checkNewPage(8)
				pdf.text(branch.branch, margin, yPosition)
				pdf.text(branch.totalOrders.toString(), margin + 50, yPosition)
				pdf.text(this.formatKRW(branch.totalValue), margin + 80, yPosition)
				pdf.text(this.formatKRW(branch.avgOrderValue), margin + 120, yPosition)
				pdf.text(`${branch.weeklyTrend}%`, margin + 160, yPosition)
				yPosition += 6
			})
		}

		// Save the PDF
		const fileName = `weekly-statistics-${new Date().getTime()}.pdf`
		pdf.save(fileName)
	}

	static async generateMonthlyStatisticsPDF(
		monthlyData: {
			orders: Order[]
			branchStats: BranchReportData[]
			productInsights: Array<{
				name: string
				totalOrdered: number
				totalValue: number
				frequency: number
				trend: string
			}>
			month: string
			year: string
		},
		options: PDFOptions = {}
	): Promise<void> {
		const {
			title = 'Monthly Statistics Report',
			orientation = 'portrait',
			format = 'a4',
			margin = 20,
		} = options

		const pdf = new jsPDF({
			orientation,
			unit: 'mm',
			format,
		})

		const pageHeight = pdf.internal.pageSize.getHeight()
		let yPosition = margin

		// Helper function to check if we need a new page
		const checkNewPage = (requiredHeight: number) => {
			if (yPosition + requiredHeight > pageHeight - margin) {
				pdf.addPage()
				yPosition = margin
				return true
			}
			return false
		}

		// Header
		pdf.setFontSize(18)
		pdf.setFont('helvetica', 'bold')
		pdf.text(title, margin, yPosition)
		yPosition += 15

		pdf.setFontSize(12)
		pdf.setFont('helvetica', 'normal')
		pdf.text(`Generated: ${new Date().toLocaleDateString()}`, margin, yPosition)
		yPosition += 8
		pdf.text(
			`Period: ${monthlyData.month} ${monthlyData.year}`,
			margin,
			yPosition
		)
		yPosition += 15

		// Monthly Summary
		pdf.setFont('helvetica', 'bold')
		pdf.setFontSize(14)
		pdf.text('Monthly Summary', margin, yPosition)
		yPosition += 10

		pdf.setFont('helvetica', 'normal')
		pdf.setFontSize(11)

		const totalOrders = monthlyData.orders.length
		const totalValue = monthlyData.orders.reduce(
			(sum, order) =>
				sum +
				order.items.reduce(
					(itemSum, item) => itemSum + item.quantity * item.product.price,
					0
				),
			0
		)
		const avgOrderValue = totalOrders > 0 ? totalValue / totalOrders : 0
		const uniqueBranches = new Set(
			monthlyData.orders.map(order => order.branch)
		).size

		pdf.text(`Total Orders: ${totalOrders}`, margin, yPosition)
		yPosition += 6
		pdf.text(`Total Value: ${this.formatKRW(totalValue)}`, margin, yPosition)
		yPosition += 6
		pdf.text(
			`Average Order Value: ${this.formatKRW(avgOrderValue)}`,
			margin,
			yPosition
		)
		yPosition += 6
		pdf.text(`Active Branches: ${uniqueBranches}`, margin, yPosition)
		yPosition += 15

		// Orders by Status
		checkNewPage(40)
		const statusSummary = monthlyData.orders.reduce((acc, order) => {
			acc[order.status] = (acc[order.status] || 0) + 1
			return acc
		}, {} as Record<string, number>)

		pdf.setFont('helvetica', 'bold')
		pdf.text('Orders by Status:', margin, yPosition)
		yPosition += 8

		pdf.setFont('helvetica', 'normal')
		Object.entries(statusSummary).forEach(([status, count]) => {
			pdf.text(
				`${status.toUpperCase()}: ${count} orders (${Math.round(
					(count / totalOrders) * 100
				)}%)`,
				margin + 10,
				yPosition
			)
			yPosition += 6
		})
		yPosition += 10

		// Branch Performance
		if (monthlyData.branchStats.length > 0) {
			checkNewPage(50)
			pdf.setFont('helvetica', 'bold')
			pdf.text('Branch Performance:', margin, yPosition)
			yPosition += 10

			pdf.setFontSize(9)
			pdf.text('Branch', margin, yPosition)
			pdf.text('Orders', margin + 50, yPosition)
			pdf.text('Value', margin + 80, yPosition)
			pdf.text('Avg Order', margin + 120, yPosition)
			pdf.text('Trend', margin + 160, yPosition)
			yPosition += 2

			pdf.line(margin, yPosition, margin + 180, yPosition)
			yPosition += 8

			pdf.setFont('helvetica', 'normal')
			monthlyData.branchStats.forEach(branch => {
				checkNewPage(8)
				pdf.text(branch.branch, margin, yPosition)
				pdf.text(branch.totalOrders.toString(), margin + 50, yPosition)
				pdf.text(this.formatKRW(branch.totalValue), margin + 80, yPosition)
				pdf.text(this.formatKRW(branch.avgOrderValue), margin + 120, yPosition)
				pdf.text(`${branch.weeklyTrend}%`, margin + 160, yPosition)
				yPosition += 6
			})
			yPosition += 10
		}

		// Top Products
		if (monthlyData.productInsights.length > 0) {
			checkNewPage(60)
			pdf.setFont('helvetica', 'bold')
			pdf.text('Top Products:', margin, yPosition)
			yPosition += 10

			pdf.setFontSize(9)
			pdf.text('Product', margin, yPosition)
			pdf.text('Ordered', margin + 60, yPosition)
			pdf.text('Value', margin + 90, yPosition)
			pdf.text('Frequency', margin + 130, yPosition)
			pdf.text('Trend', margin + 160, yPosition)
			yPosition += 2

			pdf.line(margin, yPosition, margin + 180, yPosition)
			yPosition += 8

			pdf.setFont('helvetica', 'normal')
			monthlyData.productInsights.slice(0, 10).forEach(product => {
				checkNewPage(8)
				pdf.text(product.name.substring(0, 20), margin, yPosition)
				pdf.text(product.totalOrdered.toString(), margin + 60, yPosition)
				pdf.text(this.formatKRW(product.totalValue), margin + 90, yPosition)
				pdf.text(`${product.frequency}%`, margin + 130, yPosition)
				pdf.text(product.trend.toUpperCase(), margin + 160, yPosition)
				yPosition += 6
			})
		}

		// Save the PDF
		const fileName = `monthly-statistics-${monthlyData.month}-${
			monthlyData.year
		}-${new Date().getTime()}.pdf`
		pdf.save(fileName)
	}
}
