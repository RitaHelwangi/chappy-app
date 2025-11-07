import { useState, useEffect } from 'react'
import { Button } from '../components/Button'
import type { Channel } from '../data/types'

export function ChannelsPage() {
	const [channels, setChannels] = useState<Channel[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')

	useEffect(() => {
		const fetchChannels = async () => {
			try {
				setLoading(true)
				const res = await fetch('/api/channels')
				const result = await res.json()
				
				if (result.success) {
					setChannels(result.channels)
					console.log(`Loaded ${result.channels.length} channels:`, result.channels)
				} else {
					setError(result.error || 'Failed to load channels')
				}
			} catch (err) {
				setError('Connection error')
				console.error(' Failed to fetch channels:', err)
			} finally {
				setLoading(false)
			}
		}

		fetchChannels()
	}, [])

	const handleJoinChannel = (channelId: string) => {
		console.log(`Joining channel: ${channelId}`)
		// TODO: implement join logic
	}

	if (loading) {
		return (
			<div>
				<h2>Channels</h2>
				<p>Loading channels...</p>
			</div>
		)
	}

	if (error) {
		return (
			<div>
				<h2>Channels</h2>
				<p style={{ color: 'red', textDecoration: 'underline' }}>{error}</p>
			</div>
		)
	}

	return (
		<div>
			<h2>Channels</h2>
			<p>Available channels:</p>
			
			{channels.length === 0 ? (
				<p>No channels found.</p>
			) : (
				channels.map(channel => (
					<div key={channel.id} style={{ marginBottom: '15px', padding: '10px', border: '1px solid #ddd' }}>
						<h3>{channel.name}</h3>
						<p>{channel.isLocked ? '🔒 Locked' : '🔓 Open'}</p>
						<Button onClick={() => handleJoinChannel(channel.id)}>
							Join {channel.name}
						</Button>
					</div>
				))
			)}
		</div>
	)
}