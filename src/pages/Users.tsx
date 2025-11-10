import { useState, useEffect } from 'react'
import { Link } from 'react-router'

interface User {
	id: string
	username: string
}

function getCurrentUsername(): string {
	const token = localStorage.getItem('chappy-token')
	if (!token) return ''
	
	try {
		return JSON.parse(atob(token.split('.')[1])).username || ''
	} catch {
		return ''
	}
}

export function UsersPage() {
	const [users, setUsers] = useState<User[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')
	const currentUsername = getCurrentUsername()
	const isLoggedIn = !!currentUsername

	useEffect(() => {
		fetch('/api/users')
			.then(res => res.json())
			.then(data => {
				if (data.success) {
					const filteredUsers = isLoggedIn 
						? data.users.filter((user: User) => user.username !== currentUsername)
						: data.users
					setUsers(filteredUsers)
				} else {
					setError(data.error || 'Failed to load users')
				}
			})
			.catch(() => setError('Connection error'))
			.finally(() => setLoading(false))
	}, [currentUsername, isLoggedIn])

	if (loading) return <div>Loading users...</div>
	if (error) return <div>Error: {error}</div>

	return (
		<div>
			<h2>Users</h2>
			{users.length === 0 ? (
				<p>No users available.</p>
			) : (
				users.map(user => (
					<div key={user.id} style={{ marginBottom: '0.5rem' }}>
						@{user.username} | {isLoggedIn ? (
							<Link to={`/dm/${user.username}`}>Send DM</Link>
						) : (
							<span style={{ color: '#666' }}>Login to send DM</span>
						)}
					</div>
				))
			)}
		</div>
	)
}