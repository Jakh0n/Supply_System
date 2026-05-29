import {
	getCategoryDisplayName,
	getCategorySortOrder,
} from '@/lib/orderCategories'
import { Order } from '@/types'
import type jsPDF from 'jspdf'

type OrderItem = Order['items'][number]

type ProductTotal = {
	name: string
	unit: string
	totalQuantity: number
	category: string
}

function groupItemsByCategory(
	items: OrderItem[]
): Record<string, OrderItem[]> {
	const grouped = items.reduce(
		(acc, item) => {
			const categoryName = getCategoryDisplayName(
				item.product?.category ?? 'other'
			)
			if (!acc[categoryName]) {
				acc[categoryName] = []
			}
			acc[categoryName].push(item)
			return acc
		},
		{} as Record<string, OrderItem[]>
	)

	const sortedGroups: Record<string, OrderItem[]> = {}
	Object.entries(grouped)
		.map(([categoryName, categoryItems]) => ({
			categoryName,
			items: categoryItems.sort((a, b) =>
				(a.product?.name ?? '').localeCompare(b.product?.name ?? '')
			),
			sortOrder: getCategorySortOrder(categoryName),
		}))
		.sort((a, b) => a.sortOrder - b.sortOrder)
		.forEach(({ categoryName, items: sortedItems }) => {
			sortedGroups[categoryName] = sortedItems
		})

	return sortedGroups
}

function renderProductColumns(
	pdf: jsPDF,
	items: OrderItem[],
	startY: number,
	margin: number,
	pageWidth: number,
	pageHeight: number,
	onNewPage: () => void
): number {
	const columnWidth = (pageWidth - 2 * margin) / 3
	const leftColumnX = margin
	const middleColumnX = margin + columnWidth
	const rightColumnX = margin + 2 * columnWidth
	let leftColumnY = startY
	let middleColumnY = startY
	let rightColumnY = startY

	pdf.setFontSize(7)
	pdf.setFont('times', 'normal')

	items.forEach((item, index) => {
		const productText = `${item.product?.name || 'Product Deleted'} - ${item.quantity} ${item.product?.unit || 'unit'}`

		const resetColumns = () => {
			onNewPage()
			leftColumnY = margin
			middleColumnY = margin
			rightColumnY = margin
		}

		if (index % 3 === 0) {
			if (leftColumnY > pageHeight - margin - 10) resetColumns()
			pdf.text(productText, leftColumnX, leftColumnY)
			leftColumnY += 3
		} else if (index % 3 === 1) {
			if (middleColumnY > pageHeight - margin - 10) resetColumns()
			pdf.text(productText, middleColumnX, middleColumnY)
			middleColumnY += 3
		} else {
			if (rightColumnY > pageHeight - margin - 10) resetColumns()
			pdf.text(productText, rightColumnX, rightColumnY)
			rightColumnY += 3
		}
	})

	return Math.max(leftColumnY, middleColumnY, rightColumnY) + 3
}

function renderSummaryProductColumns(
	pdf: jsPDF,
	products: ProductTotal[],
	startY: number,
	margin: number,
	pageWidth: number,
	pageHeight: number,
	onNewPage: () => void
): number {
	const columnWidth = (pageWidth - 2 * margin) / 3
	const leftColumnX = margin
	const middleColumnX = margin + columnWidth
	const rightColumnX = margin + 2 * columnWidth
	let leftColumnY = startY
	let middleColumnY = startY
	let rightColumnY = startY

	pdf.setFontSize(7)
	pdf.setFont('times', 'normal')

	products.forEach((product, index) => {
		const productText = `${product.name} - ${product.totalQuantity} ${product.unit}`

		const resetColumns = () => {
			onNewPage()
			leftColumnY = margin
			middleColumnY = margin
			rightColumnY = margin
		}

		if (index % 3 === 0) {
			if (leftColumnY > pageHeight - margin - 10) resetColumns()
			pdf.text(productText, leftColumnX, leftColumnY)
			leftColumnY += 3
		} else if (index % 3 === 1) {
			if (middleColumnY > pageHeight - margin - 10) resetColumns()
			pdf.text(productText, middleColumnX, middleColumnY)
			middleColumnY += 3
		} else {
			if (rightColumnY > pageHeight - margin - 10) resetColumns()
			pdf.text(productText, rightColumnX, rightColumnY)
			rightColumnY += 3
		}
	})

	return Math.max(leftColumnY, middleColumnY, rightColumnY) + 5
}

