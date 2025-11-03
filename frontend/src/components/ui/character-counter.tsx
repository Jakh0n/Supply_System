import React from 'react'

interface CharacterCounterProps {
	current: number
	max: number
	warningThreshold?: number // When to show warning (e.g., 90% of max)
}

/**
 * Character counter component with visual feedback
 * Shows warning color when approaching limit
 */
export const CharacterCounter: React.FC<CharacterCounterProps> = ({
	current,
	max,
	warningThreshold = 0.9, // 90% of max by default
}) => {
	const percentage = current / max
	const isOverLimit = current > max
	const isWarning = percentage >= warningThreshold && !isOverLimit

	const getColorClass = () => {
		if (isOverLimit) return 'text-red-500'
		if (isWarning) return 'text-orange-500'
		return 'text-gray-500'
	}

	return (
		<p className={`text-xs ml-auto ${getColorClass()}`}>
			{current}/{max}
		</p>
	)
}

interface CharacterCounterWithErrorProps extends CharacterCounterProps {
	showError?: boolean
	errorMessage?: string
}

/**
 * Character counter with error message display
 */
export const CharacterCounterWithError: React.FC<
	CharacterCounterWithErrorProps
> = ({ current, max, warningThreshold, showError, errorMessage }) => {
	return (
		<div className='flex justify-between items-center mt-1'>
			{showError && errorMessage && (
				<p className='text-xs text-red-500'>{errorMessage}</p>
			)}
			<CharacterCounter
				current={current}
				max={max}
				warningThreshold={warningThreshold}
			/>
		</div>
	)
}
