import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router'
import { Button } from '../components/Button'
import type { Channel } from '../data/types'
import '../styles/index.css'
import '../styles/Home.css'
import '../styles/Channels.css'
import '../styles/Chat.css'

export function ChannelsPage() {
	const navigate = useNavigate()
	const [channels, setChannels] = useState<Channel[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')
	const [isAuthenticated, setIsAuthenticated] = useState(false)
	const [username, setUsername] = useState('')
	const [newChannelName, setNewChannelName] = useState('')
	const [isPrivate, setIsPrivate] = useState(false)
	const [showCreateForm, setShowCreateForm] = useState(false)
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

	useEffect(() => {
		const token = localStorage.getItem('chappy-token')
		setIsAuthenticated(!!token)
		
		if (token) {
			try {
				const payload = JSON.parse(atob(token.split('.')[1]))
				setUsername(payload.username || '')
			} catch {
				setUsername('')
			}
		}
	}, [])

	useEffect(() => {
		const getAllChannels = async () => {
			setLoading(true)
			try {
				const response: Response = await fetch('/api/channels')
				const data = await response.json()
				
				if (data.success) {
					setChannels(data.channels)
				} else {
					setError(data.error || 'Failed to load channels')
				}
			} catch (err) {
				setError('Connection error')
			} finally {
				setLoading(false)
			}
		}

		getAllChannels()
	}, [])

	const createChannel = async () => {
		if (!newChannelName.trim()) return

		const token = localStorage.getItem('chappy-token')
		try {
			const res = await fetch('/api/channels', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`
				},
				body: JSON.stringify({ 
					name: newChannelName.trim(), 
					isLocked: isPrivate 
				})
			})
			const data = await res.json()

			if (data.success) {
				setChannels(prev => [...prev, data.channel])
				setNewChannelName('')
				setIsPrivate(false)
				setShowCreateForm(false)
			} else {
				setError(data.error || 'Failed to create channel')
			}
		} catch {
			setError('Failed to create channel')
		}
	}

	if (loading) return <div className="loading-spinner">Loading channels...</div>
	if (error) return <div className="error">{error}</div>

	return (
		<div className="home-container">
			<div className="card home-card" style={{ maxWidth: '600px' }}>
				{isAuthenticated && username && (
					<div style={{ textAlign: 'center', marginBottom: '1rem' }}>
						{!showDeleteConfirm ? (
							<div 
								className="user-avatar user-avatar-large" 
								onClick={() => setShowDeleteConfirm(true)}
								style={{ margin: '0 auto', cursor: 'pointer' }}
								title="Click to delete account"
							>
								{username.charAt(0).toUpperCase()}
							</div>
						) : (
							<div className="chat-delete-confirm">
								<span>Delete account?</span>
								<button 
									className="chat-confirm-link"
									onClick={async () => {
										try {
											const token = localStorage.getItem('chappy-token')
											const res = await fetch('/api/users/me', {
												method: 'DELETE',
												headers: { 'Authorization': `Bearer ${token}` }
											})
											const data = await res.json()
											
											if (data.success) {
												localStorage.removeItem('chappy-token')
												navigate('/')
											} else {
												setError('Failed to delete account')
												setShowDeleteConfirm(false)
											}
										} catch {
											setError('Failed to delete account')
											setShowDeleteConfirm(false)
										}
									}}
								>
									Yes
								</button>
								<button 
									className="chat-confirm-link"
									onClick={() => setShowDeleteConfirm(false)}
								>
									No
								</button>
							</div>
						)}
					</div>
				)}
				<h1 className="home-title">Channels</h1>
				<p className="text-secondary home-subtitle">
					{isAuthenticated ? `Welcome ${username || 'back'}! Choose a channel to join the conversation.` : 'Browse available channels. Login for full access to private channels.'}
				</p>

				{isAuthenticated && (
					<div className="create-channel-section">
						{!showCreateForm ? (
							<Button onClick={() => setShowCreateForm(true)} className="btn">
								+ Create Channel
							</Button>
						) : (
							<div className="card create-channel-form">
								<input
									className="input create-channel-input"
									placeholder="Channel name..."
									value={newChannelName}
									onChange={(e) => setNewChannelName(e.target.value)}
									onKeyPress={(e) => e.key === 'Enter' && createChannel()}
								/>
								<label className="create-channel-checkbox">
									<input
										type="checkbox"
										checked={isPrivate}
										onChange={(e) => setIsPrivate(e.target.checked)}
									/>
									<span>Private channel 🔒</span>
								</label>
								<div className="create-channel-buttons">
									<Button onClick={createChannel} disabled={!newChannelName.trim()} className="btn">
										Create
									</Button>
									<Button onClick={() => {
										setShowCreateForm(false)
										setNewChannelName('')
										setIsPrivate(false)
									}} className="btn btn-outline">
										Cancel
									</Button>
								</div>
							</div>
						)}
					</div>
				)}

				{channels.length === 0 ? (
					<p className="text-secondary">No channels found.</p>
				) : (
					<div className="channels-list">
						{channels.map(channel => (
							<div key={channel.id} className="channel-item">
								{channel.isLocked && !isAuthenticated ? (
									<div className="channel-locked">
										<div className="channel-info">
											<span className="channel-icon">🔒</span>
											<span className="channel-name">#{channel.name}</span>
										</div>
										<p className="channel-description text-secondary">
											This is a private channel. <Link to="/" className="channel-login-link">Login</Link> to access.
										</p>
									</div>
								) : (
									<Link to={`/chat/${channel.id}`} className="channel-link">
										<div className="channel-info">
											<span className="channel-icon">{channel.isLocked ? '🔒' : '🍿'}</span>
											<span className="channel-name">#{channel.name}</span>
										</div>
										<div className="channel-arrow">→</div>
									</Link>
								)}
							</div>
						))}
					</div>
				)}

				<div className="home-divider"><span>explore</span></div>

				<div className="channel-actions-single">
					<Button onClick={() => navigate('/users')} className="btn btn-secondary">
						View Users
					</Button>
					{isAuthenticated && (
						<Button onClick={() => {
							localStorage.removeItem('chappy-token')
							navigate('/')
						}} className="btn btn-outline channel-logout-btn">
							Logout
						</Button>
					)}
				</div>
			</div>
		</div>
	)
}