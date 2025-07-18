const express = require('express')
const { body, validationResult } = require('express-validator')
const Product = require('../models/Product')
const { authenticate, requireAdmin } = require('../middleware/auth')

const router = express.Router()

// Get all products (accessible to all authenticated users)
router.get('/', authenticate, async (req, res) => {
	try {
		const { category, search, active } = req.query
		const filter = {}

		// Filter by active status - only apply filter if explicitly specified
		if (active !== undefined && active !== 'all') {
			filter.isActive = active === 'true'
		}

		// Filter by category
		if (category && category !== 'all') {
			filter.category = category
		}

		// Search functionality
		if (search) {
			filter.$or = [
				{ name: { $regex: search, $options: 'i' } },
				{ description: { $regex: search, $options: 'i' } },
				{ supplier: { $regex: search, $options: 'i' } },
			]
		}

		const products = await Product.find(filter)
			.populate('createdBy', 'username')
			.sort({ name: 1 })

		res.json({
			products,
			total: products.length,
		})
	} catch (error) {
		console.error('Get products error:', error)
		res.status(500).json({ message: 'Server error fetching products' })
	}
})

// Get single product by ID
router.get('/:id', authenticate, async (req, res) => {
	try {
		const product = await Product.findById(req.params.id).populate(
			'createdBy',
			'username'
		)

		if (!product) {
			return res.status(404).json({ message: 'Product not found' })
		}

		res.json({ product })
	} catch (error) {
		console.error('Get product error:', error)
		res.status(500).json({ message: 'Server error fetching product' })
	}
})

// Create new product (admin only)
router.post(
	'/',
	authenticate,
	requireAdmin,
	[
		body('name')
			.notEmpty()
			.withMessage('Product name is required')
			.isLength({ max: 100 })
			.withMessage('Product name cannot exceed 100 characters'),
		body('category')
			.isIn([
				'food',
				'beverages',
				'cleaning',
				'equipment',
				'packaging',
				'other',
			])
			.withMessage('Invalid category'),
		body('unit')
			.isIn([
				'kg',
				'g',
				'l',
				'ml',
				'pieces',
				'boxes',
				'bottles',
				'cans',
				'packets',
			])
			.withMessage('Invalid unit'),
		body('description')
			.optional()
			.isLength({ max: 500 })
			.withMessage('Description cannot exceed 500 characters'),
		body('supplier')
			.optional()
			.isLength({ max: 100 })
			.withMessage('Supplier name cannot exceed 100 characters'),
		body('price')
			.optional()
			.isNumeric()
			.withMessage('Price must be a number')
			.isFloat({ min: 0 })
			.withMessage('Price must be a positive number'),
	],
	async (req, res) => {
		try {
			const errors = validationResult(req)
			if (!errors.isEmpty()) {
				return res.status(400).json({
					message: 'Validation failed',
					errors: errors.array(),
				})
			}

			const { name, category, unit, description, supplier, price } = req.body

			// Check if product with same name already exists
			const existingProduct = await Product.findOne({
				name: { $regex: new RegExp(`^${name}$`, 'i') },
			})

			if (existingProduct) {
				return res
					.status(400)
					.json({ message: 'Product with this name already exists' })
			}

			const product = new Product({
				name,
				category,
				unit,
				description,
				supplier,
				price,
				createdBy: req.user._id,
			})

			await product.save()
			await product.populate('createdBy', 'username')

			res.status(201).json({
				message: 'Product created successfully',
				product,
			})
		} catch (error) {
			console.error('Create product error:', error)
			res.status(500).json({ message: 'Server error creating product' })
		}
	}
)

