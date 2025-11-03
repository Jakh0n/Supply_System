import {
	AnalyticsTimeframe,
	AuthUser,
	BranchAnalyticsResponse,
	BranchesResponse,
	CategoriesResponse,
	DashboardStats,
	FinancialMetrics,
	LoginCredentials,
	Order,
	OrderFilters,
	OrderFormData,
	OrdersResponse,
	OrderStatus,
	Product,
	ProductCategory,
	ProductFilters,
	ProductFormData,
	ProductInsightsResponse,
	ProductPurchase,
	ProductPurchaseFilters,
	ProductPurchaseFormData,
	ProductPurchasesResponse,
	ProductsResponse,
	ProductUnit,
	PurchaseStats,
	RegisterData,
	UnitsResponse,
	User,
	UserFilters,
	UsersResponse,
	UserStats,
} from '@/types'
import axios from 'axios'
import { handleApiError } from './errorUtils'

const API_BASE_URL =
	process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

// Create axios instance
const api = axios.create({
	baseURL: API_BASE_URL,
	headers: {
		'Content-Type': 'application/json',
	},
})

// Helper function to create a placeholder product for deleted items
const createDeletedProductPlaceholder = (): Product => ({
	_id: 'deleted-product',
	name: 'Product Deleted',
	category: 'main-products' as ProductCategory,
	unit: 'pieces' as ProductUnit,
	description: 'This product has been deleted',
	supplier: '',
	price: 0,
	amount: 0,
	count: 0,
	images: [],
	isActive: false,
	createdBy: { _id: 'system', username: 'System' },
	createdAt: new Date().toISOString(),
	updatedAt: new Date().toISOString(),
})

// Raw API types (with potentially null products)
interface RawOrderItem {
	product: Product | null
	quantity: number
	notes?: string
}

