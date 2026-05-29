import { Toaster } from '@/components/ui/sonner'
import { AuthProvider } from '@/contexts/AuthContext'
import { routing } from '@/i18n/routing'
import QueryProvider from '@/providers/QueryProvider'
import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { Inter } from 'next/font/google'
import { notFound } from 'next/navigation'
import '../globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
	metadataBase: new URL('https://https://www.kingkebaborder.co.kr/'),
	title: '👑 King Kebab Supply System',
	description:
		'Restaurant Supply Management System - Professional Supply Chain Management',
	authors: [
		{
			name: 'Jakhon Yokubov',
			url: 'https://https://jakhon.dev',
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
		url: 'https://www.kingkebaborder.co.kr/',
		locale: 'en_US',
		images: '/crown.png',
		countryName: 'Korea',
		siteName: 'King Kebab Supply System',
		emails: 'info@kingkebaborder.co.kr',
	},
}

export function generateStaticParams() {
	return routing.locales.map(locale => ({ locale }))
}

export default async function LocaleLayout({
	children,
	params,
}: {
	children: React.ReactNode
	params: Promise<{ locale: string }>
}) {
	const { locale } = await params

	if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
		notFound()
	}

	const messages = await getMessages()

	return (
		<html lang={locale} suppressHydrationWarning>
			<body className={inter.className} suppressHydrationWarning>
				<NextIntlClientProvider messages={messages}>
					<AuthProvider>
						<QueryProvider>
							{children}
							<Toaster />
						</QueryProvider>
					</AuthProvider>
				</NextIntlClientProvider>
			</body>
		</html>
	)
}