// Update product (admin only)
router.put(
	'/:id',
	authenticate,
	requireAdmin,
	[
		body('name')
			.optional()
			.notEmpty()
			.withMessage('Product name cannot be empty')
			.isLength({ max: 100 })
			.withMessage('Product name cannot exceed 100 characters'),
		body('category')
			.optional()
			.isIn([
				'food',
				'beverages',
				'cleaning',
				'equipment',
				'packaging',
				'other',
			])
			.withMessage('Invalid category'),
		body('unit')
			.optional()
			.isIn([
				'kg',
				'g',
				'l',
				'ml',
				'pieces',
				'boxes',
				'bottles',
				'cans',
				'packets',
			])
			.withMessage('Invalid unit'),
		body('description')
			.optional()
			.isLength({ max: 500 })
			.withMessage('Description cannot exceed 500 characters'),
		body('supplier')
			.optional()
			.isLength({ max: 100 })
			.withMessage('Supplier name cannot exceed 100 characters'),
		body('price')
			.optional()
			.isNumeric()
			.withMessage('Price must be a number')
			.isFloat({ min: 0 })
			.withMessage('Price must be a positive number'),
	],
	async (req, res) => {
		try {
			const errors = validationResult(req)
			if (!errors.isEmpty()) {
				return res.status(400).json({
					message: 'Validation failed',
					errors: errors.array(),
				})
			}

			const product = await Product.findById(req.params.id)
			if (!product) {
				return res.status(404).json({ message: 'Product not found' })
			}

			// Check if new name conflicts with existing product
			if (req.body.name && req.body.name !== product.name) {
				const existingProduct = await Product.findOne({
					name: { $regex: new RegExp(`^${req.body.name}$`, 'i') },
					_id: { $ne: req.params.id },
				})

				if (existingProduct) {
					return res
						.status(400)
						.json({ message: 'Product with this name already exists' })
				}
			}

			const updatedProduct = await Product.findByIdAndUpdate(
				req.params.id,
				req.body,
				{ new: true, runValidators: true }
			).populate('createdBy', 'username')

			res.json({
				message: 'Product updated successfully',
				product: updatedProduct,
			})
		} catch (error) {
			console.error('Update product error:', error)
			res.status(500).json({ message: 'Server error updating product' })
		}
	}
)

// Toggle product active status (admin only)
router.patch(
	'/:id/toggle-status',
	authenticate,
	requireAdmin,
	async (req, res) => {
		try {
			const product = await Product.findById(req.params.id)
			if (!product) {
				return res.status(404).json({ message: 'Product not found' })
			}

			product.isActive = !product.isActive
			await product.save()
			await product.populate('createdBy', 'username')

			res.json({
				message: `Product ${
					product.isActive ? 'activated' : 'deactivated'
				} successfully`,
				product,
			})
		} catch (error) {
			console.error('Toggle product status error:', error)
			res.status(500).json({ message: 'Server error updating product status' })
		}
	}
)

// Delete product (admin only)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
	try {
		const product = await Product.findById(req.params.id)
		if (!product) {
			return res.status(404).json({ message: 'Product not found' })
		}

		await Product.findByIdAndDelete(req.params.id)

		res.json({ message: 'Product deleted successfully' })
	} catch (error) {
		console.error('Delete product error:', error)
		res.status(500).json({ message: 'Server error deleting product' })
	}
})

// Get product categories
router.get('/meta/categories', authenticate, async (req, res) => {
	try {
		const categories = [
			'food',
			'beverages',
			'cleaning',
			'equipment',
			'packaging',
			'other',
		]
		res.json({ categories })
	} catch (error) {
		console.error('Get categories error:', error)
		res.status(500).json({ message: 'Server error fetching categories' })
	}
})

// Get product units
router.get('/meta/units', authenticate, async (req, res) => {
	try {
		const units = [
			'kg',
			'g',
			'l',
			'ml',
			'pieces',
			'boxes',
			'bottles',
			'cans',
			'packets',
		]
		res.json({ units })
	} catch (error) {
		console.error('Get units error:', error)
		res.status(500).json({ message: 'Server error fetching units' })
	}
})

module.exports = router
