import { isValidImageUrl, optimizeImageUrl } from '@/lib/imageUtils'
import { cn } from '@/lib/utils'
import { ProductCategory, ProductImage as ProductImageType } from '@/types'
import { Coffee, ImageIcon, Package, ShoppingBag, Utensils } from 'lucide-react'
import Image from 'next/image'
import React, { useCallback, useState } from 'react'

interface ProductImageProps {
	/** Image URL or ProductImage object */
	src: string | ProductImageType | null | undefined
	/** Alternative text for the image */
	alt: string
	/** Product category for fallback icon */
	category?: ProductCategory
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
	category,
	width,
	height,
	className,
	containerClassName,
	fill = false,
	objectFit = 'cover',
	showLoading = true,
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

	// Extract URL from src prop
	const imageUrl = typeof src === 'string' ? src : src?.url

	// Validate the image URL
	const isValidUrl = isValidImageUrl(imageUrl)

	// Optimize the image URL if needed and ensure it's still valid after optimization
	const optimizedUrl = (() => {
		if (!isValidUrl) return imageUrl
		if (!optimize) return imageUrl

		try {
			const optimized = optimizeImageUrl(imageUrl!, optimize)
			// Make sure optimized URL is still valid
			return isValidImageUrl(optimized) ? optimized : imageUrl
		} catch (error) {
			console.warn('Image optimization failed, using original URL:', error)
			return imageUrl
		}
	})()

	const handleLoad = useCallback(() => {
		setIsLoading(false)
		setHasError(false)
		onLoad?.()
	}, [onLoad])

	const handleError = useCallback(() => {
		setIsLoading(false)
		setHasError(true)
		onError?.('Failed to load image')
	}, [onError])

	// Get category-specific icon
	const getCategoryIcon = () => {
		switch (category) {
			case 'frozen-products':
				return <Package className='w-6 h-6 text-blue-400' />
			case 'main-products':
				return <Utensils className='w-6 h-6 text-orange-400' />
			case 'desserts-drinks':
				return <Coffee className='w-6 h-6 text-pink-400' />
			case 'packaging-materials':
				return <Package className='w-6 h-6 text-indigo-400' />
			case 'cleaning-materials':
				return <ShoppingBag className='w-6 h-6 text-green-400' />
			default:
				return <ImageIcon className='w-6 h-6 text-gray-400' />
		}
	}

	// Default placeholder component with category-specific icon
	const DefaultPlaceholder = () => (
		<div className='w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-md'>
			{getCategoryIcon()}
		</div>
	)

	// Default error component - show category icon like placeholder
	const DefaultError = () => (
		<div className='w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-md'>
			{getCategoryIcon()}
		</div>
	)

	// If no valid URL or optimized URL is invalid, show placeholder immediately (no loading state)
	if (!isValidUrl || !isValidImageUrl(optimizedUrl)) {
		return (
			<div
				className={cn(
					'relative overflow-hidden',
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
				sizes={
					fill
						? sizes ||
						  '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
						: sizes
				}
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
> = ({ size = 'md', className, category, ...props }) => {
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
			category={category}
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
			sizes={
				props.sizes ||
				'(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
			}
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
