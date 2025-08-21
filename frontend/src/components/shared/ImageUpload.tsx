'use client'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import ProductImageComponent from '@/components/ui/ProductImage'
import {
	createImagePreviewUrl,
	revokeImagePreviewUrl,
	validateImageFiles,
} from '@/lib/imageUtils'
import { ProductImage } from '@/types'
import { Upload, X } from 'lucide-react'
import React, { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

interface ImageUploadProps {
	images: ProductImage[]
	onImagesChange: (images: ProductImage[]) => void
	maxImages?: number
	disabled?: boolean
}

const ImageUpload: React.FC<ImageUploadProps> = ({
	images,
	onImagesChange,
	maxImages = 5,
	disabled = false,
}) => {
	const [dragActive, setDragActive] = useState(false)
	const [uploading, setUploading] = useState(false)

	// Cleanup blob URLs when component unmounts or images change
	useEffect(() => {
		return () => {
			// Clean up any remaining blob URLs when component unmounts
			images.forEach(image => {
				revokeImagePreviewUrl(image.url)
			})
		}
	}, [images])

	const handleDrag = useCallback((e: React.DragEvent) => {
		e.preventDefault()
		e.stopPropagation()
		if (e.type === 'dragenter' || e.type === 'dragover') {
			setDragActive(true)
		} else if (e.type === 'dragleave') {
			setDragActive(false)
		}
	}, [])

	const validateFiles = useCallback(
		(files: FileList) => {
			const { validFiles, errors } = validateImageFiles(files, {
				maxFiles: maxImages - images.length,
				maxFileSize: 5 * 1024 * 1024, // 5MB
				allowedTypes: [
					'image/jpeg',
					'image/jpg',
					'image/png',
					'image/webp',
					'image/gif',
				],
			})

			// Show any validation errors
			errors.forEach(error => {
				toast.error(error)
			})

			return validFiles
		},
		[maxImages, images.length]
	)

	const uploadFiles = useCallback(
		async (files: File[]) => {
			try {
				setUploading(true)

				// Create preview URLs for immediate display
				const previewImages: ProductImage[] = files.map((file, index) => ({
					url: createImagePreviewUrl(file),
					publicId: `temp-${Date.now()}-${index}`,
					isPrimary: images.length === 0 && index === 0, // First image is primary if no existing images
				}))

				// Add preview images immediately
				const imagesWithPreviews = [...images, ...previewImages]
				onImagesChange(imagesWithPreviews)

				// Upload to backend
				const { productsApi } = await import('@/lib/api')
				const response = await productsApi.uploadImages(files)

				// Replace preview images with actual uploaded images
				const newImages = [...imagesWithPreviews] // Use the updated state with previews
				response.images.forEach((uploadedImage, index) => {
					const previewIndex = newImages.findIndex(
						img => img.publicId === previewImages[index].publicId
					)
					if (previewIndex !== -1) {
						// Revoke the preview URL
						revokeImagePreviewUrl(newImages[previewIndex].url)
						// Replace with actual uploaded image
						newImages[previewIndex] = uploadedImage
					}
				})

				onImagesChange(newImages)
				toast.success(
					`${files.length} image${
						files.length > 1 ? 's' : ''
					} uploaded successfully`
				)
			} catch (error) {
				console.error('Upload error:', error)
				toast.error('Failed to upload images')

				// Clean up preview URLs and remove preview images on error
				const previewImagesInState = images.filter(img =>
					img.publicId.startsWith('temp-')
				)
				previewImagesInState.forEach(img => {
					revokeImagePreviewUrl(img.url)
				})

				const filteredImages = images.filter(
					img => !img.publicId.startsWith('temp-')
				)
				onImagesChange(filteredImages)
			} finally {
				setUploading(false)
			}
		},
		[images, onImagesChange]
	)

	const handleDrop = useCallback(
		async (e: React.DragEvent) => {
			e.preventDefault()
			e.stopPropagation()
			setDragActive(false)

			if (disabled || uploading) return

			const files = e.dataTransfer.files
			if (files && files.length > 0) {
				const validFiles = validateFiles(files)
				if (validFiles.length > 0) {
					await uploadFiles(validFiles)
				}
			}
		},
		[disabled, uploading, validateFiles, uploadFiles]
	)

	const handleFileSelect = useCallback(
		async (e: React.ChangeEvent<HTMLInputElement>) => {
			if (disabled || uploading) return

			const files = e.target.files
			if (files && files.length > 0) {
				const validFiles = validateFiles(files)
				if (validFiles.length > 0) {
					await uploadFiles(validFiles)
				}
			}

			// Reset the input
			e.target.value = ''
		},
		[disabled, uploading, validateFiles, uploadFiles]
	)

	const removeImage = (index: number) => {
		const newImages = [...images]
		const removedImage = newImages[index]

		// Revoke object URL if it's a preview
		revokeImagePreviewUrl(removedImage.url)

		newImages.splice(index, 1)

		// If we removed the primary image and there are still images, make the first one primary
		if (removedImage.isPrimary && newImages.length > 0) {
			newImages[0].isPrimary = true
		}

		onImagesChange(newImages)
	}

	const setPrimaryImage = (index: number) => {
		const newImages = images.map((img, i) => ({
			...img,
			isPrimary: i === index,
		}))
		onImagesChange(newImages)
	}

	const canUploadMore = images.length < maxImages

	return (
		<div className='space-y-4'>
			<Label className='text-sm font-medium'>Product Images</Label>

			{/* Upload Area */}
			{canUploadMore && (
				<div
					className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
						dragActive
							? 'border-blue-500 bg-blue-50'
							: 'border-gray-300 hover:border-gray-400'
					} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
					onDragEnter={handleDrag}
					onDragLeave={handleDrag}
					onDragOver={handleDrag}
					onDrop={handleDrop}
					onClick={() =>
						!disabled &&
						!uploading &&
						document.getElementById('image-upload')?.click()
					}
				>
					<input
						id='image-upload'
						type='file'
						multiple
						accept='image/*'
						className='hidden'
						onChange={handleFileSelect}
						disabled={disabled || uploading}
					/>

					<div className='flex flex-col items-center gap-2'>
						<Upload className='w-8 h-8 text-gray-400' />
						<div className='text-sm text-gray-600'>
							{uploading ? (
								<span>Uploading...</span>
							) : (
								<span>
									<strong>Click to upload</strong> or drag and drop
								</span>
							)}
						</div>
						<div className='text-xs text-gray-500'>
							PNG, JPG, WEBP up to 5MB • {images.length}/{maxImages} images
						</div>
					</div>
				</div>
			)}

			{/* Image Previews */}
			{images.length > 0 && (
				<div className='grid grid-cols-2 sm:grid-cols-3 gap-4'>
					{images.map((image, index) => (
						<div
							key={image.publicId}
							className='relative group rounded-lg overflow-hidden border border-gray-200'
						>
							{/* Image */}
							<div className='aspect-square relative'>
								<ProductImageComponent
									src={image}
									alt={`Product image ${index + 1}`}
									fill
									className='object-cover'
									showLoading={true}
									containerClassName='w-full h-full'
								/>

								{/* Loading overlay for temp images */}
								{image.publicId.startsWith('temp-') && (
									<div className='absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10'>
										<div className='w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin' />
									</div>
								)}
							</div>

							{/* Controls */}
							<div className='absolute top-2 right-2 flex gap-1'>
								<Button
									type='button'
									variant='destructive'
									size='sm'
									className='h-7 w-7 p-0 opacity-75 hover:opacity-100'
									onClick={() => removeImage(index)}
									disabled={disabled || uploading}
								>
									<X className='h-3 w-3' />
								</Button>
							</div>

							{/* Primary Badge */}
							{image.isPrimary && (
								<div className='absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded'>
									Primary
								</div>
							)}

							{/* Set Primary Button */}
							{!image.isPrimary && (
								<div className='absolute bottom-2 left-2 right-2'>
									<Button
										type='button'
										variant='secondary'
										size='sm'
										className='w-full h-7 text-xs opacity-0 group-hover:opacity-100 transition-opacity'
										onClick={() => setPrimaryImage(index)}
										disabled={disabled || uploading}
									>
										Set as Primary
									</Button>
								</div>
							)}
						</div>
					))}
				</div>
			)}

			{/* Info */}
			{images.length === 0 && (
				<p className='text-xs text-gray-500'>
					Upload product images to make your listings more attractive. The first
					image will be used as the primary display image.
				</p>
			)}
		</div>
	)
}

export default ImageUpload
