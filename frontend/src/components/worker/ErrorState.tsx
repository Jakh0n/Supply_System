import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

interface ErrorStateProps {
	error: string
	onRetry?: () => void
	retryText?: string
}

const ErrorState = ({ error, onRetry, retryText }: ErrorStateProps) => {
	return (
		<div className='flex items-center justify-center h-64'>
			<div className='text-center'>
				<AlertCircle className='h-12 w-12 text-red-400 mx-auto mb-4' />
				<p className='text-red-600 mb-4'>{error}</p>
				{onRetry && (
					<Button onClick={onRetry} variant='outline'>
						{retryText}
					</Button>
				)}
			</div>
		</div>
	)
}

export default ErrorState
