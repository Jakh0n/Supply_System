import { Toaster } from '@/components/ui/sonner'
import { AuthProvider } from '@/contexts/AuthContext'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
	metadataBase: new URL('https://flami.org/'),
	title: 'King Kebab Supply System',
	description: 'Restaurant Supply Syztems',
	authors: [
		{
			name: 'Jakhon Yokubov',
			url: 'https://flami.org',
		},
	],
	icons: { icon: '/crown.png' },
	openGraph: {
		title: "FLAMI | Koreyada eng arzon kitoblar do'koni",
		description:
			"King Kebab Supply System - Streamline your restaurant's supply chain with our comprehensive management solution. Track inventory, manage orders, and analyze data across multiple branches.",
		type: 'website',
		url: 'https://flami.org',
		locale: 'kr-KR',
		images: '/working_hours.jpg',
		countryName: 'Korea',
		siteName: 'King Suplly System',
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
