import {
	ApiErrorResponse,
	EnhancedError,
	ValidationError,
} from '@/types/errors'
import axios from 'axios'

/**
 * Extracts validation error details from express-validator format
 */
const formatValidationError = (error: ValidationError): string => {
	const field = error.param || error.path || 'field'
	const message = error.msg || error.message || 'Validation error'
	return `${field}: ${message}`
}

/**
 * Formats multiple validation errors into a readable string
 */
export const formatValidationErrors = (errors: ValidationError[]): string => {
	return errors.map(formatValidationError).join(', ')
}

/**
 * Creates an enhanced error object with validation details
 */
const createEnhancedError = (
	message: string,
	validationErrors?: ValidationError[],
	status?: number
): EnhancedError => {
	const error = new Error(message) as EnhancedError
	error.validationErrors = validationErrors
	error.status = status
	return error
}

/**
 * Handles API errors and extracts validation information
 */
export const handleApiError = (error: unknown): EnhancedError => {
	// Handle non-axios errors
	if (!axios.isAxiosError(error)) {
		const message =
			error instanceof Error ? error.message : 'An unexpected error occurred'
		if (process.env.NODE_ENV === 'development') {
			console.error('Non-Axios Error:', message, error)
		}
		return createEnhancedError(message)
	}

	// Extract error details from axios error
	const status = error.response?.status
	const statusText = error.response?.statusText
	const errorData = error.response?.data as ApiErrorResponse | undefined
	const errorMessage = errorData?.message || error.message || 'Unknown error'
	const validationErrors = errorData?.errors || []

	// Log error details for debugging
	if (process.env.NODE_ENV === 'development') {
		console.error('API Error Details:', {
			status: status || 'N/A',
			statusText: statusText || 'N/A',
			message: errorMessage,
			validationErrors: validationErrors.length > 0 ? validationErrors : 'None',
			errorData: errorData || 'No error data',
			fullError: error,
		})
	}

	// Create enhanced error with validation details
	if (validationErrors.length > 0) {
		const errorDetails = formatValidationErrors(validationErrors)
		return createEnhancedError(
			`${errorMessage}: ${errorDetails}`,
			validationErrors,
			status
		)
	}

	return createEnhancedError(errorMessage, undefined, status)
}

/**
 * Gets user-friendly error message from an enhanced error
 */
export const getErrorMessage = (error: unknown): string => {
	if (error instanceof Error) {
		return error.message
	}
	return 'An unexpected error occurred'
}

/**
 * Gets validation errors from an enhanced error
 */
export const getValidationErrors = (error: unknown): ValidationError[] => {
	const enhancedError = error as EnhancedError
	return enhancedError.validationErrors || []
}
