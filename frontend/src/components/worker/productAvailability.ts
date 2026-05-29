import { Product } from '@/types'

export function isProductAvailable(product: Product): boolean {
	return product.isActive !== false
}

export function sortProductsAvailableFirst(products: Product[]): Product[] {
	return [...products].sort((a, b) => {
		const aRank = isProductAvailable(a) ? 0 : 1
		const bRank = isProductAvailable(b) ? 0 : 1
		if (aRank !== bRank) return aRank - bRank
		return a.name.localeCompare(b.name)
	})
}
