export type WorkerDateFilter = 'all' | 'today' | 'yesterday' | 'weekly'

const getTodayDate = (): string => new Date().toISOString().split('T')[0]

const getYesterdayDate = (): string => {
	const yesterday = new Date()
	yesterday.setDate(yesterday.getDate() - 1)
	return yesterday.toISOString().split('T')[0]
}

const getWeeklyStartDate = (): string => {
	const today = new Date()
	const firstDay = today.getDate() - today.getDay()
	const weekStart = new Date(today.setDate(firstDay))
	return weekStart.toISOString().split('T')[0]
}

export function getDateFilterValue(
	filter: WorkerDateFilter
): string | undefined {
	switch (filter) {
		case 'today':
			return getTodayDate()
		case 'yesterday':
			return getYesterdayDate()
		case 'weekly':
			return getWeeklyStartDate()
		default:
			return undefined
	}
}
