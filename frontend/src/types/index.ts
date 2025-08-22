export interface User {
	_id?: string
	id?: string
	username: string
	position: 'admin' | 'worker' | 'editor'
	branch?: string
	isActive: boolean
	createdAt: string
}

export interface AuthUser {
	id: string
	username: string
	position: 'admin' | 'worker' | 'editor'
	branch?: string
}

export interface LoginCredentials {
	username: string
	password: string
}

export interface RegisterData {
	username: string
	password: string
	position: 'admin' | 'worker' | 'editor'
	branch?: string
}

export interface ProductImage {
	url: string
	publicId: string
	isPrimary: boolean
}

export interface Product {
	_id: string
	name: string
	category: ProductCategory
	unit: ProductUnit
	description?: string
	supplier?: string
	price: number
	images: ProductImage[]
	isActive: boolean
	createdBy: {
		_id: string
		username: string
	}
	createdAt: string
	updatedAt: string
}

export type ProductCategory =
	| 'frozen-products'
	| 'main-products'
	| 'desserts-drinks'
	| 'packaging-materials'
	| 'cleaning-materials'

export type ProductUnit =
	| 'kg'
	| 'g'
	| 'l'
	| 'ml'
	| 'pieces'
	| 'boxes'
	| 'bottles'
	| 'cans'
	| 'packets'

export interface ProductFormData {
	name: string
	category: ProductCategory
	unit: ProductUnit
	description?: string
	supplier?: string
	price: number
	images?: ProductImage[]
}

export interface OrderItem {
	product: string | Product
	quantity: number
	notes?: string
}

export interface Order {
	_id: string
	orderNumber: string
	worker: {
		_id: string
		username: string
		branch: string
	}
	branch: string
	requestedDate: string
	items: Array<{
		product: Product
		quantity: number
		notes?: string
	}>
	status: OrderStatus
	notes?: string
	adminNotes?: string
	processedBy?: {
		_id: string
		username: string
	}
	processedAt?: string
	createdAt: string
	updatedAt: string
}

export type OrderStatus = 'pending' | 'approved' | 'rejected' | 'completed'

export interface OrderFormData {
	requestedDate: string
	items: OrderItem[]
	notes?: string
}

export interface OrderFilters {
	date?: string
	month?: number
	year?: number
	branch?: string
	status?: OrderStatus | 'all'
	page?: number
	limit?: number
}

export interface ProductFilters {
	category?: ProductCategory | 'all'
	search?: string
	active?: 'true' | 'false' | 'all'
}

export interface UserFilters {
	position?: 'admin' | 'worker' | 'editor' | 'all'
	active?: 'true' | 'false' | 'all'
	search?: string
}

export interface ApiResponse<T> {
	message?: string
	data?: T
	errors?: Array<{
		field: string
		message: string
	}>
}

export interface PaginationInfo {
	current: number
	pages: number
	total: number
}

export interface OrdersResponse {
	orders: Order[]
	pagination: PaginationInfo
}

export interface ProductsResponse {
	products: Product[]
	total: number
}

export interface UsersResponse {
	users: User[]
	total: number
}

export interface DashboardStats {
	todayOrders: number
	totalOrders: number
	pendingOrders: number
	totalUsers?: number
	totalProducts?: number
	completedOrders?: number
	totalRevenue?: number
	todayRevenue?: number
	totalItems?: number
	branchStats: Array<{
		_id: string
		totalOrders: number
		pendingOrders: number
	}>
}

export interface UserStats {
	totalUsers: number
	activeUsers: number
	adminCount: number
	workerCount: number
	branchStats: Array<{
		_id: string
		count: number
	}>
}

export interface BranchesResponse {
	branches: string[]
}

export interface Branch {
	name: string
	activeWorkers: number
	totalOrders: number
	pendingOrders: number
}

export interface BranchDetails {
	name: string
	activeWorkers: number
	totalWorkers: number
	totalOrders: number
	pendingOrders: number
	completedOrders: number
	workers: User[]
}

export interface BranchFormData {
	name: string
}

export interface CategoriesResponse {
	categories: ProductCategory[]
}

export interface UnitsResponse {
	units: ProductUnit[]
}

// Analytics Types
export interface BranchAnalytics {
	branch: string
	totalOrders: number
	totalValue: number
	avgOrderValue: number
	pendingOrders: number
	completedOrders: number
	mostOrderedProducts: Array<{
		name: string
		quantity: number
		value: number
	}>
	weeklyTrend: number
}

export interface ProductInsights {
	name: string
	totalOrdered: number
	totalValue: number
	frequency: number
	avgPrice: number
	trend: 'up' | 'down' | 'stable'
}

export interface FinancialMetrics {
	dailySpending: number
	weeklySpending: number
	monthlySpending: number
	avgOrderValue: number

	// Growth metrics (real historical data)
	dailyGrowth?: number
	weeklyGrowth?: number
	monthlyGrowth?: number
	avgOrderGrowth?: number

	// Previous period data for comparison
	previousPeriod?: {
		dailySpending: number
		weeklySpending: number
		monthlySpending: number
		avgOrderValue?: number
	}

	// Additional insights
	totalOrders?: number
	totalItems?: number

	// Enhanced branch spending data
	topSpendingBranches: Array<{
		branch: string
		spending: number
		orderCount?: number
		itemCount?: number
		avgOrderValue?: number
	}>

	// Status breakdown
	statusBreakdown?: {
		completed: number
		pending: number
	}
}

export interface BranchAnalyticsResponse {
	branches: BranchAnalytics[]
}

export interface ProductInsightsResponse {
	products: ProductInsights[]
}

export type AnalyticsTimeframe = 'day' | 'week' | 'month' | 'quarter'

export interface BranchFilter {
	branch: string
	timeframe: AnalyticsTimeframe
	category: string
	dateRange: {
		start: string
		end: string
	}
}
