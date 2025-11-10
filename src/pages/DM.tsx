import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router'
import { Button } from '../components/Button'
import { Input } from '../components/Input'

interface DMMessage {
	id: string
	sender: string
	text: string
	time: string
}

export function DMPage() {
	const { username } = useParams<{ username: string }>()
	const [messages, setMessages] = useState<DMMessage[]>([])
	const [newMessage, setNewMessage] = useState('')
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')
	
	const token = localStorage.getItem('chappy-token')
	const isAuthenticated = !!token

	useEffect(() => {
		if (!username || !isAuthenticated) return

		fetch(`/api/dm/${username}`, {
			headers: { 'Authorization': `Bearer ${token}` }
		})
			.then(res => res.json())
			.then(data => {
				if (data.success) {
					setMessages(data.messages)
				} else {
					setError(data.error || 'Failed to load messages')
				}
			})
			.catch(() => setError('Failed to connect to server'))
			.finally(() => setLoading(false))
	}, [username, isAuthenticated, token])

	const sendDM = async () => {
		if (!newMessage.trim() || !username) return
		
		try {
			const res = await fetch('/api/dm', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`
				},
				body: JSON.stringify({ 
					receiverUsername: username, 
					text: newMessage.trim() 
				})
			})
			const data = await res.json()

			if (data.success) {
				setMessages(prev => [...prev, data.message])
				setNewMessage('')
			} else {
				setError(data.error || 'Failed to send message')
			}
		} catch {
			setError('Failed to send message')
		}
	}

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault()
			sendDM()
		}
	}

	if (!isAuthenticated) {
		return (
			<div>
				<h2>Direct Messages</h2>
				<p>Please <Link to="/login">log in</Link> to access direct messages.</p>
			</div>
		)
	}

	if (loading) return <div>Loading...</div>
	if (error) return <div>Error: {error}</div>

	return (
		<div>
			<h2>DM with @{username}</h2>
			
			<div style={{ height: '400px', overflowY: 'auto', border: '1px solid #ccc', padding: '1rem', marginBottom: '1rem' }}>
				{messages.length === 0 ? (
					<p>No messages yet. Start the conversation!</p>
				) : (
					messages.map((message) => (
						<div key={message.id} style={{ marginBottom: '1rem' }}>
							<strong>{message.sender}</strong>
							<span style={{ color: '#666', fontSize: '0.8rem', marginLeft: '0.5rem' }}>
								{new Date(message.time).toLocaleTimeString()}
							</span>
							<div>{message.text}</div>
						</div>
					))
				)}
			</div>

			<div style={{ display: 'flex', gap: '0.5rem' }}>
				<Input
					placeholder={`Message @${username}...`}
					value={newMessage}
					onChange={(e) => setNewMessage(e.target.value)}
					onKeyPress={handleKeyPress}
					style={{ flex: 1 }}
				/>
				<Button onClick={sendDM} disabled={!newMessage.trim()}>
					Send
				</Button>
			</div>
		</div>
	)
}