import { useState, useEffect } from 'react'
import { Link } from 'react-router'
import type { Channel } from '../data/types'

export function ChannelsPage() {
	const [channels, setChannels] = useState<Channel[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')
	const [isAuthenticated, setIsAuthenticated] = useState(false)

	useEffect(() => {
		const token = localStorage.getItem('chappy-token')
		setIsAuthenticated(!!token)
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

	if (loading) return <div>Loading channels...</div>
	if (error) return <div>Error: {error}</div>

	return (
		<div>
			<h2>Channels</h2>
			{channels.length === 0 ? (
				<p>No channels found.</p>
			) : (
				channels.map(channel => (
					<div key={channel.id} style={{ marginBottom: '0.5rem' }}>
						{channel.isLocked && !isAuthenticated ? (
							<div>
								🔒 #{channel.name} | <span style={{ color: '#666' }}>This is a private channel. <Link to="/login">Please log in</Link> to view messages.</span>
							</div>
						) : (
							<Link to={`/chat/${channel.id}`}>
								{channel.isLocked ? '🔒' : '🔓'} #{channel.name}
							</Link>
						)}
					</div>
				))
			)}
		</div>
	)
}