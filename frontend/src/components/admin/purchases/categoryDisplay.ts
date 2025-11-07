/**
 * Category display names for purchase product catalog only
 * Maps category values to Korean/Turkish display names
 */
export const getCategoryDisplayName = (category: string): string => {
	const categoryMap: Record<string, string> = {
		'store-supplies': '매장 용품 (Dukkan Malz.)',
		'food-products': '식량품 (Gidalar)',
		'cleaning-materials': '청소용품 (Temizlik Malz.)',
		'frozen-products': '냉동 체품 (Donuk Malz.)',
		others: '기타 (Diger)',
		beverages: '음료 (Icecek)',
		'packaging-materials': '포장지 (Paket Malz.)',
		vegetables: '야채/과일 (Sebze/Meyve)',
		// Legacy category mappings (for old data)
		'main-products': '식량품 (Gidalar)',
		desserts: '기타 (Diger)',
		drinks: '음료 (Icecek)',
		'side-products': '식량품 (Gidalar)',
		supplies: '매장 용품 (Dukkan Malz.)',
		snacks: '기타 (Diger)',
	}
	return categoryMap[category] || category
}

/**
 * Get category options for purchase product catalog select dropdowns
 * Only inclu	des new categories allowed by backend validation
 */
export const getPurchaseCategoryOptions = () => {
	return [
		{ value: 'store-supplies', label: '매장 용품 (Dukkan Malz.)' },
		{ value: 'food-products', label: '식량품 (Gidalar)' },
		{ value: 'cleaning-materials', label: '청소용품 (Temizlik Malz.)' },
		{ value: 'frozen-products', label: '냉동 체품 (Donuk Malz.)' },
		{ value: 'others', label: '기타 (Diger)' },
		{ value: 'beverages', label: '음료 (Icecek)' },
		{ value: 'packaging-materials', label: '포장지 (Paket Malz.)' },
		{ value: 'vegetables', label: '야채/과일 (Sebze/Meyve)' },
	]
}
