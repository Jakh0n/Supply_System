'use client'

import { ReactNode } from 'react'
import EditorHeader from './EditorHeader'
import { editorMainPadding } from './editorUi'

interface EditorShellProps {
	username: string
	onLogout: () => void
	children: ReactNode
}

export default function EditorShell({
	username,
	onLogout,
	children,
}: EditorShellProps) {
	return (
		<div className={`min-h-screen bg-gray-50 ${editorMainPadding}`}>
			<EditorHeader username={username} onLogout={onLogout} />
			<main className='max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6 lg:py-8'>
				{children}
			</main>
		</div>
	)
}
