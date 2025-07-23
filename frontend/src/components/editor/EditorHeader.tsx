import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'
import Image from 'next/image'

interface EditorHeaderProps {
	username: string
	onLogout: () => void
}

const EditorHeader: React.FC<EditorHeaderProps> = ({ username, onLogout }) => {
	return (
		<header className='bg-white shadow-sm border-b'>
			<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
				<div className='flex justify-between items-center h-14 sm:h-16'>
					<div className='flex items-center min-w-0 flex-1'>
						<Image
							src='/crown.png'
							alt='King Kebab Supply'
							width={32}
							height={32}
							className='h-6 w-6 sm:h-8 sm:w-8 mr-2 sm:mr-3 flex-shrink-0'
						/>
						<div className='min-w-0 flex-1'>
							<h1 className='text-lg sm:text-xl font-semibold text-gray-900 truncate'>
								Editor Dashboard
							</h1>
							<p className='text-xs sm:text-sm text-gray-500 truncate'>
								Welcome back, {username}
							</p>
						</div>
					</div>
					<Button
						variant='outline'
						onClick={onLogout}
						size='sm'
						className='flex items-center gap-1 sm:gap-2 ml-2 flex-shrink-0'
					>
						<LogOut className='h-3 w-3 sm:h-4 sm:w-4' />
						<span className='hidden sm:inline'>Logout</span>
					</Button>
				</div>
			</div>
		</header>
	)
}

export default EditorHeader
