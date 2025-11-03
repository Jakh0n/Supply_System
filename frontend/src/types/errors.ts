/**
 * Validation error structure from express-validator
 */
export interface ValidationError {
	msg?: string
	message?: string
	param?: string
	path?: string
	value?: unknown
	location?: string
}

/**
 * API error response structure
 */
export interface ApiErrorResponse {
	message?: string
	errors?: ValidationError[]
}

/**
 * Enhanced error with validation details
 */
export interface EnhancedError extends Error {
	validationErrors?: ValidationError[]
	status?: number
}
