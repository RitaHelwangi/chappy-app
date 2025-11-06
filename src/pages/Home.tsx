import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Button } from '../components/Button'
import { Input } from '../components/Input'

export function HomePage() {
	const navigate = useNavigate()

	return (
		<div>
			<p>Connect with your community</p>
			<nav>
				<Button onClick={() => navigate('/register')}>Get Started</Button>
			</nav>
		</div>
	)
}



export function RegisterPage() {
	const [loading, setLoading] = useState(false)

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
				// Clear the form
				form.reset()
			} else {
				const errorMsg = result.error || 'Registration failed'
				console.error(`❌ Registration failed: ${errorMsg}`)
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
				<Input name="username" placeholder="Username" required />
				<Input type="password" name="password" placeholder="Password" required />
				<Button type="submit" loading={loading}>Register</Button>
			</form>
		</div>
	)
}
