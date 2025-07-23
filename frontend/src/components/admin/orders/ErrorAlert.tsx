import { AlertCircle } from 'lucide-react'

interface ErrorAlertProps {
	message: string
}

const ErrorAlert: React.FC<ErrorAlertProps> = ({ message }) => {
	return (
		<div className='bg-red-50 border border-red-200 rounded-md p-4'>
			<div className='flex'>
				<AlertCircle className='h-5 w-5 text-red-400 flex-shrink-0' />
				<div className='ml-3'>
					<p className='text-sm text-red-800'>{message}</p>
				</div>
			</div>
		</div>
	)
}

export default ErrorAlert
