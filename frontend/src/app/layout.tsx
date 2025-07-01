import { Toaster } from '@/components/ui/sonner'
import { AuthProvider } from '@/contexts/AuthContext'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
	title: 'RestaurantSupply - Supply Management System',
	description: 'A comprehensive supply management system for restaurants',
}

export default function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<html lang='en'>
			<body className={inter.className}>
				<AuthProvider>
					{children}
					<Toaster />
				</AuthProvider>
			</body>
		</html>
	)
}
