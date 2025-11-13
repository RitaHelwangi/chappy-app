import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Button } from '../components/Button'
import '../styles/index.css'
import '../styles/Home.css'

const LS_KEY = 'chappy-token'

export function RegisterPage() {
	const navigate = useNavigate()
	const [loading, setLoading] = useState(false)
	const [message, setMessage] = useState('')

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setLoading(true)
		setMessage('') 
		
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
			
			if (res.ok && result.success) {
				localStorage.setItem(LS_KEY, result.token)
				navigate('/channels')
			} else {
				setMessage(result.error || 'Registration failed')
			}
		} catch (error) {
			setMessage('Connection error')
		}
		setLoading(false)
	}

	return (
		<div className="home-container">
			<div className="card home-card">
				<h1 className="home-title">Join Chappy</h1>
				<p className="text-secondary home-subtitle">Create your account and start connecting</p>
				
				<form className="form" onSubmit={handleSubmit}>
					<div>
						<label htmlFor="username" className="text-secondary home-label">Username</label>
						<input 
							id="username"
							name="username" 
							className="input" 
							placeholder="Choose a username" 
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
							placeholder="Create a password" 
							required 
						/>
					</div>
					
					<Button type="submit" loading={loading} className="btn">
						Create Account
					</Button>
				</form>
				
				{message && <p className="error home-error">{message}</p>}
				
				<div className="home-divider">or</div>
				
				<Button onClick={() => navigate('/')} className="btn btn-secondary">
					Back to Login
				</Button>
				
				<div className="home-divider-small">or</div>
				
				<Button onClick={() => navigate('/channels')} className="btn btn-outline">
					Continue as Guest
				</Button>
				<p className="text-secondary guest-description">
					Browse channels with limited features. Register for full access.
				</p>
			</div>
		</div>
	)
}