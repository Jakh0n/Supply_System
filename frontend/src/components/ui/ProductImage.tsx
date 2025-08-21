import { isValidImageUrl, optimizeImageUrl } from '@/lib/imageUtils'
import { cn } from '@/lib/utils'
import { ProductImage as ProductImageType } from '@/types'
import { AlertCircle, ImageIcon } from 'lucide-react'
import Image from 'next/image'
import React, { useCallback, useState } from 'react'

interface ProductImageProps {
	/** Image URL or ProductImage object */
	src: string | ProductImageType | null | undefined
	/** Alternative text for the image */
	alt: string
	/** Image width */
	width?: number
	/** Image height */
	height?: number
	/** CSS class names */
	className?: string
	/** Container class names */
	containerClassName?: string
	/** Whether to use Next.js Image component fill mode */
	fill?: boolean
	/** Image object fit style */
	objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down'
	/** Show loading state */
	showLoading?: boolean
	/** Show error state */
	showError?: boolean
	/** Custom placeholder component */
	placeholder?: React.ReactNode
	/** Custom error component */
	errorComponent?: React.ReactNode
	/** Image optimization options */
	optimize?: {
		width?: number
		height?: number
		quality?: number | 'auto'
		format?: string | 'auto'
	}
	/** Callback when image loads successfully */
	onLoad?: () => void
	/** Callback when image fails to load */
	onError?: (error: string) => void
	/** Priority loading for above-the-fold images */
	priority?: boolean
	/** Image sizes for responsive images */
	sizes?: string
}

/**
 * Enhanced ProductImage component with comprehensive error handling,
 * optimization, and fallback support for all environments
 */
const ProductImage: React.FC<ProductImageProps> = ({
	src,
	alt,
	width,
	height,
	className,
	containerClassName,
	fill = false,
	objectFit = 'cover',
	showLoading = true,
	showError = true,
	placeholder,
	errorComponent,
	optimize,
	onLoad,
	onError,
	priority = false,
	sizes,
}) => {
	const [isLoading, setIsLoading] = useState(true)
	const [hasError, setHasError] = useState(false)
	const [errorMessage, setErrorMessage] = useState<string>('')

	// Extract URL from src prop
	const imageUrl = typeof src === 'string' ? src : src?.url

	// Validate the image URL
	const isValidUrl = isValidImageUrl(imageUrl)

	// Optimize the image URL if needed
	const optimizedUrl =
		isValidUrl && optimize ? optimizeImageUrl(imageUrl!, optimize) : imageUrl

	const handleLoad = useCallback(() => {
		setIsLoading(false)
		setHasError(false)
		setErrorMessage('')
		onLoad?.()
	}, [onLoad])

	const handleError = useCallback(() => {
		setIsLoading(false)
		setHasError(true)
		const error = 'Failed to load image'
		setErrorMessage(error)
		onError?.(error)
	}, [onError])

	// Default placeholder component
	const DefaultPlaceholder = () => (
		<div className='w-full h-full flex items-center justify-center bg-gray-100'>
			{showLoading && isLoading ? (
				<div className='flex flex-col items-center gap-2'>
					<div className='w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin' />
					<span className='text-xs text-gray-500'>Loading...</span>
				</div>
			) : (
				<ImageIcon className='w-8 h-8 text-gray-400' />
			)}
		</div>
	)

	// Default error component
	const DefaultError = () => (
		<div className='w-full h-full flex items-center justify-center bg-gray-50 border border-gray-200'>
			{showError ? (
				<div className='flex flex-col items-center gap-2 text-center p-2'>
					<AlertCircle className='w-6 h-6 text-red-400' />
					<span className='text-xs text-red-600'>Image failed to load</span>
					{errorMessage && (
						<span className='text-xs text-gray-500 max-w-full truncate'>
							{errorMessage}
						</span>
					)}
				</div>
			) : (
				<ImageIcon className='w-6 h-6 text-gray-400' />
			)}
		</div>
	)

	// If no valid URL, show placeholder or error
	if (!isValidUrl) {
		return (
			<div
				className={cn(
					'relative overflow-hidden bg-gray-100',
					fill ? 'w-full h-full' : '',
					containerClassName
				)}
				style={fill ? undefined : { width, height }}
			>
				{placeholder || <DefaultPlaceholder />}
			</div>
		)
	}

	// If there's an error, show error component
	if (hasError) {
		return (
			<div
				className={cn(
					'relative overflow-hidden',
					fill ? 'w-full h-full' : '',
					containerClassName
				)}
				style={fill ? undefined : { width, height }}
			>
				{errorComponent || <DefaultError />}
			</div>
		)
	}

	// Render the actual image
	return (
		<div
			className={cn(
				'relative overflow-hidden',
				fill ? 'w-full h-full' : '',
				containerClassName
			)}
			style={fill ? undefined : { width, height }}
		>
			{/* Loading overlay */}
			{isLoading && showLoading && (
				<div className='absolute inset-0 flex items-center justify-center bg-gray-100 z-10'>
					<div className='w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin' />
				</div>
			)}

			{/* Main image */}
			<Image
				src={optimizedUrl!}
				alt={alt}
				fill={fill}
				width={fill ? undefined : width}
				height={fill ? undefined : height}
				className={cn(
					'transition-opacity duration-200',
					isLoading ? 'opacity-0' : 'opacity-100',
					className
				)}
				style={{ objectFit }}
				onLoad={handleLoad}
				onError={handleError}
				priority={priority}
				sizes={sizes}
				quality={optimize?.quality as number | undefined}
			/>
		</div>
	)
}

export default ProductImage

/**
 * Convenience wrapper for product thumbnail images
 */
export const ProductThumbnail: React.FC<
	Omit<ProductImageProps, 'fill' | 'width' | 'height'> & {
		size?: 'sm' | 'md' | 'lg' | 'xl'
	}
> = ({ size = 'md', className, ...props }) => {
	const sizeMap = {
		sm: { width: 40, height: 40 },
		md: { width: 64, height: 64 },
		lg: { width: 96, height: 96 },
		xl: { width: 128, height: 128 },
	}

	const dimensions = sizeMap[size]

	return (
		<ProductImage
			{...props}
			{...dimensions}
			className={cn('rounded-lg', className)}
			optimize={{
				width: dimensions.width * 2, // 2x for retina displays
				height: dimensions.height * 2,
				quality: 'auto',
				format: 'auto',
				...props.optimize,
			}}
		/>
	)
}

/**
 * Convenience wrapper for product card images
 */
export const ProductCardImage: React.FC<
	Omit<ProductImageProps, 'fill'> & {
		aspectRatio?: 'square' | 'video' | 'wide'
	}
> = ({ aspectRatio = 'square', className, containerClassName, ...props }) => {
	const aspectRatioClasses = {
		square: 'aspect-square',
		video: 'aspect-video',
		wide: 'aspect-[16/10]',
	}

	return (
		<ProductImage
			{...props}
			fill
			containerClassName={cn(
				aspectRatioClasses[aspectRatio],
				'relative',
				containerClassName
			)}
			className={cn('object-cover', className)}
			optimize={{
				width: 400,
				height: 400,
				quality: 'auto',
				format: 'auto',
				...props.optimize,
			}}
		/>
	)
}
