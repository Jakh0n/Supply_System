import { Toaster } from '@/components/ui/sonner'
import { AuthProvider } from '@/contexts/AuthContext'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
	metadataBase: new URL('https://flami.org/'),
	title: '👑 King Kebab Supply System',
	description:
		'Restaurant Supply Management System - Professional Supply Chain Management',
	authors: [
		{
			name: 'Jakhon Yokubov',
			url: 'https://flami.org',
		},
	],
	icons: {
		icon: [
			{ url: '/crown.png', sizes: '32x32', type: 'image/png' },
			{ url: '/crown.png', sizes: '16x16', type: 'image/png' },
			{ url: '/crown.png', sizes: '48x48', type: 'image/png' },
		],
		apple: [{ url: '/crown.png', sizes: '180x180', type: 'image/png' }],
		shortcut: '/crown.png',
	},
	manifest: '/manifest.json',
	openGraph: {
		title: 'King Kebab Supply System',
		description:
			"King Kebab Supply System - Streamline your restaurant's supply chain with our comprehensive management solution. Track inventory, manage orders, and analyze data across multiple branches.",
		type: 'website',
		url: 'https://flami.org',
		locale: 'kr-KR',
		images: '/crown.png',
		countryName: 'Korea',
		siteName: 'King Kebab Supply System',
		emails: 'info@flami.org',
	},
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
