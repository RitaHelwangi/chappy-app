export function formatDateTime(timestamp: string) {
	const date = new Date(timestamp)
	const today = new Date()
	const yesterday = new Date(today)
	yesterday.setDate(yesterday.getDate() - 1)
	
	const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase()
	
	if (date.toDateString() === today.toDateString()) {
		return time
	} else if (date.toDateString() === yesterday.toDateString()) {
		return `Yesterday at ${time}`
	} else {
		return `${date.toLocaleDateString()} ${time}`
	}
}
