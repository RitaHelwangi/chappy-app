import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router'
import type { Message } from '../data/types'
import { Button } from '../components/Button'
import { formatDateTime } from '../utils/dateFormat'
import '../styles/index.css'
import '../styles/Chat.css'

function Chat() {
    const { channelId } = useParams<{ channelId: string }>()
    const navigate = useNavigate()
    const [messages, setMessages] = useState<Message[]>([])
    const [newMessage, setNewMessage] = useState('')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [isPrivateChannel, setIsPrivateChannel] = useState(false)
    const [channelName, setChannelName] = useState('')
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

    useEffect(() => {
        const token = localStorage.getItem('chappy-token')
        setIsAuthenticated(!!token)
    }, [])

    useEffect(() => {
        if (!channelId) return

        const loadMessages = async () => {
            const token = localStorage.getItem('chappy-token')
            const headers: Record<string, string> = {}
            if (token) headers['Authorization'] = `Bearer ${token}`

            try {
                const response = await fetch(`/api/messages/${channelId}`, { headers })
                const data = await response.json()

                if (data.success) {
                    setMessages(data.messages)
                    setIsPrivateChannel(data.channel?.isPrivate || false)
                    setChannelName(data.channel?.name || channelId || '')
                    setLoading(false)
                } else if (response.status === 401 || response.status === 403) {
                    setIsPrivateChannel(true)
                    setMessages([])
                    setLoading(false)
                } else {
                    setError(data.error || 'Failed to load messages')
                }
            } catch {
                setError('Failed to connect to server')
            }
        }

        loadMessages()
        const timer = setInterval(loadMessages, 3000)
        return () => clearInterval(timer)
    }, [channelId])

    const sendMessage = async () => {
        if (!newMessage.trim() || !channelId) return
        if (isPrivateChannel && !isAuthenticated) return

        const token = localStorage.getItem('chappy-token')
        const headers: Record<string, string> = { 'Content-Type': 'application/json' }
        if (token) headers['Authorization'] = `Bearer ${token}`

        try {
            const response = await fetch('/api/messages', {
                method: 'POST',
                headers,
                body: JSON.stringify({ channelId, text: newMessage.trim() })
            })
            const data = await response.json()

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

    const deleteChannel = async () => {
        const token = localStorage.getItem('chappy-token')
        try {
            const res = await fetch(`/api/channels/${channelId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const data = await res.json()

            if (data.success) {
                navigate('/channels')
            } else {
                setError(data.error || 'Failed to delete channel')
            }
        } catch {
            setError('Failed to delete channel')
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            sendMessage()
        }
    }

    const renderInputArea = (enabled: boolean, placeholder: string) => (
        <div className="chat-input-area">
            <input
                className="input chat-input"
                placeholder={placeholder}
                value={enabled ? newMessage : ''}
                onChange={enabled ? (e) => setNewMessage(e.target.value) : undefined}
                onKeyPress={enabled ? handleKeyPress : undefined}
                disabled={!enabled}
            />
            <Button 
                onClick={enabled ? sendMessage : undefined} 
                disabled={!enabled || !newMessage.trim()}
                className="btn"
            >
                {enabled ? 'Send' : <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>Login</Link>}
            </Button>
        </div>
    )

    if (loading) return <div className="loading-spinner">Loading...</div>
    if (error) return <div className="error">{error}</div>

    return (
        <div className="chat-container">
            <div className="chat-header">
                <Link to="/channels" className="chat-back-link">← Back</Link>
                <h2 className="chat-title">{isPrivateChannel ? '🔒' : '🍿'} #{channelName || channelId}</h2>
                {isAuthenticated && !showDeleteConfirm && (
                    <button onClick={() => setShowDeleteConfirm(true)} className="chat-delete-btn" title="Delete channel">
                        🗑️
                    </button>
                )}
                {showDeleteConfirm && (
                    <div className="chat-delete-confirm">
                        <span>Delete?</span>
                        <button onClick={deleteChannel} className="chat-confirm-link">Yes</button>
                        <button onClick={() => setShowDeleteConfirm(false)} className="chat-confirm-link">No</button>
                    </div>
                )}
            </div>
            
            <div className="chat-messages">
                {messages.length === 0 ? (
                    <div className="chat-empty">No messages yet. Start the conversation!</div>
                ) : (
                    messages.map((message) => (
                        <div key={message.id} className="chat-message">
                            <div className="user-avatar">
                                {message.sender.charAt(0).toUpperCase()}
                            </div>
                            <div className="chat-message-content">
                                <div className="chat-message-header">
                                    <span className="chat-sender">{message.sender}</span>
                                    <span className="chat-time">{formatDateTime(message.time)}</span>
                                </div>
                                <div className="chat-text">{message.text}</div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {renderInputArea(isPrivateChannel ? isAuthenticated : true, isAuthenticated ? 'Type your message...' : 'Login to send messages')}
        </div>
    )
}

export default Chat
