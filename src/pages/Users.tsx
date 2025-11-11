import { useState, useEffect } from 'react'
import { Link } from 'react-router'
import '../styles/index.css'
import '../styles/Users.css'

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
	const [filteredUsers, setFilteredUsers] = useState<User[]>([])
	const [searchTerm, setSearchTerm] = useState('')
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')
	const currentUsername = getCurrentUsername()
	const isLoggedIn = !!currentUsername

	useEffect(() => {
		fetch('/api/users')
			.then(res => res.json())
			.then(data => {
				if (data.success) {
					const filtered = isLoggedIn 
						? data.users.filter((user: User) => user.username !== currentUsername)
						: data.users
					setUsers(filtered)
					setFilteredUsers(filtered)
				} else {
					setError(data.error || 'Failed to load users')
				}
			})
			.catch(() => setError('Connection error'))
			.finally(() => setLoading(false))
	}, [currentUsername, isLoggedIn])

	useEffect(() => {
		const filtered = users.filter(user => 
			user.username.toLowerCase().includes(searchTerm.toLowerCase())
		)
		setFilteredUsers(filtered)
	}, [users, searchTerm])

	if (loading) return <div className="loading-spinner">Loading users...</div>
	if (error) return <div className="error">{error}</div>

	return (
		<div className="users-container">
			<div className="users-header">
				<Link to="/channels" className="users-back-link">← Back</Link>
				<h2 className="users-title">👥 Users</h2>
			</div>

			<div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
				<input
					className="input"
					placeholder="Search users..."
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					style={{ flex: 1, minWidth: '200px' }}
				/>
				{!isLoggedIn && (
					<Link to="/" className="user-action">
						Login to Send DMs
					</Link>
				)}
			</div>

			{filteredUsers.length === 0 ? (
				<div className="users-empty">
					{searchTerm ? `No users found matching "${searchTerm}"` : 'No users available.'}
				</div>
			) : (
				<div className="users-list">
					{filteredUsers.map(user => (
						<div key={user.id} className="user-item">
							<div className="user-info">
								<div className="user-avatar">
									{user.username.charAt(0).toUpperCase()}
								</div>
								<span className="user-name">@{user.username}</span>
							</div>
							{isLoggedIn && (
								<Link to={`/dm/${user.username}`} className="user-action">
									Send DM
								</Link>
							)}
						</div>
					))}
				</div>
			)}
		</div>
	)
}