export async function generateOrdersChecklistPdf(
	orders: Order[],
	reportDate: string
): Promise<void> {
	const { default: jsPDF } = await import('jspdf')

	const ordersByBranch = orders.reduce(
		(acc, order) => {
			if (!acc[order.branch]) {
				acc[order.branch] = []
			}
			acc[order.branch].push(order)
			return acc
		},
		{} as Record<string, Order[]>
	)

	const pdf = new jsPDF({
		orientation: 'portrait',
		unit: 'mm',
		format: 'a4',
	})

	const pageWidth = pdf.internal.pageSize.getWidth()
	const pageHeight = pdf.internal.pageSize.getHeight()
	const margin = 15
	let yPosition = margin
	let currentPage = 1

	const addPageNumber = () => {
		pdf.setFontSize(6)
		pdf.setFont('times', 'normal')
		pdf.text(`${currentPage}`, pageWidth / 2, pageHeight - 10, {
			align: 'center',
		})
	}

	const checkNewPage = (requiredHeight: number) => {
		if (yPosition + requiredHeight > pageHeight - margin) {
			pdf.addPage()
			currentPage++
			yPosition = margin
			addPageNumber()
			return true
		}
		return false
	}

	const onColumnNewPage = () => {
		pdf.addPage()
		currentPage++
		addPageNumber()
	}

	pdf.setFontSize(14)
	pdf.setFont('times', 'bold')
	pdf.text('Orders Checklist', pageWidth / 2, yPosition, { align: 'center' })
	yPosition += 8

	pdf.setFontSize(10)
	pdf.setFont('times', 'normal')
	pdf.text(`Date: ${reportDate}`, pageWidth / 2, yPosition, { align: 'center' })
	yPosition += 8
	pdf.text('All Branches Report', pageWidth / 2, yPosition, {
		align: 'center',
	})
	yPosition += 15
	addPageNumber()

	const branchEntries = Object.entries(ordersByBranch)
	branchEntries.forEach(([branch, branchOrders], branchIndex) => {
		checkNewPage(20)

		pdf.setFontSize(10)
		pdf.setFont('times', 'bold')
		const branchText = `${branch} Branch`
		const textWidth = pdf.getTextWidth(branchText)
		const boxPadding = 2
		const boxHeight = 8

		pdf.rect(
			margin - boxPadding,
			yPosition - boxHeight + 2,
			textWidth + boxPadding * 2,
			boxHeight
		)
		pdf.text(branchText, margin, yPosition)
		yPosition += 10

		const allBranchItems = branchOrders.flatMap(order => order.items)
		const groupedItems = groupItemsByCategory(allBranchItems)

		Object.entries(groupedItems).forEach(([categoryName, items]) => {
			checkNewPage(15)
			pdf.setFontSize(9)
			pdf.setFont('times', 'bold')
			pdf.text(`${categoryName}:`, margin, yPosition)
			yPosition += 6

			yPosition = renderProductColumns(
				pdf,
				items,
				yPosition,
				margin,
				pageWidth,
				pageHeight,
				onColumnNewPage
			)
		})

		if (branchIndex < branchEntries.length - 1) {
			yPosition += 3
			checkNewPage(5)
			pdf.setLineWidth(0.2)
			pdf.setDrawColor(0, 0, 0)
			pdf.line(margin, yPosition, pageWidth - margin, yPosition)
			yPosition += 3
		} else {
			yPosition += 3
		}
	})

	yPosition += 10
	checkNewPage(30)

	const allItems = orders.flatMap(order => order.items)
	const productTotals = new Map<string, ProductTotal>()

	allItems.forEach(item => {
		const productKey = item.product?._id || item.product?.name || 'Unknown'
		const productName = item.product?.name || 'Product Deleted'
		const productUnit = item.product?.unit || 'units'
		const productCategory = item.product?.category || 'other'

		const existing = productTotals.get(productKey)
		if (existing) {
			existing.totalQuantity += item.quantity
		} else {
			productTotals.set(productKey, {
				name: productName,
				unit: productUnit,
				totalQuantity: item.quantity,
				category: productCategory,
			})
		}
	})

	const sortedProducts = Array.from(productTotals.values()).sort((a, b) => {
		const aCategoryOrder = getCategorySortOrder(a.category)
		const bCategoryOrder = getCategorySortOrder(b.category)
		if (aCategoryOrder !== bCategoryOrder) {
			return aCategoryOrder - bCategoryOrder
		}
		return a.name.localeCompare(b.name)
	})

	pdf.setFontSize(12)
	pdf.setFont('times', 'bold')
	pdf.text('TOTAL SUMMARY - ALL BRANCHES', pageWidth / 2, yPosition, {
		align: 'center',
	})
	yPosition += 10
	pdf.setLineWidth(0.5)
	pdf.line(margin, yPosition - 2, pageWidth - margin, yPosition - 2)
	yPosition += 5

	const summaryGrouped = sortedProducts.reduce(
		(acc, product) => {
			const categoryName = getCategoryDisplayName(product.category)
			if (!acc[categoryName]) {
				acc[categoryName] = []
			}
			acc[categoryName].push(product)
			return acc
		},
		{} as Record<string, ProductTotal[]>
	)

	Object.entries(summaryGrouped).forEach(([categoryName, products]) => {
		checkNewPage(15)
		pdf.setFontSize(9)
		pdf.setFont('times', 'bold')
		pdf.text(`${categoryName}:`, margin, yPosition)
		yPosition += 6

		yPosition = renderSummaryProductColumns(
			pdf,
			products,
			yPosition,
			margin,
			pageWidth,
			pageHeight,
			onColumnNewPage
		)
	})

	yPosition += 5
	checkNewPage(15)
	pdf.setFontSize(6)
	pdf.setFont('times', 'normal')
	pdf.text(
		`Generated on ${new Date().toLocaleString()}`,
		pageWidth / 2,
		yPosition,
		{ align: 'center' }
	)
	yPosition += 4
	pdf.text(
		`Report for date: ${reportDate} | Total orders: ${orders.length} | Total branches: ${Object.keys(ordersByBranch).length}`,
		pageWidth / 2,
		yPosition,
		{ align: 'center' }
	)
	addPageNumber()

	const fileName = `orders-checklist-${reportDate}-${Date.now()}.pdf`
	pdf.save(fileName)
}
