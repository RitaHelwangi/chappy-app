import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router'
import type { Message } from '../data/types'
import { Button } from '../components/Button'

function Chat() {
    const { channelId } = useParams<{ channelId: string }>()
    const [messages, setMessages] = useState<Message[]>([])
    const [newMessage, setNewMessage] = useState('')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [isPrivateChannel, setIsPrivateChannel] = useState(false)

    useEffect(() => {
        const token = localStorage.getItem('chappy-token')
        setIsAuthenticated(!!token)
    }, [])

    useEffect(() => {
        if (!channelId) return

        const getMessages = async () => {
            setLoading(true)
            const token = localStorage.getItem('chappy-token')
            const headers: Record<string, string> = {}
            if (token) headers['Authorization'] = `Bearer ${token}`

            try {
                const response = await fetch(`/api/messages/${channelId}`, { headers })
                const data = await response.json()

                if (data.success) {
                    setMessages(data.messages)
                    setIsPrivateChannel(data.channel?.isPrivate || false)
                } else if (response.status === 401 || response.status === 403) {
                    setIsPrivateChannel(true)
                    setMessages([])
                } else {
                    setError(data.error || 'Failed to load messages')
                }
            } catch {
                setError('Failed to connect to server')
            } finally {
                setLoading(false)
            }
        }

        getMessages()
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

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            sendMessage()
        }
    }

    const renderInputArea = (enabled: boolean, placeholder: string) => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
                placeholder={placeholder}
                value={enabled ? newMessage : ''}
                onChange={enabled ? (e: React.ChangeEvent<HTMLInputElement>) => setNewMessage(e.target.value) : undefined}
                onKeyPress={enabled ? handleKeyPress : undefined}
                disabled={!enabled}
                style={{ flex: 1, backgroundColor: enabled ? '' : '#f5f5f5', color: enabled ? '' : '#666' }}
            />
            <Button 
                onClick={enabled ? sendMessage : undefined} 
                disabled={!enabled || !newMessage.trim()}
                style={enabled ? {} : { backgroundColor: '#ccc', color: '#666' }}
            >
                {enabled ? 'Send' : <Link to="/login" style={{ color: 'inherit', textDecoration: 'none' }}>Login</Link>}
            </Button>
        </div>
    )

    if (loading) return <div>Loading...</div>
    if (error) return <div>Error: {error}</div>



    return (
        <div>
            <h2>{isPrivateChannel ? '🔒' : '🔓'} #{channelId}</h2>
            
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

            {renderInputArea(isPrivateChannel ? isAuthenticated : true, isAuthenticated ? 'Type your message...' : 'Login to send messages')}
        </div>
    )
}

export default Chat
