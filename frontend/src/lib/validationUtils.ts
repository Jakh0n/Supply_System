import { ProductFormData } from '@/types'
import { toast } from 'sonner'

/**
 * Validation rules and limits
 */
export const VALIDATION_RULES = {
	product: {
		name: {
			required: true,
			maxLength: 100,
		},
		price: {
			required: true,
			min: 0.01,
		},
		purchaseSite: {
			maxLength: 200,
		},
		contact: {
			maxLength: 100,
		},
	} as const,
} as const

/**
 * Validation error messages
 */
export const VALIDATION_MESSAGES = {
	product: {
		nameRequired: 'Product name is required',
		priceRequired: 'Price is required',
		priceInvalid: 'Price must be greater than 0',
		purchaseSiteTooLong: 'Purchase site cannot exceed 200 characters',
		contactTooLong: 'Contact information cannot exceed 100 characters',
	},
} as const

/**
 * Validates product form data
 * Returns array of error messages, empty array if valid
 */
export const validateProductForm = (formData: ProductFormData): string[] => {
	const errors: string[] = []

	// Name validation
	if (!formData.name.trim()) {
		errors.push(VALIDATION_MESSAGES.product.nameRequired)
	}

	// Price validation
	if (!formData.price || formData.price <= 0) {
		errors.push(VALIDATION_MESSAGES.product.priceInvalid)
	}

	// Purchase site validation
	if (
		formData.purchaseSite &&
		formData.purchaseSite.length >
			VALIDATION_RULES.product.purchaseSite.maxLength
	) {
		errors.push(VALIDATION_MESSAGES.product.purchaseSiteTooLong)
	}

	// Contact validation
	if (
		formData.contact &&
		formData.contact.length > VALIDATION_RULES.product.contact.maxLength
	) {
		errors.push(VALIDATION_MESSAGES.product.contactTooLong)
	}

	return errors
}

/**
 * Validates product form and shows toast errors if invalid
 * Returns true if valid, false otherwise
 */
export const validateProductFormWithToast = (
	formData: ProductFormData
): boolean => {
	const errors = validateProductForm(formData)

	if (errors.length > 0) {
		errors.forEach(error => toast.error(error))
		return false
	}

	return true
}
