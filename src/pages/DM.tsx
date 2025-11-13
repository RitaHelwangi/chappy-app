import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router'
import { Button } from '../components/Button'
import { formatDateTime } from '../utils/dateFormat'
import '../styles/index.css'
import '../styles/Chat.css'

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

		const loadMessages = () => {
			fetch(`/api/dm/${username}`, {
				headers: { 'Authorization': `Bearer ${token}` }
			})
				.then(res => res.json())
				.then(data => {
					if (data.success) {
						setMessages(data.messages)
						setLoading(false)
					} else {
						setError(data.error || 'Failed to load messages')
					}
				})
				.catch(() => setError('Failed to connect to server'))
		}

		loadMessages()
		const timer = setInterval(loadMessages, 3000)
		return () => clearInterval(timer)
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
			<div className="chat-container">
				<div className="chat-header">
					<h2 className="chat-title">Direct Messages</h2>
				</div>
				<div className="chat-empty">Please <Link to="/" className="chat-back-link">log in</Link> to access direct messages.</div>
			</div>
		)
	}

	if (loading) return <div className="loading-spinner">Loading...</div>
	if (error) return <div className="error">{error}</div>

	return (
		<div className="chat-container">
			<div className="chat-header">
				<Link to="/users" className="chat-back-link">← Back</Link>
				<h2 className="chat-title">💬 @{username}</h2>
			</div>
			
			<div className="chat-messages">
				{messages.length === 0 ? (
					<div className="chat-empty">No messages yet. Start the conversation!</div>
				) : (
					messages.map((message) => (
						<div key={message.id} className="chat-message">
							<div className="chat-message-header">
								<span className="chat-sender">{message.sender}</span>
								<span className="chat-time">{formatDateTime(message.time)}</span>
							</div>
							<div className="chat-text">{message.text}</div>
						</div>
					))
				)}
			</div>

			<div className="chat-input-area">
				<input
					className="input chat-input"
					placeholder={`Message @${username}...`}
					value={newMessage}
					onChange={(e) => setNewMessage(e.target.value)}
					onKeyPress={handleKeyPress}
				/>
				<Button onClick={sendDM} disabled={!newMessage.trim()} className="btn">
					Send
				</Button>
			</div>
		</div>
	)
}