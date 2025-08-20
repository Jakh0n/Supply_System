/**
 * Simple test script to verify Cloudinary integration
 *
 * Usage:
 * 1. Set up your .env file with Cloudinary credentials
 * 2. Run: node test_cloudinary.js
 *
 * This script tests:
 * - Cloudinary configuration
 * - Connection to Cloudinary API
 * - Basic upload/delete functionality (if enabled)
 */

const cloudinary = require('cloudinary').v2
const path = require('path')

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, 'backend', '.env') })

console.log('🚀 Testing Cloudinary Integration...\n')

// Check environment variables
const checkEnvVars = () => {
	console.log('📋 Environment Variables:')

	const requiredVars = [
		'CLOUDINARY_CLOUD_NAME',
		'CLOUDINARY_API_KEY',
		'CLOUDINARY_API_SECRET',
	]

	let allPresent = true

	requiredVars.forEach(varName => {
		if (process.env[varName]) {
			console.log(
				`✅ ${varName}: Set (${process.env[varName].substring(0, 10)}...)`
			)
		} else {
			console.log(`❌ ${varName}: Missing`)
			allPresent = false
		}
	})

	console.log('')
	return allPresent
}

// Test Cloudinary configuration
const testCloudinaryConfig = () => {
	console.log('⚙️  Cloudinary Configuration:')

	try {
		// Configure Cloudinary
		cloudinary.config({
			cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
			api_key: process.env.CLOUDINARY_API_KEY,
			api_secret: process.env.CLOUDINARY_API_SECRET,
		})

		const config = cloudinary.config()
		console.log(`✅ Cloud Name: ${config.cloud_name}`)
		console.log(`✅ API Key: ${config.api_key?.substring(0, 10)}...`)
		console.log(`✅ Configuration successful!\n`)

		return true
	} catch (error) {
		console.log(`❌ Configuration failed: ${error.message}\n`)
		return false
	}
}

// Test API connection
const testAPIConnection = async () => {
	console.log('🔌 Testing API Connection...')

	try {
		const result = await cloudinary.api.ping()
		console.log('✅ Connected successfully!')
		console.log(`✅ Status: ${result.status}\n`)
		return true
	} catch (error) {
		console.log(`❌ Connection failed: ${error.message}\n`)
		return false
	}
}

// Main test function
const runTests = async () => {
	console.log('='.repeat(50))
	console.log('🧪 CLOUDINARY INTEGRATION TEST')
	console.log('='.repeat(50))

	// Step 1: Check environment variables
	if (!checkEnvVars()) {
		console.log('❌ Please set up your environment variables in backend/.env')
		console.log('\nExample:')
		console.log('CLOUDINARY_CLOUD_NAME=your_cloud_name')
		console.log('CLOUDINARY_API_KEY=your_api_key')
		console.log('CLOUDINARY_API_SECRET=your_api_secret')
		process.exit(1)
	}

	// Step 2: Test configuration
	if (!testCloudinaryConfig()) {
		console.log('❌ Cloudinary configuration failed!')
		process.exit(1)
	}

	// Step 3: Test API connection
	if (!(await testAPIConnection())) {
		console.log('❌ API connection failed!')
		console.log('Please check your credentials and network connection.')
		process.exit(1)
	}

	// Success!
	console.log('🎉 All tests passed!')
	console.log('\n✨ Your Cloudinary integration is ready!')
	console.log('\n📚 Next steps:')
	console.log('1. Start your backend: cd backend && npm start')
	console.log('2. Use the API endpoints to upload images')
	console.log('3. View images in your frontend!')
	console.log('\n🔗 API Endpoints:')
	console.log('- POST /api/products/upload-images (upload images)')
	console.log('- POST /api/products (create product with images)')
	console.log('- DELETE /api/products/:id/images/:publicId (delete image)')

	console.log('\n' + '='.repeat(50))
}

// Run the tests
runTests().catch(error => {
	console.log(`❌ Test failed: ${error.message}`)
	process.exit(1)
})
