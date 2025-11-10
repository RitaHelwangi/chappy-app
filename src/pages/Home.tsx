import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Button } from '../components/Button'

const LS_KEY = 'chappy-token'

export function HomePage() {
	const navigate = useNavigate()

	return (
		<div>
			<p>Connect with your community</p>
			<nav>
				<Button onClick={() => navigate('/login')}>Login</Button>
				{' | '}
				<Button onClick={() => navigate('/register')}>Register</Button>
				{' | '}
				<Button onClick={() => navigate('/channels')}>View Channels</Button>
				{' | '}
				<Button onClick={() => navigate('/users')}>View Users</Button>
			</nav>
		</div>
	)
}

export function LoginPage() {
	const [loading, setLoading] = useState(false)
	const [message, setMessage] = useState('')

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setLoading(true)
		
		const form = e.target as HTMLFormElement
		const username = (form.elements.namedItem('username') as HTMLInputElement).value
		const password = (form.elements.namedItem('password') as HTMLInputElement).value
		
		try {
			const res = await fetch('/api/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ username, password })
			})
			
			const result = await res.json()
			
			if (result.success) {
				console.log(`✅ User logged in successfully: ${username}`)
				console.log(`🎟️ Token received: ${result.token}`)
	
				const jwt: string = result.token
				localStorage.setItem(LS_KEY, jwt)
				
				form.reset()
			} else {
				const errorMsg = result.error || 'Login failed'
				console.error(`❌ Login failed: ${errorMsg}`)
				setMessage(errorMsg)
			}
		} catch (error) {
			console.error(`❌ Connection error during login:`, error)
		}
		setLoading(false)
	}

	return (
		<div>
			<h2>Login</h2>
			<form onSubmit={handleSubmit}>
				<input name="username" placeholder="Username" required />
				<input type="password" name="password" placeholder="Password" required />
				<Button type="submit" loading={loading}>Login</Button>
			</form>
			{message && <p style={{ color: 'red', textDecoration: 'underline' }}>{message}</p>}
		</div>
	)
}

export function RegisterPage() {
	const [loading, setLoading] = useState(false)
	const [message, setMessage] = useState('')

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setLoading(true)
		
		const form = e.target as HTMLFormElement
		const username = (form.elements.namedItem('username') as HTMLInputElement).value
		const password = (form.elements.namedItem('password') as HTMLInputElement).value
		
		try {
			const res = await fetch('/api/register', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ username, password })
			})
			
			const result = await res.json()
			
			if (result.success) {
				console.log(`✅ User registered successfully: ${username}`)
				
				const jwt: string = result.token
				localStorage.setItem(LS_KEY, jwt)
				
				form.reset()
			} else {
				const errorMsg = result.error || 'Registration failed'
				console.error(`❌ Registration failed: ${errorMsg}`)
				setMessage(errorMsg)
			}
		} catch (error) {
			console.error(`❌ Connection error during registration:`, error)
		}
		setLoading(false)
	}

	return (
		<div>
			<h2>Register</h2>
			<form onSubmit={handleSubmit}>
				<input name="username" placeholder="Username" required />
				<input type="password" name="password" placeholder="Password" required />
				<Button type="submit" loading={loading}>Register</Button>
			</form>
			{message && <p style={{ color: 'red', textDecoration: 'underline' }}>{message}</p>}
		</div>
	)
}
