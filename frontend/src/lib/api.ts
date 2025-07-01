import {
	AuthUser,
	BranchesResponse,
	CategoriesResponse,
	DashboardStats,
	LoginCredentials,
	Order,
	OrderFilters,
	OrderFormData,
	OrdersResponse,
	OrderStatus,
	Product,
	ProductFilters,
	ProductFormData,
	ProductsResponse,
	RegisterData,
	UnitsResponse,
	User,
	UserFilters,
	UsersResponse,
	UserStats,
} from '@/types'
import axios from 'axios'

const API_BASE_URL =
	process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

// Create axios instance
const api = axios.create({
	baseURL: API_BASE_URL,
	headers: {
		'Content-Type': 'application/json',
	},
})

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
			localStorage.removeItem('token')
			window.location.href = '/login'
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

	register: async (
		data: RegisterData
	): Promise<{ token: string; user: AuthUser }> => {
		const response = await api.post('/auth/register', data)
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

	createProduct: async (
		data: ProductFormData
	): Promise<{ product: Product }> => {
		const response = await api.post('/products', data)
		return response.data
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

	getCategories: async (): Promise<CategoriesResponse> => {
		const response = await api.get('/products/meta/categories')
		return response.data
	},

	getUnits: async (): Promise<UnitsResponse> => {
		const response = await api.get('/products/meta/units')
		return response.data
	},
}

// Orders API
export const ordersApi = {
	getOrders: async (filters?: OrderFilters): Promise<OrdersResponse> => {
		const params = new URLSearchParams()
		if (filters?.date) params.append('date', filters.date)
		if (filters?.branch && filters.branch !== 'all')
			params.append('branch', filters.branch)
		if (filters?.status && filters.status !== 'all')
			params.append('status', filters.status)
		if (filters?.page) params.append('page', filters.page.toString())
		if (filters?.limit) params.append('limit', filters.limit.toString())

		const response = await api.get(`/orders?${params.toString()}`)
		return response.data
	},

	getOrder: async (id: string): Promise<{ order: Order }> => {
		const response = await api.get(`/orders/${id}`)
		return response.data
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

export default api
