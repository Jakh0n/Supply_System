'use client'

import ProtectedRoute from '@/components/shared/ProtectedRoute'

export default function EditorLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return <ProtectedRoute requiredRole='editor'>{children}</ProtectedRoute>
}