interface RawOrder {
	_id: string
	orderNumber: string
	worker: {
		_id: string
		username: string
		branch: string
	}
	branch: string
	requestedDate: string
	items: RawOrderItem[]
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

interface RawOrdersResponse {
	orders: RawOrder[]
	pagination: {
		current: number
		pages: number
		total: number
	}
}

// Helper function to clean order data by replacing null products with placeholders
const cleanOrderData = (order: RawOrder): Order => {
	return {
		...order,
		items: order.items.map(item => ({
			...item,
			product: item.product || createDeletedProductPlaceholder(),
		})),
	}
}

// Helper function to clean multiple orders
const cleanOrdersData = (data: RawOrdersResponse): OrdersResponse => {
	return {
		...data,
		orders: data.orders.map(cleanOrderData),
	}
}

// Request interceptor to add auth token
api.interceptors.request.use(
	config => {
		const token = localStorage.getItem('token')
		if (token) {
			config.headers.Authorization = `Bearer ${token}`
		}
		return config
	},
	error => {
		return Promise.reject(error)
	}
)

// Response interceptor to handle auth errors
api.interceptors.response.use(
	response => response,
	error => {
		if (error.response?.status === 401) {
			// Only redirect if we're not already on the login page
			if (
				typeof window !== 'undefined' &&
				!window.location.pathname.includes('/login')
			) {
				localStorage.removeItem('token')
				window.location.href = '/login'
			}
		}
		return Promise.reject(error)
	}
)

// Auth API
export const authApi = {
	login: async (
		credentials: LoginCredentials
	): Promise<{ token: string; user: AuthUser }> => {
		const response = await api.post('/auth/login', credentials)
		return response.data
	},

	getCurrentUser: async (): Promise<{ user: AuthUser }> => {
		const response = await api.get('/auth/me')
		return response.data
	},

	logout: async (): Promise<void> => {
		await api.post('/auth/logout')
		localStorage.removeItem('token')
	},
}

// Orders API
export const ordersApi = {
	getOrders: async (filters?: OrderFilters): Promise<OrdersResponse> => {
		const params = new URLSearchParams()
		if (filters?.date) params.append('date', filters.date)
		if (filters?.month) params.append('month', filters.month.toString())
		if (filters?.year) params.append('year', filters.year.toString())
		if (filters?.branch && filters.branch !== 'all')
			params.append('branch', filters.branch)
		if (filters?.status && filters.status !== 'all')
			params.append('status', filters.status)
		if (filters?.page) params.append('page', filters.page.toString())
		if (filters?.limit) params.append('limit', filters.limit.toString())
		if (filters?.viewAll) params.append('viewAll', filters.viewAll)

		const response = await api.get(`/orders?${params.toString()}`)
		return cleanOrdersData(response.data)
	},

	getOrder: async (id: string): Promise<{ order: Order }> => {
		const response = await api.get(`/orders/${id}`)
		return { order: cleanOrderData(response.data.order) }
	},

	createOrder: async (data: OrderFormData): Promise<{ order: Order }> => {
		const response = await api.post('/orders', data)
		return response.data
	},

	updateOrder: async (
		id: string,
		data: Partial<OrderFormData>
	): Promise<{ order: Order }> => {
		const response = await api.put(`/orders/${id}`, data)
		return response.data
	},

	updateOrderStatus: async (
		id: string,
		status: OrderStatus,
		adminNotes?: string
	): Promise<{ order: Order }> => {
		const response = await api.patch(`/orders/${id}/status`, {
			status,
			adminNotes,
		})
		return response.data
	},

	bulkUpdateOrderStatus: async (
		orderIds: string[],
		status: OrderStatus,
		adminNotes?: string
	): Promise<{ message: string; updatedCount: number; orders: Order[] }> => {
		const response = await api.patch('/orders/bulk/status', {
			orderIds,
			status,
			adminNotes,
		})
		return response.data
	},

	deleteOrder: async (id: string): Promise<void> => {
		await api.delete(`/orders/${id}`)
	},

	downloadPDF: async (date: string, branch?: string): Promise<Blob> => {
		const params = new URLSearchParams({ date })
		if (branch && branch !== 'all') params.append('branch', branch)

		const response = await api.get(
			`/orders/download/pdf?${params.toString()}`,
			{
				responseType: 'blob',
			}
		)
		return response.data
	},

	getDashboardStats: async (): Promise<DashboardStats> => {
		const response = await api.get('/orders/stats/dashboard')
		return response.data
	},

	getBranchAnalytics: async (
		timeframe: AnalyticsTimeframe = 'week',
		month?: number,
		year?: number
	): Promise<BranchAnalyticsResponse> => {
		const params = new URLSearchParams()
		params.append('timeframe', timeframe)

		if (month && year) {
			params.append('month', month.toString())
			params.append('year', year.toString())
		}

		// Add cache-busting parameter
		params.append('_t', Date.now().toString())

		const response = await api.get(
			`/orders/analytics/branches?${params.toString()}`
		)
		return response.data
	},

	getProductInsights: async (
		timeframe: AnalyticsTimeframe = 'week'
	): Promise<ProductInsightsResponse> => {
		const response = await api.get(
			`/orders/analytics/products?timeframe=${timeframe}`
		)
		return response.data
	},

	getFinancialMetrics: async (
		timeframe: AnalyticsTimeframe = 'week'
	): Promise<FinancialMetrics> => {
		const response = await api.get(
			`/orders/analytics/financial?timeframe=${timeframe}`
		)
		return response.data
	},
}

// Users API
export const usersApi = {
	getUsers: async (filters?: UserFilters): Promise<UsersResponse> => {
		const params = new URLSearchParams()
		if (filters?.position && filters.position !== 'all')
			params.append('position', filters.position)
		if (filters?.active && filters.active !== 'all')
			params.append('active', filters.active)
		if (filters?.search) params.append('search', filters.search)

		const response = await api.get(`/users?${params.toString()}`)
		return response.data
	},

	getUser: async (id: string): Promise<{ user: User }> => {
		const response = await api.get(`/users/${id}`)
		return response.data
	},

	createUser: async (data: RegisterData): Promise<{ user: User }> => {
		const response = await api.post('/users', data)
		return response.data
	},

	updateUser: async (
		id: string,
		data: Partial<RegisterData>
	): Promise<{ user: User }> => {
		const response = await api.put(`/users/${id}`, data)
		return response.data
	},

	toggleUserStatus: async (id: string): Promise<{ user: User }> => {
		const response = await api.patch(`/users/${id}/toggle-status`)
		return response.data
	},

	deleteUser: async (id: string): Promise<void> => {
		await api.delete(`/users/${id}`)
	},

	getUserStats: async (): Promise<UserStats> => {
		const response = await api.get('/users/stats/overview')
		return response.data
	},

	getBranches: async (): Promise<BranchesResponse> => {
		const response = await api.get('/users/meta/branches')
		return response.data
	},
}

// Branches API
export const branchesApi = {
	getBranches: async (): Promise<{
		branches: Array<{
			name: string
			activeWorkers: number
			totalOrders: number
			pendingOrders: number
		}>
	}> => {
		const response = await api.get('/branches')
		return response.data
	},

	getBranchNames: async (): Promise<{
		branches: Array<{
			name: string
			activeWorkers: number
			totalOrders: number
			pendingOrders: number
		}>
	}> => {
		const response = await api.get('/branches/names')
		return response.data
	},

	getBranch: async (
		name: string
	): Promise<{
		branch: {
			name: string
			activeWorkers: number
			totalWorkers: number
			totalOrders: number
			pendingOrders: number
			completedOrders: number
			workers: User[]
		}
	}> => {
		const response = await api.get(`/branches/${encodeURIComponent(name)}`)
		return response.data
	},

	createBranch: async (data: {
		name: string
	}): Promise<{
		branch: {
			name: string
			activeWorkers: number
			totalOrders: number
			pendingOrders: number
		}
	}> => {
		const response = await api.post('/branches', data)
		return response.data
	},

	updateBranch: async (
		oldName: string,
		data: { name: string }
	): Promise<{ branch: { oldName: string; newName: string } }> => {
		const response = await api.put(
			`/branches/${encodeURIComponent(oldName)}`,
			data
		)
		return response.data
	},

	deleteBranch: async (name: string): Promise<void> => {
		await api.delete(`/branches/${encodeURIComponent(name)}`)
	},
}

// Products API
export const productsApi = {
	getProducts: async (filters?: ProductFilters): Promise<ProductsResponse> => {
		const params = new URLSearchParams()
		if (filters?.category && filters.category !== 'all')
			params.append('category', filters.category)
		if (filters?.search) params.append('search', filters.search)
		if (filters?.active && filters.active !== 'all')
			params.append('active', filters.active)

		const response = await api.get(`/products?${params.toString()}`)
		return response.data
	},

	getProduct: async (id: string): Promise<{ product: Product }> => {
		const response = await api.get(`/products/${id}`)
		return response.data
	},

	uploadImages: async (
		images: File[]
	): Promise<{
		images: Array<{ url: string; publicId: string; isPrimary: boolean }>
	}> => {
		const formData = new FormData()
		images.forEach(image => {
			formData.append('images', image)
		})

		const response = await api.post('/products/upload-images', formData, {
			headers: {
				'Content-Type': 'multipart/form-data',
			},
		})
		return response.data
	},

	createProduct: async (
		data: ProductFormData
	): Promise<{ product: Product }> => {
		// Clean up the data before sending - only send fields the backend expects
		const cleanData = {
			name: data.name,
			category: data.category,
			unit: data.unit,
			description: data.description?.trim() || undefined,
			supplier: data.supplier?.trim() || undefined,
			price:
				typeof data.price === 'string' ? parseFloat(data.price) : data.price,
			amount: data.amount || 0,
			count: data.count || 0,
			purchaseSite: data.purchaseSite?.trim() || undefined,
			contact: data.contact?.trim() || undefined,
			monthlyUsage: data.monthlyUsage || 0,
			images: data.images || [],
		}

		try {
			const response = await api.post('/products', cleanData)
			return response.data
		} catch (error) {
			throw handleApiError(error)
		}
	},

	updateProduct: async (
		id: string,
		data: Partial<ProductFormData>
	): Promise<{ product: Product }> => {
		const response = await api.put(`/products/${id}`, data)
		return response.data
	},

	toggleProductStatus: async (id: string): Promise<{ product: Product }> => {
		const response = await api.patch(`/products/${id}/toggle-status`)
		return response.data
	},

	deleteProduct: async (id: string): Promise<void> => {
		await api.delete(`/products/${id}`)
	},

	deleteProductImage: async (
		productId: string,
		publicId: string
	): Promise<{ product: Product }> => {
		const response = await api.delete(
			`/products/${productId}/images/${publicId}`
		)
		return response.data
	},

	getCategories: async (): Promise<CategoriesResponse> => {
		const response = await api.get('/products/meta/categories')
		return response.data
	},

	getUnits: async (): Promise<UnitsResponse> => {
		const response = await api.get('/products/meta/units')
		return response.data
	},
}

// Product Purchases API
export const purchasesApi = {
	getPurchases: async (
		filters?: ProductPurchaseFilters
	): Promise<ProductPurchasesResponse> => {
		const params = new URLSearchParams()
		if (filters?.category && filters.category !== 'all')
			params.append('category', filters.category)
		if (filters?.branch && filters.branch !== 'all')
			params.append('branch', filters.branch)
		if (filters?.status && filters.status !== 'all')
			params.append('status', filters.status)
		if (filters?.paymentWay && filters.paymentWay !== 'all')
			params.append('paymentWay', filters.paymentWay)
		if (filters?.startDate) params.append('startDate', filters.startDate)
		if (filters?.endDate) params.append('endDate', filters.endDate)
		if (filters?.search) params.append('search', filters.search)
		if (filters?.page) params.append('page', filters.page.toString())
		if (filters?.limit) params.append('limit', filters.limit.toString())

		const response = await api.get(`/purchases?${params.toString()}`)
		// Backend returns { data: { purchases: [...], pagination: {...} } }
		// We need to return { purchases: [...], pagination: {...} }
		return response.data.data
	},

	getPurchase: async (id: string): Promise<{ data: ProductPurchase }> => {
		const response = await api.get(`/purchases/${id}`)
		return response.data
	},

	createPurchase: async (
		data: ProductPurchaseFormData
	): Promise<ProductPurchase> => {
		console.log('Creating purchase with data:', data)
		console.log('Data types:', {
			price: typeof data.price,
			quantity: typeof data.quantity,
			category: typeof data.category,
			paymentWay: typeof data.paymentWay,
			unit: typeof data.unit,
		})
		try {
			const response = await api.post('/purchases', data)
			console.log('Purchase created successfully:', response.data)
			return response.data.data
		} catch (error) {
			if (axios.isAxiosError(error)) {
				console.error(
					'API Error creating purchase:',
					error.response?.data || error.message
				)
				console.error('Error status:', error.response?.status)
			} else {
				console.error('Unexpected error:', error)
			}
			throw error
		}
	},

	updatePurchase: async (
		id: string,
		data: Partial<ProductPurchaseFormData>
	): Promise<ProductPurchase> => {
		console.log('Updating purchase with data:', data)
		const response = await api.put(`/purchases/${id}`, data)
		return response.data.data
	},

	deletePurchase: async (id: string): Promise<void> => {
		await api.delete(`/purchases/${id}`)
	},

	getPurchaseStats: async (filters?: {
		startDate?: string
		endDate?: string
		branch?: string
	}): Promise<PurchaseStats> => {
		const params = new URLSearchParams()
		if (filters?.startDate) params.append('startDate', filters.startDate)
		if (filters?.endDate) params.append('endDate', filters.endDate)
		if (filters?.branch && filters.branch !== 'all')
			params.append('branch', filters.branch)

		const response = await api.get(
			`/purchases/stats/summary?${params.toString()}`
		)
		return response.data.data
	},

	uploadImages: async (
		images: File[]
	): Promise<{
		images: Array<{ url: string; publicId: string; isPrimary: boolean }>
	}> => {
		const formData = new FormData()
		images.forEach(image => {
			formData.append('images', image)
		})

		const response = await api.post('/purchases/upload-images', formData, {
			headers: {
				'Content-Type': 'multipart/form-data',
			},
		})
		return response.data
	},
}

export default api
