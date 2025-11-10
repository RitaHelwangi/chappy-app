import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router'
import type { Message } from '../data/types'
import { Button } from '../components/Button'
import { Input } from '../components/Input'

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
            try {
                const response: Response = await fetch(`/api/messages/${channelId}`)
                const data = await response.json()

                if (data.success) {
                    setMessages(data.messages)
                    setIsPrivateChannel(data.channel?.isPrivate || false)
                } else {
                    setError(data.error || 'Failed to load messages')
                }
            } catch (err) {
                setError('Failed to connect to server')
            } finally {
                setLoading(false)
            }
        }

        getMessages()
    }, [channelId])

    const sendMessage = async () => {
        if (!newMessage.trim() || !channelId) return

        const token = localStorage.getItem('chappy-token')
        
        if (isPrivateChannel && !token) {
            setError('Please log in to send messages in private channels')
            return
        }

        const headers: Record<string, string> = { 'Content-Type': 'application/json' }
        if (token) headers['Authorization'] = `Bearer ${token}`

        try {
            const response: Response = await fetch('/api/messages', {
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
        } catch (err) {
            setError('Failed to send message')
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            sendMessage()
        }
    }

    if (loading) return <div>Loading...</div>
    if (error) return <div>Error: {error}</div>

    if (isPrivateChannel && !isAuthenticated) {
        return (
            <div>
                <h2>🔒 #{channelId}</h2>
                <p>This is a private channel. Please <Link to="/login">log in</Link> to access.</p>
            </div>
        )
    }

    const canSendMessages = isPrivateChannel ? isAuthenticated : true

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

            {canSendMessages ? (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Input
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        style={{ flex: 1 }}
                    />
                    <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                        Send
                    </Button>
                </div>
            ) : (
                <p>Please <Link to="/login">log in</Link> to send messages in this private channel.</p>
            )}
        </div>
    )
}

export default Chat
