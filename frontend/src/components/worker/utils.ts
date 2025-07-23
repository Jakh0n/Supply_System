import { Order, OrderStatus } from '@/types'
import { CheckCircle, Clock, Package, XCircle } from 'lucide-react'
import React from 'react'

// Helper function to format date
export const formatDate = (dateString: string): string => {
	return new Date(dateString).toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
	})
}

// Helper function to get status display
export const getStatusDisplay = (status: OrderStatus) => {
	switch (status) {
		case 'pending':
			return {
				icon: React.createElement(Clock, {
					className: 'h-3 w-3 sm:h-4 sm:w-4',
				}),
				label: 'Pending',
				color: 'bg-orange-100 text-orange-800',
			}
		case 'approved':
			return {
				icon: React.createElement(CheckCircle, {
					className: 'h-3 w-3 sm:h-4 sm:w-4',
				}),
				label: 'Approved',
				color: 'bg-green-100 text-green-800',
			}
		case 'rejected':
			return {
				icon: React.createElement(XCircle, {
					className: 'h-3 w-3 sm:h-4 sm:w-4',
				}),
				label: 'Rejected',
				color: 'bg-red-100 text-red-800',
			}
		case 'completed':
			return {
				icon: React.createElement(Package, {
					className: 'h-3 w-3 sm:h-4 sm:w-4',
				}),
				label: 'Completed',
				color: 'bg-blue-100 text-blue-800',
			}
		default:
			return {
				icon: React.createElement(Clock, {
					className: 'h-3 w-3 sm:h-4 sm:w-4',
				}),
				label: 'Unknown',
				color: 'bg-gray-100 text-gray-800',
			}
	}
}

// Helper function to get total quantity from order
export const getTotalQuantity = (order: Order): number => {
	return order.items.reduce((total: number, item) => total + item.quantity, 0)
}
