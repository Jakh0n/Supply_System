export interface User {
	id: string
	username: string
	position: 'admin' | 'worker'
	branch?: string
	isActive: boolean
	createdAt: string
}

export interface AuthUser {
	id: string
	username: string
	position: 'admin' | 'worker'
	branch?: string
}

export interface LoginCredentials {
	username: string
	password: string
}

export interface RegisterData {
	username: string
	password: string
	position: 'admin' | 'worker'
	branch?: string
}

export interface Product {
	_id: string
	name: string
	category: ProductCategory
	unit: ProductUnit
	description?: string
	supplier?: string
	isActive: boolean
	createdBy: {
		_id: string
		username: string
	}
	createdAt: string
	updatedAt: string
}

export type ProductCategory =
	| 'food'
	| 'beverages'
	| 'cleaning'
	| 'equipment'
	| 'packaging'
	| 'other'

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
	position?: 'admin' | 'worker' | 'all'
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

export interface CategoriesResponse {
	categories: ProductCategory[]
}

export interface UnitsResponse {
	units: ProductUnit[]
}
