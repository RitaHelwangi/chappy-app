import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Button } from '../components/Button'
import '../styles/index.css'
import '../styles/Home.css'

const LS_KEY = 'chappy-token'

export function HomePage() {
	const navigate = useNavigate()
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
				localStorage.setItem(LS_KEY, result.token)
				navigate('/channels')
			} else {
				setMessage(result.error || 'Login failed')
			}
		} catch (error) {
			setMessage('Connection error')
		}
		setLoading(false)
	}

	return (
		<div className="home-container">
			<div className="card home-card">
				<h1 className="home-title">Chappy</h1>
				<p className="text-secondary home-subtitle">Connect with your community</p>
				
				<form className="form" onSubmit={handleSubmit}>
					<div>
						<label htmlFor="username" className="text-secondary home-label">Username</label>
						<input 
							id="username"
							name="username" 
							className="input" 
							placeholder="Enter your name" 
							required 
						/>
					</div>
					
					<div>
						<label htmlFor="password" className="text-secondary home-label">Password</label>
						<input 
							id="password"
							name="password" 
							type="password"
							className="input" 
							placeholder="Enter your password" 
							required 
						/>
					</div>
					
					<Button type="submit" loading={loading} className="btn">
						Login
					</Button>
				</form>
				
				{message && <p className="error home-error">{message}</p>}
				
				<div className="home-divider"><span>or</span></div>
				
				<Button onClick={() => navigate('/register')} className="btn btn-secondary">
					Create Account
				</Button>
				
				<div className="home-divider-small"><span>or</span></div>
				
				<Button onClick={() => navigate('/channels')} className="btn btn-outline">
					Continue as Guest
				</Button>
				<p className="text-secondary guest-description">
					Browse channels with limited features. Login for full access.
				</p>
			</div>
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


