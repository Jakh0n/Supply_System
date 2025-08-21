import { ProductImage } from '@/types'

/**
 * Comprehensive image URL validation and utility functions
 * Handles all cases for production and development environments
 */

// Environment detection
const isProduction = process.env.NODE_ENV === 'production'
const isDevelopment = process.env.NODE_ENV === 'development'

/**
 * Validates if a URL is a valid image URL that should be displayed
 * @param url - The image URL to validate
 * @returns boolean - true if the URL is valid and should be displayed
 */
export function isValidImageUrl(url: string | undefined | null): boolean {
	if (!url || typeof url !== 'string' || url.trim() === '') {
		return false
	}

	const trimmedUrl = url.trim()

	// Handle blob URLs (local file previews)
	if (trimmedUrl.startsWith('blob:')) {
		return true
	}

	// Handle data URLs (base64 encoded images)
	if (trimmedUrl.startsWith('data:image/')) {
		return true
	}

	// Handle Cloudinary URLs
	if (
		trimmedUrl.includes('res.cloudinary.com') ||
		trimmedUrl.includes('cloudinary.com')
	) {
		return true
	}

	// Handle other HTTPS URLs in production
	if (isProduction && trimmedUrl.startsWith('https://')) {
		return true
	}

	// Handle HTTP URLs in development (for local testing)
	if (isDevelopment && trimmedUrl.startsWith('http://')) {
		return true
	}

	// Handle relative URLs
	if (trimmedUrl.startsWith('/')) {
		return true
	}

	// Additional validation for common image file extensions
	const imageExtensions = /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)(\?.*)?$/i
	if (imageExtensions.test(trimmedUrl)) {
		return true
	}

	return false
}

/**
 * Gets the primary image from a product's images array
 * @param product - Product object with images array
 * @returns ProductImage | null - The primary image or null if none found
 */
export function getPrimaryImage(product: {
	images?: ProductImage[]
}): ProductImage | null {
	if (!product.images || product.images.length === 0) {
		return null
	}

	// Find the primary image
	const primaryImage = product.images.find(img => img.isPrimary)
	if (primaryImage && isValidImageUrl(primaryImage.url)) {
		return primaryImage
	}

	// If no primary image, return the first valid image
	const firstValidImage = product.images.find(img => isValidImageUrl(img.url))
	return firstValidImage || null
}

/**
 * Gets all valid images from a product's images array
 * @param product - Product object with images array
 * @returns ProductImage[] - Array of valid images
 */
export function getValidImages(product: {
	images?: ProductImage[]
}): ProductImage[] {
	if (!product.images || product.images.length === 0) {
		return []
	}

	return product.images.filter(img => isValidImageUrl(img.url))
}

/**
 * Optimizes an image URL with transformations (mainly for Cloudinary)
 * @param url - Original image URL
 * @param options - Transformation options
 * @returns string - Optimized image URL
 */
export function optimizeImageUrl(
	url: string,
	options: {
		width?: number
		height?: number
		quality?: number | 'auto'
		format?: string | 'auto'
	} = {}
): string {
	if (!isValidImageUrl(url)) {
		return url
	}

	// Only optimize Cloudinary URLs
	if (!url.includes('cloudinary.com')) {
		return url
	}

	const { width, height, quality = 'auto', format = 'auto' } = options

	try {
		// Parse the Cloudinary URL
		const urlParts = url.split('/upload/')
		if (urlParts.length !== 2) {
			return url
		}

		const [baseUrl, imagePath] = urlParts
		const transformations: string[] = []

		// Add width transformation
		if (width) {
			transformations.push(`w_${width}`)
		}

		// Add height transformation
		if (height) {
			transformations.push(`h_${height}`)
		}

		// Add quality transformation
		if (quality) {
			transformations.push(`q_${quality}`)
		}

		// Add format transformation
		if (format) {
			transformations.push(`f_${format}`)
		}

		// Add crop mode for better optimization
		if (width && height) {
			transformations.push('c_fill')
		} else if (width || height) {
			transformations.push('c_limit')
		}

		// Construct optimized URL
		const transformationString = transformations.join(',')
		return `${baseUrl}/upload/${transformationString}/${imagePath}`
	} catch (error) {
		// If optimization fails, return original URL
		console.warn('Failed to optimize image URL:', error)
		return url
	}
}

/**
 * Validates uploaded image files
 * @param files - FileList or File array
 * @param options - Validation options
 * @returns object - Validation result with valid files and errors
 */
export function validateImageFiles(
	files: FileList | File[],
	options: {
		maxFiles?: number
		maxFileSize?: number // in bytes
		allowedTypes?: string[]
	} = {}
): {
	validFiles: File[]
	errors: string[]
} {
	const {
		maxFiles = 5,
		maxFileSize = 5 * 1024 * 1024, // 5MB
		allowedTypes = [
			'image/jpeg',
			'image/jpg',
			'image/png',
			'image/webp',
			'image/gif',
		],
	} = options

	const validFiles: File[] = []
	const errors: string[] = []

	const fileArray = Array.from(files)

	for (let i = 0; i < fileArray.length; i++) {
		const file = fileArray[i]

		// Check file type
		if (
			!allowedTypes.some(
				type => file.type === type || file.type.startsWith(type)
			)
		) {
			errors.push(
				`${file.name}: Invalid file type. Allowed: ${allowedTypes.join(', ')}`
			)
			continue
		}

		// Check file size
		if (file.size > maxFileSize) {
			const sizeMB = Math.round(maxFileSize / (1024 * 1024))
			errors.push(`${file.name}: File too large. Maximum size: ${sizeMB}MB`)
			continue
		}

		// Check max files limit
		if (validFiles.length >= maxFiles) {
			errors.push(`Maximum ${maxFiles} files allowed`)
			break
		}

		// Basic file name validation
		if (file.name.length > 255) {
			errors.push(`${file.name}: File name too long`)
			continue
		}

		validFiles.push(file)
	}

	return { validFiles, errors }
}

/**
 * Creates a temporary blob URL for file preview
 * @param file - File object
 * @returns string - Blob URL
 */
export function createImagePreviewUrl(file: File): string {
	return URL.createObjectURL(file)
}

/**
 * Revokes a blob URL to free memory
 * @param url - Blob URL to revoke
 */
export function revokeImagePreviewUrl(url: string): void {
	if (url.startsWith('blob:')) {
		URL.revokeObjectURL(url)
	}
}

/**
 * Generates a fallback image placeholder
 * @param options - Placeholder options
 * @returns string - Data URL for placeholder image
 */
export function generateImagePlaceholder(
	options: {
		width?: number
		height?: number
		text?: string
		backgroundColor?: string
		textColor?: string
	} = {}
): string {
	const {
		width = 400,
		height = 300,
		text = 'No Image',
		backgroundColor = '#f3f4f6',
		textColor = '#6b7280',
	} = options

	// Create SVG placeholder
	const svg = `
		<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
			<rect width="100%" height="100%" fill="${backgroundColor}"/>
			<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="${textColor}" font-family="sans-serif" font-size="14">${text}</text>
		</svg>
	`

	return `data:image/svg+xml;base64,${btoa(svg)}`
}
