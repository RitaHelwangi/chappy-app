import { useState, useEffect } from 'react'
import { Link } from 'react-router'

interface User {
	id: string
	username: string
}

export function UsersPage() {
	const [users, setUsers] = useState<User[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')

	useEffect(() => {
		const getAllUsers = async () => {
			setLoading(true)
			try {
				const response: Response = await fetch('/api/users')
				const data = await response.json()
				
				if (data.success) {
					setUsers(data.users)
				} else {
					setError(data.error || 'Failed to load users')
				}
			} catch (err) {
				setError('Connection error')
			} finally {
				setLoading(false)
			}
		}

		getAllUsers()
	}, [])

	if (loading) return <div>Loading users...</div>
	if (error) return <div>Error: {error}</div>

	return (
		<div>
			<h2>Users</h2>
			{users.length === 0 ? (
				<p>No users found.</p>
			) : (
				users.map(user => (
					<div key={user.id}>
						<Link to={`/user/${user.username}`}>
							@{user.username}
						</Link>
					</div>
				))
			)}
		</div>
	)
}